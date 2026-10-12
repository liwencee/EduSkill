import { NextRequest, NextResponse } from 'next/server'
import { STATIC_COURSES } from '@/lib/static-courses'
import { findLesson } from '@/lib/course-content'
import { bunnyConfigured, createBunnyVideo, bunnyUploadSignature } from '@/lib/bunny'
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/** GET /api/bunny/upload — is video uploading switched on? */
export async function GET() {
  return NextResponse.json({ configured: bunnyConfigured() })
}

/**
 * POST /api/bunny/upload  { courseSlug, lessonKey }
 *
 * Creates an empty video in the Bunny library and returns short-lived
 * credentials for the creator's browser to upload the file straight to
 * Bunny over TUS (the file never passes through our server).
 */
export async function POST(req: NextRequest) {
  if (!bunnyConfigured()) {
    return NextResponse.json({ error: 'Video uploads are not set up yet.' }, { status: 503 })
  }

  let user: { id: string } | null = null
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { data } = await createClient().auth.getUser()
    user = data.user
  } catch { user = null }
  if (!user) return NextResponse.json({ error: 'Please sign in to upload videos.' }, { status: 401 })

  // Each call creates a video in the library — cap it per creator.
  const rl = rateLimit(user.id, 'bunnyUpload:user', 20, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many uploads started. Please wait a while and try again.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: { courseSlug?: string; lessonKey?: string }
  try { body = await req.json() } catch { body = {} }
  const course = STATIC_COURSES.find(c => c.slug === body.courseSlug)
  const found  = body.courseSlug && body.lessonKey ? findLesson(body.courseSlug, body.lessonKey) : null
  if (!course || !found) return NextResponse.json({ error: 'Choose a valid course and lesson.' }, { status: 400 })

  try {
    const videoId = await createBunnyVideo(`${course.title} — ${found.lesson.title}`)
    return NextResponse.json(bunnyUploadSignature(videoId))
  } catch (e) {
    logger.error('Bunny video create failed', { userId: user.id, error: { message: String(e) } })
    return NextResponse.json({ error: 'Could not start the upload. Please try again.' }, { status: 502 })
  }
}
