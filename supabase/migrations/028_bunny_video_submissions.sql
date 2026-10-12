-- ── 028: Bunny Stream videos for lesson submissions ─────────────────────────
--
-- Lesson videos move from YouTube links to files uploaded to Bunny Stream.
-- A submission is now either provider 'bunny' (bunny_video_id = the Bunny
-- video GUID) or the legacy provider 'youtube'. Existing YouTube rows keep
-- working until a Bunny video is approved for the same lesson.

ALTER TABLE video_submissions
  ADD COLUMN IF NOT EXISTS video_provider text NOT NULL DEFAULT 'youtube',
  ADD COLUMN IF NOT EXISTS bunny_video_id text,
  ALTER COLUMN youtube_url DROP NOT NULL,
  ALTER COLUMN youtube_id  DROP NOT NULL;

ALTER TABLE video_submissions DROP CONSTRAINT IF EXISTS video_submissions_youtube_id_check;
ALTER TABLE video_submissions DROP CONSTRAINT IF EXISTS video_submissions_provider_check;
ALTER TABLE video_submissions ADD CONSTRAINT video_submissions_provider_check CHECK (
  (video_provider = 'youtube' AND youtube_id ~ '^[A-Za-z0-9_-]{11}$')
  OR
  (video_provider = 'bunny' AND bunny_video_id ~ '^[0-9a-fA-F-]{36}$')
);

-- Replaced by lesson_video(), which also reports the provider.
DROP FUNCTION IF EXISTS approved_lesson_video(text, text);

-- The approved video for a lesson: provider + id, never who submitted it.
-- Bunny ids are only useful together with a signed token, which the web
-- server issues to learners allowed to watch (see /api/lesson-video).
CREATE OR REPLACE FUNCTION lesson_video(p_course_slug text, p_lesson_key text)
RETURNS TABLE (provider text, video_id text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT video_provider,
         CASE WHEN video_provider = 'bunny' THEN bunny_video_id ELSE youtube_id END
  FROM video_submissions
  WHERE course_slug = p_course_slug AND lesson_key = p_lesson_key AND status = 'approved'
  ORDER BY reviewed_at DESC NULLS LAST
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION lesson_video(text, text) FROM public;
GRANT EXECUTE ON FUNCTION lesson_video(text, text) TO anon, authenticated;
