import { NextRequest, NextResponse } from 'next/server'
import { STATIC_COURSES } from '@/lib/static-courses'
import { findLesson } from '@/lib/course-content'
import { getYouTubeId } from '@/lib/youtube'
import { bunnyEmbedUrl, bunnyPlaybackConfigured } from '@/lib/bunny'

export const dynamic = 'force-dynamic'

/**
 * GET /api/lesson-video?slug=<course-slug>&lesson=<lesson-key>
 *
 * The video to play on a lesson page:
 *   { provider: 'bunny',   embedUrl }   approved Bunny upload (signed, expiring URL)
 *   { provider: 'youtube', videoId }    approved YouTube submission, or the
 *                                       curriculum's built-in YouTube link
 *   { provider: null }                  no video yet
 *   403 { locked: true, reason }        paid lesson the viewer hasn't bought
 *
 * Bunny URLs are only handed to viewers allowed to watch the lesson, so a
 * paid video can't be pulled from this endpoint by someone who hasn't paid.
 */
export async function GET(req: NextRequest) {
  const slug     = req.nextUrl.searchParams.get('slug') ?? ''
  const lessonId = req.nextUrl.searchParams.get('lesson') ?? ''

  const course = STATIC_COURSES.find(c => c.slug === slug)
  const found  = findLesson(slug, lessonId)
  if (!course || !found) return NextResponse.json({ provider: null }, { status: 404 })

  const builtIn = found.lesson.youtube_url ? getYouTubeId(found.lesson.youtube_url) : null

  let supabase: ReturnType<typeof import('@/lib/supabase/server').createClient> | null = null
  try {
    const { createClient } = await import('@/lib/supabase/server')
    supabase = createClient()
  } catch {
    supabase = null
  }

  // Approved submission for this lesson, if any
  let approved: { provider: string; video_id: string } | null = null
  if (supabase) {
    try {
      const { data } = await supabase.rpc('lesson_video', { p_course_slug: slug, p_lesson_key: lessonId })
      approved = Array.isArray(data) && data.length ? data[0] : null
    } catch { /* DB unavailable — fall back to the built-in video */ }
  }

  // No usable Bunny video (none approved, or Bunny not configured on this
  // deployment) → YouTube: approved YouTube submission, else built-in link.
  if (approved?.provider !== 'bunny' || !bunnyPlaybackConfigured()) {
    if (approved?.provider === 'bunny') approved = null
    const videoId = approved?.provider === 'youtube' ? approved.video_id : builtIn
    return NextResponse.json(videoId ? { provider: 'youtube', videoId } : { provider: null })
  }

  // ── Bunny: only signed for viewers allowed to watch this lesson ──
  if (!(course.is_free || found.lesson.is_free_preview)) {
    const access = supabase ? await checkPaidAccess(supabase, slug) : 'allowed'
    if (access !== 'allowed') {
      return NextResponse.json({ locked: true, reason: access }, { status: 403 })
    }
  }

  return NextResponse.json({ provider: 'bunny', embedUrl: bunnyEmbedUrl(approved.video_id) })
}

async function checkPaidAccess(
  supabase: NonNullable<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  slug: string,
): Promise<'allowed' | 'sign_in' | 'not_paid'> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'sign_in'

    const { data: course } = await supabase
      .from('courses').select('id, is_free, instructor_id').eq('slug', slug).single()
    // Same rule as /api/enrollment-check: a course not yet in the database
    // is in static/demo mode and open to signed-in learners.
    if (!course || course.is_free || course.instructor_id === user.id) return 'allowed'

    const [{ data: enrollment }, { data: profile }] = await Promise.all([
      supabase.from('enrollments').select('is_paid').eq('user_id', user.id).eq('course_id', course.id).maybeSingle(),
      supabase.from('profiles').select('role').eq('id', user.id).single(),
    ])
    if (enrollment?.is_paid || profile?.role === 'admin') return 'allowed'
    return 'not_paid'
  } catch {
    return 'not_paid'
  }
}
