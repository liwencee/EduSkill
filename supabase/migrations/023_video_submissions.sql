-- ── 023: Vendor video submissions ───────────────────────────────────────────
--
-- Creators submit a YouTube link for a specific lesson of the static
-- curriculum (course_slug + lesson_key, e.g. 'python-data-skills' / 'pds-m1-l1').
-- An admin reviews it; once approved it becomes that lesson's video on the
-- site (via approved_lesson_video) and the creator is linked to the course
-- for the analytics dashboard (if the course has no creator yet).

CREATE TABLE IF NOT EXISTS video_submissions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_slug     text NOT NULL,
  course_title    text NOT NULL,
  lesson_key      text NOT NULL,
  lesson_title    text NOT NULL,
  youtube_url     text NOT NULL,
  youtube_id      text NOT NULL CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  duration_mins   int  CHECK (duration_mins IS NULL OR duration_mins BETWEEN 1 AND 600),
  language        text NOT NULL DEFAULT 'en',
  notes           text CHECK (notes IS NULL OR length(notes) <= 1000),
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'replaced')),
  admin_note      text,
  reviewed_by     uuid REFERENCES profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS video_submissions_lesson_idx    ON video_submissions(course_slug, lesson_key);
CREATE INDEX IF NOT EXISTS video_submissions_submitter_idx ON video_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS video_submissions_status_idx    ON video_submissions(status);

ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators submit own videos"   ON video_submissions;
DROP POLICY IF EXISTS "Creators see own submissions" ON video_submissions;
DROP POLICY IF EXISTS "Admins see all submissions"   ON video_submissions;

-- Creators can only create pending rows for themselves; review fields stay empty.
CREATE POLICY "Creators submit own videos" ON video_submissions
  FOR INSERT WITH CHECK (
    submitter_id = auth.uid() AND status = 'pending'
    AND admin_note IS NULL AND reviewed_by IS NULL AND reviewed_at IS NULL
  );

CREATE POLICY "Creators see own submissions" ON video_submissions
  FOR SELECT USING (submitter_id = auth.uid());

CREATE POLICY "Admins see all submissions" ON video_submissions
  FOR SELECT USING (is_admin());
-- No UPDATE/DELETE policies: reviews go through admin_review_video_submission().


-- ── Admin review ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_review_video_submission(
  p_id      uuid,
  p_approve boolean,
  p_note    text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub video_submissions%ROWTYPE;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can review video submissions';
  END IF;

  SELECT * INTO v_sub FROM video_submissions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  IF p_approve THEN
    -- The previously approved video for this lesson is superseded.
    UPDATE video_submissions SET status = 'replaced'
    WHERE course_slug = v_sub.course_slug AND lesson_key = v_sub.lesson_key
      AND status = 'approved' AND id <> p_id;

    UPDATE video_submissions
    SET status = 'approved', admin_note = left(p_note, 1000), reviewed_by = auth.uid(), reviewed_at = now()
    WHERE id = p_id;

    -- Link the creator to the course for analytics, unless it already has one.
    UPDATE courses SET instructor_id = v_sub.submitter_id
    WHERE slug = v_sub.course_slug AND instructor_id IS NULL;

    RETURN 'approved';
  ELSE
    UPDATE video_submissions
    SET status = 'rejected', admin_note = left(p_note, 1000), reviewed_by = auth.uid(), reviewed_at = now()
    WHERE id = p_id;
    RETURN 'rejected';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION admin_review_video_submission(uuid, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION admin_review_video_submission(uuid, boolean, text) TO authenticated;


-- ── Public: the approved video for a lesson ─────────────────────────────────
-- Returns only the YouTube id, never who submitted it.
CREATE OR REPLACE FUNCTION approved_lesson_video(p_course_slug text, p_lesson_key text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT youtube_id FROM video_submissions
  WHERE course_slug = p_course_slug AND lesson_key = p_lesson_key AND status = 'approved'
  ORDER BY reviewed_at DESC NULLS LAST
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION approved_lesson_video(text, text) FROM public;
GRANT EXECUTE ON FUNCTION approved_lesson_video(text, text) TO anon, authenticated;
