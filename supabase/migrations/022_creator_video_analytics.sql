-- ── 022: Creator video analytics (transparency dashboard) ──────────────────
--
-- Lets course creators (courses.instructor_id) see who signed up for their
-- course and how learners actually watch the lesson videos.
--
-- Lessons are served from the static curriculum (string ids like "dmm-m1-l1"),
-- so watch sessions are keyed by course_slug + lesson_key rather than the
-- lessons table's uuid. One row per viewer per lesson; heartbeats accumulate.
--
-- All reads/writes go through SECURITY DEFINER functions so that:
--   * learners (incl. guests) can only add bounded watch time, never read rows
--   * creators only ever see courses they own; admins see everything
--   * creators see learner names only — never email/phone

CREATE TABLE IF NOT EXISTS video_watch_sessions (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewer_key          text NOT NULL,                              -- user id, or random per-browser id for guests
  user_id             uuid REFERENCES profiles(id) ON DELETE SET NULL,
  course_slug         text NOT NULL,
  lesson_key          text NOT NULL,
  lesson_title        text,
  watch_secs          int  NOT NULL DEFAULT 0,                    -- total seconds actually playing
  max_position_secs   int  NOT NULL DEFAULT 0,                    -- furthest point reached in the video
  video_duration_secs int  NOT NULL DEFAULT 0,
  is_completed        boolean NOT NULL DEFAULT false,             -- reached >= 90% of the video
  started_at          timestamptz NOT NULL DEFAULT now(),
  last_seen_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viewer_key, course_slug, lesson_key)
);

CREATE INDEX IF NOT EXISTS video_watch_sessions_course_idx ON video_watch_sessions(course_slug);
CREATE INDEX IF NOT EXISTS video_watch_sessions_user_idx   ON video_watch_sessions(user_id);

ALTER TABLE video_watch_sessions ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: direct table access is denied; use the functions below.
DROP POLICY IF EXISTS "Admins read watch sessions" ON video_watch_sessions;
CREATE POLICY "Admins read watch sessions" ON video_watch_sessions
  FOR SELECT USING ( is_admin() );


-- ── Record a watch heartbeat ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION track_video_watch(
  p_viewer_key    text,
  p_course_slug   text,
  p_lesson_key    text,
  p_lesson_title  text,
  p_delta_secs    int,
  p_position_secs int,
  p_duration_secs int
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_key   text;
  v_delta int  := LEAST(GREATEST(COALESCE(p_delta_secs, 0), 0), 60);     -- clamp: max 60s per heartbeat
  v_pos   int  := LEAST(GREATEST(COALESCE(p_position_secs, 0), 0), 86400);
  v_dur   int  := LEAST(GREATEST(COALESCE(p_duration_secs, 0), 0), 86400);
BEGIN
  IF p_course_slug IS NULL OR p_lesson_key IS NULL
     OR length(p_course_slug) > 120 OR length(p_lesson_key) > 120 THEN
    RETURN;
  END IF;

  -- Signed-in viewers are always keyed by their user id (can't be spoofed);
  -- guests by the random browser id the client sends.
  v_key := COALESCE(v_uid::text, left(COALESCE(p_viewer_key, ''), 64));
  IF v_key = '' THEN RETURN; END IF;

  INSERT INTO video_watch_sessions AS s
    (viewer_key, user_id, course_slug, lesson_key, lesson_title,
     watch_secs, max_position_secs, video_duration_secs, is_completed)
  VALUES
    (v_key, v_uid, p_course_slug, p_lesson_key, left(p_lesson_title, 200),
     v_delta, v_pos, v_dur, v_dur > 0 AND v_pos >= v_dur * 0.9)
  ON CONFLICT (viewer_key, course_slug, lesson_key) DO UPDATE SET
    watch_secs          = s.watch_secs + v_delta,
    max_position_secs   = GREATEST(s.max_position_secs, v_pos),
    video_duration_secs = GREATEST(s.video_duration_secs, v_dur),
    lesson_title        = COALESCE(EXCLUDED.lesson_title, s.lesson_title),
    is_completed        = s.is_completed OR (
                            GREATEST(s.video_duration_secs, v_dur) > 0 AND
                            GREATEST(s.max_position_secs, v_pos) >= GREATEST(s.video_duration_secs, v_dur) * 0.9),
    last_seen_at        = now();
END;
$$;

REVOKE ALL ON FUNCTION track_video_watch(text, text, text, text, int, int, int) FROM public;
GRANT EXECUTE ON FUNCTION track_video_watch(text, text, text, text, int, int, int) TO anon, authenticated;


-- ── Creator dashboard data ──────────────────────────────────────────────────
-- Returns everything the dashboard needs for the caller's own courses
-- (or every course, for admins) as a single JSON document.
CREATE OR REPLACE FUNCTION creator_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_admin  boolean;
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_signed_in');
  END IF;

  v_admin := is_admin();

  WITH my_courses AS (
    SELECT c.id, c.slug, c.title, c.is_free, c.price_ngn, c.is_published
    FROM courses c
    WHERE c.instructor_id = v_uid OR v_admin
  ),
  ws AS (
    SELECT w.* FROM video_watch_sessions w
    JOIN my_courses mc ON mc.slug = w.course_slug
  ),
  course_rows AS (
    SELECT
      mc.id, mc.slug, mc.title, mc.is_free, mc.price_ngn, mc.is_published,
      (SELECT count(*) FROM enrollments e WHERE e.course_id = mc.id)                         AS enrolled,
      (SELECT count(*) FROM enrollments e WHERE e.course_id = mc.id AND e.is_paid)           AS paid,
      (SELECT count(*) FROM ws WHERE ws.course_slug = mc.slug)                               AS lesson_views,
      (SELECT count(DISTINCT viewer_key) FROM ws WHERE ws.course_slug = mc.slug)             AS unique_viewers,
      (SELECT COALESCE(sum(watch_secs), 0) FROM ws WHERE ws.course_slug = mc.slug)           AS watch_secs,
      (SELECT count(*) FROM ws WHERE ws.course_slug = mc.slug AND ws.is_completed)           AS completions,
      (SELECT COALESCE(round(avg(LEAST(100, 100.0 * max_position_secs / NULLIF(video_duration_secs, 0)))), 0)
         FROM ws WHERE ws.course_slug = mc.slug AND ws.video_duration_secs > 0)              AS avg_watched_pct,
      (SELECT COALESCE(jsonb_agg(l ORDER BY l.lesson_key), '[]'::jsonb) FROM (
         SELECT lesson_key, max(lesson_title) AS lesson_title,
                count(*) AS views,
                count(*) FILTER (WHERE is_completed) AS completions,
                COALESCE(sum(watch_secs), 0) AS watch_secs,
                COALESCE(round(avg(LEAST(100, 100.0 * max_position_secs / NULLIF(video_duration_secs, 0)))), 0) AS avg_watched_pct
         FROM ws WHERE ws.course_slug = mc.slug
         GROUP BY lesson_key) l)                                                             AS lessons,
      (SELECT COALESCE(jsonb_agg(v ORDER BY v.last_seen_at DESC), '[]'::jsonb) FROM (
         SELECT COALESCE(p.full_name, 'Guest viewer') AS name,
                (ws.user_id IS NOT NULL) AS signed_in,
                ws.lesson_title, ws.watch_secs, ws.is_completed, ws.last_seen_at,
                LEAST(100, round(100.0 * ws.max_position_secs / NULLIF(ws.video_duration_secs, 0))) AS watched_pct
         FROM ws LEFT JOIN profiles p ON p.id = ws.user_id
         WHERE ws.course_slug = mc.slug
         ORDER BY ws.last_seen_at DESC
         LIMIT 100) v)                                                                       AS recent_viewers,
      (SELECT COALESCE(jsonb_agg(s ORDER BY s.enrolled_at DESC), '[]'::jsonb) FROM (
         SELECT COALESCE(p.full_name, 'Learner') AS name, p.state,
                e.enrolled_at, e.is_paid, e.progress_pct, e.status
         FROM enrollments e LEFT JOIN profiles p ON p.id = e.user_id
         WHERE e.course_id = mc.id
         ORDER BY e.enrolled_at DESC
         LIMIT 200) s)                                                                       AS signups
    FROM my_courses mc
  ),
  daily AS (
    SELECT d::date AS day,
           (SELECT count(*) FROM ws WHERE ws.started_at::date = d::date)                     AS new_views,
           (SELECT count(*) FROM enrollments e JOIN my_courses mc ON mc.id = e.course_id
              WHERE e.enrolled_at::date = d::date)                                           AS signups
    FROM generate_series(current_date - 29, current_date, interval '1 day') d
  )
  SELECT jsonb_build_object(
    'is_admin', v_admin,
    'courses',  COALESCE((SELECT jsonb_agg(to_jsonb(cr) ORDER BY cr.title) FROM course_rows cr), '[]'::jsonb),
    'daily',    COALESCE((SELECT jsonb_agg(to_jsonb(dl) ORDER BY dl.day) FROM daily dl), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION creator_dashboard() FROM public;
GRANT EXECUTE ON FUNCTION creator_dashboard() TO authenticated;


-- ── Admin: link a course to its creator by email ────────────────────────────
CREATE OR REPLACE FUNCTION admin_assign_instructor(p_course_id uuid, p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator uuid;
  v_name    text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can assign course creators';
  END IF;

  IF p_email IS NULL OR btrim(p_email) = '' THEN
    UPDATE courses SET instructor_id = NULL WHERE id = p_course_id;
    RETURN NULL;
  END IF;

  SELECT id, full_name INTO v_creator, v_name
  FROM profiles WHERE lower(email) = lower(btrim(p_email));

  IF v_creator IS NULL THEN
    RAISE EXCEPTION 'No Skillora account found for %', p_email;
  END IF;

  UPDATE courses SET instructor_id = v_creator WHERE id = p_course_id;
  RETURN v_name;
END;
$$;

REVOKE ALL ON FUNCTION admin_assign_instructor(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION admin_assign_instructor(uuid, text) TO authenticated;
