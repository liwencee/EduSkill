import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FREE_LIMIT = 3

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
      .select('subscription, subscription_expires_at, result_gen_count, result_gen_period, result_gen_unlocked')
      .eq('id', session.user.id)
      .single()

    const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM

    const isNewPeriod = !profile || profile.result_gen_period !== currentPeriod
    const count       = isNewPeriod ? 0 : (profile?.result_gen_count ?? 0)
    const unlocked    = !isNewPeriod && (profile?.result_gen_unlocked ?? false)

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
    // Supabase env vars missing — return permissive default so page still works
    return NextResponse.json({
      count: 0, limit: FREE_LIMIT, remaining: FREE_LIMIT,
      unlocked: false, isPremium: false, period: '',
    })
  }
}
