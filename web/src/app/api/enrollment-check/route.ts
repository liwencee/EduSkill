import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/enrollment-check?slug=<course-slug>
 *
 * Returns whether the current user has a paid enrollment for the given course.
 * Used by the lesson page to gate access behind payment.
 *
 * Response shape:
 * {
 *   enrolled:  boolean,
 *   is_paid:   boolean,
 *   is_free:   boolean,   // true = course is free, no payment required
 *   course_id: string | null,
 *   price_ngn: number,
 *   user_id:   string | null,
 *   email:     string | null,
 * }
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ enrolled: false, is_paid: false, is_free: false, course_id: null, price_ngn: 8000, user_id: null, email: null })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // Look up course by slug to get its real UUID and pricing
    const { data: course } = await supabase
      .from('courses')
      .select('id, price_ngn, is_free')
      .eq('slug', slug)
      .single()

    if (!user) {
      return NextResponse.json({
        enrolled:  false,
        is_paid:   false,
        is_free:   course?.is_free ?? false,
        course_id: course?.id ?? null,
        price_ngn: course?.price_ngn ?? 8000,
        user_id:   null,
        email:     null,
      })
    }

    if (!course) {
      // Course not in DB yet — allow access (static/demo mode)
      return NextResponse.json({
        enrolled:  true,
        is_paid:   true,
        is_free:   true,
        course_id: null,
        price_ngn: 8000,
        user_id:   user.id,
        email:     user.email ?? null,
      })
    }

    // Free course — no payment needed
    if (course.is_free) {
      return NextResponse.json({
        enrolled:  true,
        is_paid:   true,
        is_free:   true,
        course_id: course.id,
        price_ngn: 0,
        user_id:   user.id,
        email:     user.email ?? null,
      })
    }

    // Check enrollment for paid course
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('is_paid')
      .eq('user_id',   user.id)
      .eq('course_id', course.id)
      .single()

    return NextResponse.json({
      enrolled:  !!enrollment,
      is_paid:   enrollment?.is_paid ?? false,
      is_free:   false,
      course_id: course.id,
      price_ngn: course.price_ngn ?? 8000,
      user_id:   user.id,
      email:     user.email ?? null,
    })
  } catch {
    // Fail open — allow access if DB check errors (prevents lockout during outages)
    return NextResponse.json({ enrolled: true, is_paid: true, is_free: true, course_id: null, price_ngn: 8000, user_id: null, email: null })
  }
}
