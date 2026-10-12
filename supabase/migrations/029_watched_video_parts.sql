-- ── 029: Remember which parts of a lesson video each learner watched ────────
--
-- The lesson page splits videos into 5-minute parts and ticks a part once
-- 90% of it has actually been played. Played time is tracked in 10-second
-- blocks; this stores those block numbers on the learner's watch session so
-- the ticks follow a signed-in learner across devices (guests: per browser).

ALTER TABLE video_watch_sessions
  ADD COLUMN IF NOT EXISTS watched_blocks int[] NOT NULL DEFAULT '{}';

-- Same heartbeat as before, plus the 10-second blocks played since the last one.
DROP FUNCTION IF EXISTS track_video_watch(text, text, text, text, int, int, int);

CREATE OR REPLACE FUNCTION track_video_watch(
  p_viewer_key    text,
  p_course_slug   text,
  p_lesson_key    text,
  p_lesson_title  text,
  p_delta_secs    int,
  p_position_secs int,
  p_duration_secs int,
  p_blocks        int[] DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_key    text;
  v_delta  int  := LEAST(GREATEST(COALESCE(p_delta_secs, 0), 0), 60);     -- clamp: max 60s per heartbeat
  v_pos    int  := LEAST(GREATEST(COALESCE(p_position_secs, 0), 0), 86400);
  v_dur    int  := LEAST(GREATEST(COALESCE(p_duration_secs, 0), 0), 86400);
  v_blocks int[];
BEGIN
  IF p_course_slug IS NULL OR p_lesson_key IS NULL
     OR length(p_course_slug) > 120 OR length(p_lesson_key) > 120 THEN
    RETURN;
  END IF;

  v_key := COALESCE(v_uid::text, left(COALESCE(p_viewer_key, ''), 64));
  IF v_key = '' THEN RETURN; END IF;

  -- A heartbeat covers at most ~60s of playback (6 blocks); accept a few
  -- more for timing slack and drop anything outside a 24-hour video.
  SELECT COALESCE(array_agg(DISTINCT b), '{}') INTO v_blocks
  FROM (SELECT b FROM unnest(COALESCE(p_blocks, '{}')) AS b
        WHERE b BETWEEN 0 AND 8640 LIMIT 12) x;

  INSERT INTO video_watch_sessions AS s
    (viewer_key, user_id, course_slug, lesson_key, lesson_title,
     watch_secs, max_position_secs, video_duration_secs, is_completed, watched_blocks)
  VALUES
    (v_key, v_uid, p_course_slug, p_lesson_key, left(p_lesson_title, 200),
     v_delta, v_pos, v_dur, v_dur > 0 AND v_pos >= v_dur * 0.9, v_blocks)
  ON CONFLICT (viewer_key, course_slug, lesson_key) DO UPDATE SET
    watch_secs          = s.watch_secs + v_delta,
    max_position_secs   = GREATEST(s.max_position_secs, v_pos),
    video_duration_secs = GREATEST(s.video_duration_secs, v_dur),
    lesson_title        = COALESCE(EXCLUDED.lesson_title, s.lesson_title),
    is_completed        = s.is_completed OR (
                            GREATEST(s.video_duration_secs, v_dur) > 0 AND
                            GREATEST(s.max_position_secs, v_pos) >= GREATEST(s.video_duration_secs, v_dur) * 0.9),
    watched_blocks      = (SELECT COALESCE(array_agg(DISTINCT b ORDER BY b), '{}')
                           FROM unnest(s.watched_blocks || v_blocks) AS b),
    last_seen_at        = now();
END;
$$;

REVOKE ALL ON FUNCTION track_video_watch(text, text, text, text, int, int, int, int[]) FROM public;
GRANT EXECUTE ON FUNCTION track_video_watch(text, text, text, text, int, int, int, int[]) TO anon, authenticated;

-- The caller's own watched blocks for a lesson (signed-in: by account,
-- across devices; guest: by this browser's random viewer key).
CREATE OR REPLACE FUNCTION my_watched_blocks(p_viewer_key text, p_course_slug text, p_lesson_key text)
RETURNS int[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT watched_blocks FROM video_watch_sessions
     WHERE viewer_key = COALESCE(auth.uid()::text, left(COALESCE(p_viewer_key, ''), 64))
       AND course_slug = p_course_slug AND lesson_key = p_lesson_key),
    '{}');
$$;

REVOKE ALL ON FUNCTION my_watched_blocks(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION my_watched_blocks(text, text, text) TO anon, authenticated;
