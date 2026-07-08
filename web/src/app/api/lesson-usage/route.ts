import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FREE_LIMIT = 3

// Returns the signed-in teacher's AI Lesson Planner quota for the current month.
export async function GET(_req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription, subscription_expires_at, lesson_plan_count, lesson_plan_period, lesson_plan_unlocked')
      .eq('id', session.user.id)
      .single()

    const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM

    const isNewPeriod = !profile || profile.lesson_plan_period !== currentPeriod
    const count       = isNewPeriod ? 0 : (profile?.lesson_plan_count ?? 0)
    const unlocked    = !isNewPeriod && (profile?.lesson_plan_unlocked ?? false)

    const isActivePremium =
      (profile?.subscription === 'teacher_premium' || profile?.subscription === 'institutional') &&
      !!profile?.subscription_expires_at &&
      new Date(profile.subscription_expires_at) > new Date()

    return NextResponse.json({
      count,
      limit:     FREE_LIMIT,
      remaining: isActivePremium || unlocked ? null : Math.max(0, FREE_LIMIT - count),
      unlocked,
      isPremium: isActivePremium,
      period:    currentPeriod,
    })
  } catch {
    // Supabase env vars missing / columns absent — permissive default so the page still works
    return NextResponse.json({
      count: 0, limit: FREE_LIMIT, remaining: FREE_LIMIT,
      unlocked: false, isPremium: false, period: '',
    })
  }
}
