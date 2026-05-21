-- ─── 008: Negotiations, Escrow, Video Conference & Ratings ──────────────────

-- ── 1. Extend teacher_profiles with ratings & completed jobs ─────────────────
ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS avg_rating          numeric(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_ratings       int          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_jobs_completed int         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_earnings_ngn  numeric(14,2) DEFAULT 0;

-- ── 2. Job Negotiations table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_negotiations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id        uuid NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  job_id                uuid NOT NULL REFERENCES job_listings(id),
  teacher_id            uuid NOT NULL REFERENCES profiles(id),
  employer_id           uuid NOT NULL REFERENCES profiles(id),

  -- Current agreed / latest proposed terms
  agreed_rate_ngn       numeric(12,2),
  agreed_rate_type      text,          -- hourly|daily|weekly|monthly|per_term|fixed
  agreed_duration       text,          -- e.g. '3 months', '1 term'
  agreed_start_date     date,

  -- Negotiation meta
  status                text DEFAULT 'open',
  -- open | teacher_offered | employer_offered | agreed | payment_pending
  -- | in_progress | completed | cancelled | disputed
  last_offer_by         uuid REFERENCES profiles(id),
  teacher_accepted_at   timestamptz,
  employer_accepted_at  timestamptz,
  agreed_at             timestamptz,

  -- Video conference (Daily.co)
  meeting_room_name     text,
  meeting_room_url      text,
  meeting_token         text,          -- employer token (host)
  teacher_token         text,          -- teacher token
  meeting_scheduled_at  timestamptz,
  meeting_started_at    timestamptz,
  meeting_ended_at      timestamptz,

  -- Escrow / Payment (Paystack)
  escrow_amount_ngn     numeric(12,2), -- total paid by employer
  platform_fee_ngn      numeric(12,2), -- 10% platform cut
  teacher_payout_ngn    numeric(12,2), -- 90% to teacher
  paystack_ref          text UNIQUE,
  payment_status        text DEFAULT 'unpaid',
  -- unpaid | paid | released | refunded
  payment_paid_at       timestamptz,
  teacher_marked_done_at   timestamptz,
  employer_confirmed_done_at timestamptz,
  payment_released_at   timestamptz,

  -- Ratings (filled after completion)
  employer_rating       int,           -- employer rates teacher (1-5)
  employer_review       text,
  teacher_rating        int,           -- teacher rates employer (1-5)
  teacher_review        text,

  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),

  UNIQUE (application_id)              -- one negotiation per application
);

CREATE INDEX IF NOT EXISTS idx_neg_job      ON job_negotiations(job_id);
CREATE INDEX IF NOT EXISTS idx_neg_teacher  ON job_negotiations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_neg_employer ON job_negotiations(employer_id);
CREATE INDEX IF NOT EXISTS idx_neg_status   ON job_negotiations(status);

-- ── 3. Negotiation messages (offer/counter-offer chat) ───────────────────────
CREATE TABLE IF NOT EXISTS negotiation_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id   uuid NOT NULL REFERENCES job_negotiations(id) ON DELETE CASCADE,
  sender_id        uuid NOT NULL REFERENCES profiles(id),
  message_type     text NOT NULL,
  -- message | offer | counter_offer | accept | reject | system
  body             text,              -- free-text message
  offered_rate_ngn numeric(12,2),    -- filled for offer/counter_offer
  offered_rate_type text,
  offered_duration text,
  offered_start_date date,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_neg_msg_neg ON negotiation_messages(negotiation_id);

-- ── 4. RLS: negotiations ──────────────────────────────────────────────────────
ALTER TABLE job_negotiations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parties can view their negotiations"   ON job_negotiations;
DROP POLICY IF EXISTS "Employers can create negotiations"     ON job_negotiations;
DROP POLICY IF EXISTS "Parties can update negotiations"       ON job_negotiations;

CREATE POLICY "Parties can view their negotiations" ON job_negotiations
  FOR SELECT USING (
    auth.uid() = teacher_id OR auth.uid() = employer_id
  );

CREATE POLICY "Employers can create negotiations" ON job_negotiations
  FOR INSERT WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'employer')
  );

CREATE POLICY "Parties can update negotiations" ON job_negotiations
  FOR UPDATE USING (
    auth.uid() = teacher_id OR auth.uid() = employer_id
  );

-- ── 5. RLS: negotiation messages ─────────────────────────────────────────────
ALTER TABLE negotiation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parties can read messages"  ON negotiation_messages;
DROP POLICY IF EXISTS "Parties can send messages"  ON negotiation_messages;

CREATE POLICY "Parties can read messages" ON negotiation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_negotiations jn
      WHERE jn.id = negotiation_id
        AND (jn.teacher_id = auth.uid() OR jn.employer_id = auth.uid())
    )
  );

CREATE POLICY "Parties can send messages" ON negotiation_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM job_negotiations jn
      WHERE jn.id = negotiation_id
        AND (jn.teacher_id = auth.uid() OR jn.employer_id = auth.uid())
    )
  );

-- ── 6. Updated_at trigger for negotiations ────────────────────────────────────
DROP TRIGGER IF EXISTS negotiations_updated_at ON job_negotiations;
CREATE TRIGGER negotiations_updated_at
  BEFORE UPDATE ON job_negotiations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 7. Function: update teacher avg_rating when negotiation rated ─────────────
CREATE OR REPLACE FUNCTION refresh_teacher_rating(t_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE teacher_profiles SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(employer_rating)::numeric, 2)
      FROM job_negotiations
      WHERE teacher_id = t_id AND employer_rating IS NOT NULL
    ), 0),
    total_ratings = (
      SELECT COUNT(*) FROM job_negotiations
      WHERE teacher_id = t_id AND employer_rating IS NOT NULL
    ),
    total_jobs_completed = (
      SELECT COUNT(*) FROM job_negotiations
      WHERE teacher_id = t_id AND status = 'completed'
    )
  WHERE id = t_id;
$$;

-- ── 8. Function: increment job applications counter ───────────────────────────
CREATE OR REPLACE FUNCTION increment_job_applications(job_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE job_listings SET applications = COALESCE(applications, 0) + 1 WHERE id = job_id;
$$;

-- ── 9. Realtime subscriptions (enable for negotiation chat) ──────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE negotiation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE job_negotiations;
