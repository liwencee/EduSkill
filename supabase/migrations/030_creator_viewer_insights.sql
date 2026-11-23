-- ── 030: Deeper creator analytics — every viewer, per-learner detail, drop-off
--
-- Builds on 022 (video_watch_sessions) and 029 (watched_blocks):
--   creator_watch_log()   one row per viewer per video, for the full viewer
--                         table, the per-learner view and the CSV export.
--                         watched_pct = share actually played (skips don't
--                         count); reached_pct = furthest point reached
--   creator_retention()   where viewers stop watching a video: share of viewers
--                         who played each 10-second block and each 5-minute part
-- Same privacy rules as 022: creators only see their own courses (admins see
-- all); learners appear by name only, guests as an anonymous id.

CREATE OR REPLACE FUNCTION creator_watch_log(p_course_slug text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_admin boolean;
  v_rows  jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_signed_in');
  END IF;
  v_admin := is_admin();

  SELECT COALESCE(jsonb_agg(r ORDER BY r.last_seen_at DESC), '[]'::jsonb) INTO v_rows
  FROM (
    SELECT
      COALESCE(w.user_id::text, 'guest-' || left(md5(w.viewer_key), 8)) AS viewer_id,
      COALESCE(p.full_name, 'Guest viewer')                              AS name,
      (w.user_id IS NOT NULL)                                            AS signed_in,
      c.slug                                                             AS course_slug,
      c.title                                                            AS course_title,
      w.lesson_key,
      COALESCE(w.lesson_title, w.lesson_key)                             AS lesson_title,
      w.watch_secs,
      w.video_duration_secs                                              AS duration_secs,
      -- % actually played (from played blocks when recorded, else how far they reached)
      CASE WHEN cardinality(w.watched_blocks) > 0
           THEN LEAST(100, round(100.0 * cardinality(w.watched_blocks) * 10 / NULLIF(w.video_duration_secs, 0)))
           ELSE LEAST(100, round(100.0 * w.max_position_secs / NULLIF(w.video_duration_secs, 0))) END AS watched_pct,
      LEAST(100, round(100.0 * w.max_position_secs / NULLIF(w.video_duration_secs, 0))) AS reached_pct,
      CASE WHEN cardinality(w.watched_blocks) > 0
           THEN cardinality(w.watched_blocks) * 10 >= 0.9 * w.video_duration_secs
           ELSE w.is_completed END AS is_completed,
      w.started_at,
      w.last_seen_at,
      (e.id IS NOT NULL)                                                 AS enrolled,
      COALESCE(e.is_paid, false)                                         AS paid
    FROM video_watch_sessions w
    JOIN courses c ON c.slug = w.course_slug AND (c.instructor_id = v_uid OR v_admin)
    LEFT JOIN profiles p    ON p.id = w.user_id
    LEFT JOIN enrollments e ON e.user_id = w.user_id AND e.course_id = c.id
    WHERE p_course_slug IS NULL OR w.course_slug = p_course_slug
    ORDER BY w.last_seen_at DESC
    LIMIT 5000
  ) r;

  RETURN jsonb_build_object('rows', v_rows);
END;
$$;

REVOKE ALL ON FUNCTION creator_watch_log(text) FROM public;
GRANT EXECUTE ON FUNCTION creator_watch_log(text) TO authenticated;


CREATE OR REPLACE FUNCTION creator_retention(p_course_slug text, p_lesson_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_viewers  int;
  v_duration int;
  v_blocks   jsonb;
  v_parts    jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_signed_in');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM courses
                 WHERE slug = p_course_slug AND (instructor_id = v_uid OR is_admin())) THEN
    RETURN jsonb_build_object('error', 'not_your_course');
  END IF;

  -- Only sessions that recorded played blocks (heartbeats from migration 029 on)
  SELECT count(*), COALESCE(max(video_duration_secs), 0) INTO v_viewers, v_duration
  FROM video_watch_sessions
  WHERE course_slug = p_course_slug AND lesson_key = p_lesson_key AND cardinality(watched_blocks) > 0;

  IF v_viewers = 0 OR v_duration = 0 THEN
    RETURN jsonb_build_object('viewers', v_viewers, 'duration_secs', v_duration, 'blocks', '[]'::jsonb, 'parts', '[]'::jsonb);
  END IF;

  -- Share of viewers who played each 10-second block
  SELECT COALESCE(jsonb_agg(jsonb_build_object('block', g.b, 'pct', round(100.0 * COALESCE(c.n, 0) / v_viewers)) ORDER BY g.b), '[]'::jsonb)
  INTO v_blocks
  FROM generate_series(0, GREATEST(0, ceil(v_duration / 10.0)::int - 1)) AS g(b)
  LEFT JOIN (
    SELECT b, count(*) AS n
    FROM video_watch_sessions, unnest(watched_blocks) AS b
    WHERE course_slug = p_course_slug AND lesson_key = p_lesson_key
    GROUP BY b
  ) c ON c.b = g.b;

  -- Share of viewers who watched at least 90% of each 5-minute part
  -- (a short last stub joins the previous part, as on the lesson page)
  WITH parts AS (
    SELECT n, s * 30 AS first_block,
           CASE WHEN n = total THEN ceil(v_duration / 10.0)::int - 1 ELSE (s + 1) * 30 - 1 END AS last_block
    FROM (
      SELECT s, s + 1 AS n,
             CASE WHEN v_duration - 300 * (ceil(v_duration / 300.0)::int - 1) < 60 AND v_duration > 300
                  THEN ceil(v_duration / 300.0)::int - 1 ELSE ceil(v_duration / 300.0)::int END AS total
      FROM generate_series(0, ceil(v_duration / 300.0)::int - 1) AS s
    ) x
    WHERE n <= total
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'part', pt.n,
           'start_secs', pt.first_block * 10,
           'end_secs', LEAST(v_duration, (pt.last_block + 1) * 10),
           'pct', round(100.0 * (
             SELECT count(*) FROM video_watch_sessions w
             WHERE w.course_slug = p_course_slug AND w.lesson_key = p_lesson_key AND cardinality(w.watched_blocks) > 0
               AND (SELECT count(*) FROM unnest(w.watched_blocks) b WHERE b BETWEEN pt.first_block AND pt.last_block)
                   >= 0.9 * (pt.last_block - pt.first_block + 1)
           ) / v_viewers)) ORDER BY pt.n), '[]'::jsonb)
  INTO v_parts
  FROM parts pt;

  RETURN jsonb_build_object('viewers', v_viewers, 'duration_secs', v_duration, 'blocks', v_blocks, 'parts', v_parts);
END;
$$;

REVOKE ALL ON FUNCTION creator_retention(text, text) FROM public;
GRANT EXECUTE ON FUNCTION creator_retention(text, text) TO authenticated;


-- ── creator_dashboard(): same figures, but "% watched" and "completed" now
-- count only what was actually played (skipping ahead no longer counts).
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
    -- a_pct / a_done: share actually played (from played blocks when recorded,
    -- else how far the viewer reached) and whether that is 90%+
    SELECT w.*,
      CASE WHEN cardinality(w.watched_blocks) > 0
           THEN LEAST(100, 100.0 * cardinality(w.watched_blocks) * 10 / NULLIF(w.video_duration_secs, 0))
           ELSE LEAST(100, 100.0 * w.max_position_secs / NULLIF(w.video_duration_secs, 0)) END AS a_pct,
      CASE WHEN cardinality(w.watched_blocks) > 0
           THEN cardinality(w.watched_blocks) * 10 >= 0.9 * w.video_duration_secs
           ELSE w.is_completed END AS a_done
    FROM video_watch_sessions w
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
      (SELECT count(*) FROM ws WHERE ws.course_slug = mc.slug AND ws.a_done)           AS completions,
      (SELECT COALESCE(round(avg(a_pct)), 0)
         FROM ws WHERE ws.course_slug = mc.slug AND ws.video_duration_secs > 0)              AS avg_watched_pct,
      (SELECT COALESCE(jsonb_agg(l ORDER BY l.lesson_key), '[]'::jsonb) FROM (
         SELECT lesson_key, max(lesson_title) AS lesson_title,
                count(*) AS views,
                count(*) FILTER (WHERE a_done) AS completions,
                COALESCE(sum(watch_secs), 0) AS watch_secs,
                COALESCE(round(avg(a_pct)), 0) AS avg_watched_pct
         FROM ws WHERE ws.course_slug = mc.slug
         GROUP BY lesson_key) l)                                                             AS lessons,
      (SELECT COALESCE(jsonb_agg(v ORDER BY v.last_seen_at DESC), '[]'::jsonb) FROM (
         SELECT COALESCE(p.full_name, 'Guest viewer') AS name,
                (ws.user_id IS NOT NULL) AS signed_in,
                ws.lesson_title, ws.watch_secs, ws.a_done, ws.last_seen_at,
                round(ws.a_pct) AS watched_pct
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
