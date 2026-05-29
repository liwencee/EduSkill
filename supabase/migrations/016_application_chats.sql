-- ── 016: Application Chat (direct employer ↔ applicant messaging) ────────────

CREATE TABLE IF NOT EXISTS application_chats (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid        NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  sender_id      uuid        NOT NULL REFERENCES profiles(id),
  body           text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appchats_application_id
  ON application_chats(application_id, created_at);

-- ── Enable realtime ───────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE application_chats;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE application_chats ENABLE ROW LEVEL SECURITY;

-- Both parties (applicant + job's employer) can read messages for their application
DROP POLICY IF EXISTS "Chat participants can read" ON application_chats;
CREATE POLICY "Chat participants can read" ON application_chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN job_listings jl ON jl.id = ja.job_id
      WHERE ja.id = application_id
        AND (ja.applicant_id = auth.uid() OR jl.employer_id = auth.uid())
    )
  );

-- Both parties can send messages
DROP POLICY IF EXISTS "Chat participants can send" ON application_chats;
CREATE POLICY "Chat participants can send" ON application_chats
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN job_listings jl ON jl.id = ja.job_id
      WHERE ja.id = application_id
        AND (ja.applicant_id = auth.uid() OR jl.employer_id = auth.uid())
    )
  );
