-- Fix Migration 006: Recreate student_results with correct schema
-- Handles both cases: table never existed, or table exists with wrong columns.

-- ─── STUDENT RESULTS ─────────────────────────────────────────────────────────

-- Safely drop the old table (and all its indexes/triggers/policies) only if it exists.
-- Plain DROP TRIGGER IF EXISTS fails when the *table* doesn't exist, so we use a
-- DO block to guard the check first.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'student_results'
  ) THEN
    DROP TABLE student_results CASCADE;  -- CASCADE removes indexes, triggers, policies
  END IF;
END $$;

-- Clean up any orphaned indexes (CASCADE may have already removed them, IF NOT EXISTS is safe)
DROP INDEX IF EXISTS idx_student_results_teacher;
DROP INDEX IF EXISTS idx_student_results_created;

-- Fresh table with correct schema
CREATE TABLE student_results (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_name   text        NOT NULL,
  class_name    text        NOT NULL,
  term          text        NOT NULL,        -- e.g. "1st", "2nd", "3rd"
  session       text        NOT NULL,        -- e.g. "2024/2025"
  passmark      integer     NOT NULL DEFAULT 50,
  subjects      jsonb       NOT NULL,        -- [{ name, maxScore }]
  students      jsonb       NOT NULL,        -- [{ name, scores: { subjectName: score } }]
  results       jsonb       NOT NULL,        -- full ranked StudentResult[] output
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own results"
  ON student_results FOR ALL
  USING  (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE INDEX idx_student_results_teacher ON student_results(teacher_id, session, term);
CREATE INDEX idx_student_results_created ON student_results(created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

CREATE TRIGGER student_results_updated_at
  BEFORE UPDATE ON student_results
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();


-- ─── LESSON PLAN CACHE ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_plan_cache (
  cache_key  text        PRIMARY KEY,
  subject    text        NOT NULL,
  topic      text        NOT NULL,
  sub_topic  text,
  grade      text        NOT NULL,
  duration   text,
  plan       jsonb       NOT NULL,
  hit_count  integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE lesson_plan_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage cache" ON lesson_plan_cache;
CREATE POLICY "Service role can manage cache"
  ON lesson_plan_cache FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lesson_plan_cache_subject_grade ON lesson_plan_cache(subject, grade);
CREATE INDEX IF NOT EXISTS idx_lesson_plan_cache_expires       ON lesson_plan_cache(expires_at);


-- ─── RESULT RECOMMENDATIONS CACHE ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS result_recs_cache (
  cache_key       text        PRIMARY KEY,
  class_name      text        NOT NULL,
  term            text        NOT NULL,
  session         text        NOT NULL,
  recommendations jsonb       NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '2 hours')
);

ALTER TABLE result_recs_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage recs cache" ON result_recs_cache;
CREATE POLICY "Service role can manage recs cache"
  ON result_recs_cache FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_result_recs_cache_expires ON result_recs_cache(expires_at);


-- ─── AUDIT LOG ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_audit_log (
  id          bigserial   PRIMARY KEY,
  ts          timestamptz NOT NULL DEFAULT now(),
  route       text        NOT NULL,
  method      text        NOT NULL DEFAULT 'POST',
  user_id     uuid,
  ip          text,
  status_code integer     NOT NULL,
  duration_ms integer,
  meta        jsonb
);

ALTER TABLE api_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only service role can access audit log" ON api_audit_log;
CREATE POLICY "Only service role can access audit log"
  ON api_audit_log FOR ALL
  USING (false);

CREATE INDEX IF NOT EXISTS idx_audit_log_ts    ON api_audit_log(ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_route ON api_audit_log(route, ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user  ON api_audit_log(user_id, ts DESC);


-- ─── JOB ENGAGEMENT FIELDS ───────────────────────────────────────────────────

ALTER TABLE job_listings
  ADD COLUMN IF NOT EXISTS rate_type           text,
  ADD COLUMN IF NOT EXISTS engagement_duration text;
