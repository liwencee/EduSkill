-- ============================================================
-- Migration 021: CPD quiz scoring + gated certification
-- CPD courses are static content (not in the `courses` table), so
-- progress/certification is tracked here by course_slug + lesson_id
-- rather than a uuid FK. Certificates are only issued once a
-- teacher's average best-score across all lessons in a course
-- meets that course's pass_mark (currently 75% for new courses).
-- ============================================================

-- Best score achieved per (user, course, lesson) — retaking a quiz
-- upserts the row, keeping the highest score ever achieved.
CREATE TABLE IF NOT EXISTS cpd_lesson_results (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_slug  text NOT NULL,
  lesson_id    text NOT NULL,
  best_score   int  NOT NULL CHECK (best_score BETWEEN 0 AND 100),
  attempts     int  NOT NULL DEFAULT 1,
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, course_slug, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_cpd_lesson_results_user_course
  ON cpd_lesson_results(user_id, course_slug);

ALTER TABLE cpd_lesson_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own CPD lesson results"
  ON cpd_lesson_results FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins view all CPD lesson results"
  ON cpd_lesson_results FOR SELECT
  USING (current_user_role() = 'admin'::user_role);


-- Issued CPD certificates — one per (user, course), only ever
-- inserted client-side once the aggregate score check passes.
CREATE TABLE IF NOT EXISTS cpd_certificates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_slug     text NOT NULL,
  course_title    text NOT NULL,
  overall_score   int  NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  certificate_id  text NOT NULL UNIQUE,
  full_name       text NOT NULL,
  teacher_id      text,
  school          text,
  state           text,
  issued_at       timestamptz DEFAULT now(),
  UNIQUE (user_id, course_slug)
);

CREATE INDEX IF NOT EXISTS idx_cpd_certificates_user ON cpd_certificates(user_id);

ALTER TABLE cpd_certificates ENABLE ROW LEVEL SECURITY;

-- Certificates are proof of credential — readable by everyone
-- (employers browsing OpportunityHub candidates, public verification),
-- but only the owning user can insert their own (score-gated client-side
-- + this policy still restricts the row to their own user_id).
CREATE POLICY "Certificates are publicly viewable"
  ON cpd_certificates FOR SELECT
  USING (true);

CREATE POLICY "Users can claim own certificate"
  ON cpd_certificates FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── Server-side integrity check ───────────────────────────────────────────────
-- The client computes overall_score for display, but a certificate is only
-- as trustworthy as its weakest check — so the DB independently recomputes
-- the average from cpd_lesson_results and rejects any insert that doesn't
-- match (spoofed score) or falls under the platform-wide 70% floor (the
-- lowest pass_mark used by any CPD course; individual courses may require
-- more, enforced client-side for the correct per-course UX).
CREATE OR REPLACE FUNCTION validate_cpd_certificate()
RETURNS TRIGGER AS $$
DECLARE
  computed_avg numeric;
BEGIN
  SELECT AVG(best_score) INTO computed_avg
    FROM cpd_lesson_results
   WHERE user_id = NEW.user_id AND course_slug = NEW.course_slug;

  IF computed_avg IS NULL THEN
    RAISE EXCEPTION 'No quiz results found for this course — complete the lessons first';
  END IF;

  IF ROUND(computed_avg) <> NEW.overall_score THEN
    RAISE EXCEPTION 'overall_score does not match recorded quiz results';
  END IF;

  IF computed_avg < 70 THEN
    RAISE EXCEPTION 'Average score % is below the minimum passing threshold', computed_avg;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_cpd_certificate ON cpd_certificates;
CREATE TRIGGER trg_validate_cpd_certificate
  BEFORE INSERT ON cpd_certificates
  FOR EACH ROW
  EXECUTE FUNCTION validate_cpd_certificate();
