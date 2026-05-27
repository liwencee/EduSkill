import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logger, logRequest, logResponse } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const PLAN_MAP: Record<string, { plan: string; days: number }> = {
  youth_monthly:      { plan: 'youth_premium',   days: 30 },
  teacher_monthly:    { plan: 'teacher_premium',  days: 30 },
  institutional_term: { plan: 'institutional',    days: 90 },
  result_gen_monthly: { plan: 'result_gen',       days: 30 }, // ₦5,000 result-generator add-on
}

export async function POST(req: NextRequest) {
  const ctx = logRequest('/api/paystack', req)

  // Dynamic import so @supabase/supabase-js never loads at build time
  const { createClient } = await import('@supabase/supabase-js')

  // Use service role to bypass RLS for webhook processing
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body).digest('hex')

  if (hash !== req.headers.get('x-paystack-signature')) {
    logger.warn('Paystack webhook — invalid signature', { route: '/api/paystack' })
    logResponse('/api/paystack', ctx, 401)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event !== 'charge.success') {
    // Acknowledge non-charge events without processing
    logger.info('Paystack webhook — ignored event', { route: '/api/paystack', eventType: event.event })
    logResponse('/api/paystack', ctx, 200)
    return NextResponse.json({ ok: true })
  }

  const { reference, amount, metadata } = event.data
  const userId = metadata?.user_id
  const planKey = metadata?.plan_key ?? 'youth_monthly'

  if (!userId) {
    logger.warn('Paystack charge.success — missing user_id in metadata', {
      route: '/api/paystack',
      reference,
    })
    logResponse('/api/paystack', ctx, 400)
    return NextResponse.json({ error: 'No user_id in metadata' }, { status: 400 })
  }

  const planInfo = PLAN_MAP[planKey] ?? PLAN_MAP.youth_monthly
  const expiresAt = new Date(Date.now() + planInfo.days * 24 * 60 * 60 * 1000).toISOString()
  const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM

  // Build the profile update — result_gen add-on is handled separately
  const isResultGenAddon = planKey === 'result_gen_monthly'
  const profileUpdate = isResultGenAddon
    ? { result_gen_unlocked: true, result_gen_period: currentPeriod, result_gen_count: 0 }
    : { subscription: planInfo.plan, subscription_expires_at: expiresAt }

  try {
    await Promise.all([
      supabase.from('payments').insert({
        user_id: userId,
        amount_ngn: amount / 100,
        plan: planInfo.plan,
        paystack_ref: reference,
        status: 'success',
        paid_at: new Date().toISOString(),
      }),
      supabase.from('profiles').update(profileUpdate).eq('id', userId),
    ])

    logger.info('Paystack charge.success — subscription activated', {
      route: '/api/paystack',
      userId,
      plan: planInfo.plan,
      amountNgn: amount / 100,
      reference,
      expiresAt,
    })
    logResponse('/api/paystack', ctx, 200)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Paystack webhook — DB write failed', {
      route: '/api/paystack',
      userId,
      reference,
      error: { message: error.message, name: error.name },
    })
    logResponse('/api/paystack', ctx, 500, { error: { message: error.message } })
    // Return 200 so Paystack doesn't retry — log the failure for manual resolution
    return NextResponse.json({ ok: true })
  }
}
