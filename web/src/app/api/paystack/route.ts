import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logger, logRequest, logResponse } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const PLAN_MAP: Record<string, { plan: string; days: number }> = {
  youth_monthly:      { plan: 'youth_premium',   days: 30    },
  teacher_monthly:    { plan: 'teacher_premium',  days: 30    },
  institutional_term: { plan: 'institutional',    days: 90    },
  result_gen_monthly: { plan: 'result_gen',       days: 30    }, // ₦5,000 result-generator add-on
  course_purchase:    { plan: 'course',           days: 36500 }, // ₦8,000 lifetime course access
}

// Minimum expected amount (NGN) per plan. The signature proves the payload
// came from Paystack, but `plan_key` is set at checkout-init time and can be
// tampered with — so we refuse to grant an expensive plan for a trivial
// payment. Set to the LOW end of each plan's price range; adjust to your
// real Paystack amounts.
const PLAN_MIN_NGN: Record<string, number> = {
  youth_monthly:      1500,
  teacher_monthly:    2000,
  institutional_term: 50000,
  result_gen_monthly: 5000,
  course_purchase:    8000,
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

  // Constant-time comparison to avoid leaking the signature via timing.
  const signature = req.headers.get('x-paystack-signature') ?? ''
  const expectedSig = Buffer.from(hash)
  const receivedSig = Buffer.from(signature)
  if (expectedSig.length !== receivedSig.length || !crypto.timingSafeEqual(expectedSig, receivedSig)) {
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
  const userId   = metadata?.user_id
  const planKey  = metadata?.plan_key ?? 'youth_monthly'
  const courseId = metadata?.course_id ?? null

  if (!userId) {
    logger.warn('Paystack charge.success — missing user_id in metadata', {
      route: '/api/paystack',
      reference,
    })
    logResponse('/api/paystack', ctx, 400)
    return NextResponse.json({ error: 'No user_id in metadata' }, { status: 400 })
  }

  const planInfo      = PLAN_MAP[planKey] ?? PLAN_MAP.youth_monthly
  const expiresAt     = new Date(Date.now() + planInfo.days * 24 * 60 * 60 * 1000).toISOString()
  const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM

  const isResultGenAddon = planKey === 'result_gen_monthly'
  const isCoursePurchase = planKey === 'course_purchase'

  // ── Idempotency: Paystack retries webhooks — never grant twice ───
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('paystack_ref', reference)
    .maybeSingle()
  if (existingPayment) {
    logger.info('Paystack webhook — duplicate reference ignored', { route: '/api/paystack', reference })
    logResponse('/api/paystack', ctx, 200)
    return NextResponse.json({ ok: true })
  }

  // ── Amount integrity: refuse to grant a plan that was underpaid ──
  const paidNgn = (amount ?? 0) / 100
  const minNgn  = PLAN_MIN_NGN[planKey]
  if (minNgn !== undefined && paidNgn < minNgn) {
    logger.warn('Paystack charge.success — amount below plan minimum; access NOT granted', {
      route: '/api/paystack', reference, userId, planKey, paidNgn, minNgn,
    })
    // Log the payment for manual review, but grant nothing.
    await supabase.from('payments').insert({
      user_id:      userId,
      amount_ngn:   paidNgn,
      plan:         planInfo.plan,
      paystack_ref: reference,
      status:       'amount_mismatch',
      paid_at:      new Date().toISOString(),
    })
    logResponse('/api/paystack', ctx, 200)
    return NextResponse.json({ ok: true })
  }

  try {
    // Always log the payment
    const paymentRow = {
      user_id:      userId,
      amount_ngn:   amount / 100,
      plan:         planInfo.plan,
      paystack_ref: reference,
      status:       'success',
      paid_at:      new Date().toISOString(),
    }

    if (isCoursePurchase) {
      // ── Course purchase: upsert enrollment ──────────────────────
      if (!courseId) {
        logger.warn('Paystack course_purchase — missing course_id in metadata', {
          route: '/api/paystack', reference, userId,
        })
        // Still acknowledge to prevent Paystack retries, but log for manual fix
        logResponse('/api/paystack', ctx, 200)
        return NextResponse.json({ ok: true })
      }

      await Promise.all([
        supabase.from('payments').insert(paymentRow),
        supabase.from('enrollments').upsert(
          {
            user_id:     userId,
            course_id:   courseId,
            is_paid:     true,
            payment_ref: reference,
          },
          { onConflict: 'user_id,course_id' },
        ),
      ])

      logger.info('Paystack charge.success — course enrollment activated', {
        route: '/api/paystack',
        userId,
        courseId,
        amountNgn: amount / 100,
        reference,
      })

    } else if (isResultGenAddon) {
      // ── Result-generator monthly add-on ─────────────────────────
      const profileUpdate = {
        result_gen_unlocked: true,
        result_gen_period:   currentPeriod,
        result_gen_count:    0,
      }

      await Promise.all([
        supabase.from('payments').insert(paymentRow),
        supabase.from('profiles').update(profileUpdate).eq('id', userId),
      ])

      logger.info('Paystack charge.success — result-gen add-on activated', {
        route: '/api/paystack',
        userId,
        amountNgn: amount / 100,
        reference,
        period: currentPeriod,
      })

    } else {
      // ── Subscription plan ────────────────────────────────────────
      const profileUpdate = {
        subscription:            planInfo.plan,
        subscription_expires_at: expiresAt,
      }

      await Promise.all([
        supabase.from('payments').insert(paymentRow),
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
    }

    logResponse('/api/paystack', ctx, 200)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Paystack webhook — DB write failed', {
      route: '/api/paystack',
      userId,
      reference,
      planKey,
      courseId,
      error: { message: error.message, name: error.name },
    })
    logResponse('/api/paystack', ctx, 500, { error: { message: error.message } })
    // Return 200 so Paystack doesn't retry — log the failure for manual resolution
    return NextResponse.json({ ok: true })
  }
}
