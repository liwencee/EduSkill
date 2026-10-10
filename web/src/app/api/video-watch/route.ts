import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/video-watch
 *
 * Heartbeat from the lesson video player. Records how long the viewer has
 * actually been playing the video and how far into it they got, so course
 * creators can see real watch behaviour on /dashboard/creator.
 *
 * Accepts JSON or text/plain (navigator.sendBeacon on page hide).
 * Body: { viewerKey, courseSlug, lessonKey, lessonTitle, deltaSecs, positionSecs, durationSecs }
 *
 * The heavy lifting (clamping, upsert, signed-in user attribution) happens in
 * the SECURITY DEFINER function track_video_watch — see migration 022.
 */
export async function POST(req: NextRequest) {
  let body: any
  try {
    body = JSON.parse(await req.text())
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : 0)

  const courseSlug = str(body?.courseSlug, 120)
  const lessonKey  = str(body?.lessonKey, 120)
  if (!courseSlug || !lessonKey) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { error } = await supabase.rpc('track_video_watch', {
      p_viewer_key:    str(body?.viewerKey, 64),
      p_course_slug:   courseSlug,
      p_lesson_key:    lessonKey,
      p_lesson_title:  str(body?.lessonTitle, 200),
      p_delta_secs:    num(body?.deltaSecs),
      p_position_secs: num(body?.positionSecs),
      p_duration_secs: num(body?.durationSecs),
    })
    if (error) return NextResponse.json({ ok: false }, { status: 202 })
    return NextResponse.json({ ok: true })
  } catch {
    // Tracking must never break playback — swallow and acknowledge.
    return NextResponse.json({ ok: false }, { status: 202 })
  }
}
