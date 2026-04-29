import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const PLAN_MAP: Record<string, { plan: string; days: number }> = {
  youth_monthly:      { plan: 'youth_premium',   days: 30 },
  teacher_monthly:    { plan: 'teacher_premium',  days: 30 },
  institutional_term: { plan: 'institutional',    days: 90 },
}

export async function POST(req: NextRequest) {
  // Use service role to bypass RLS for webhook processing
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body).digest('hex')

  if (hash !== req.headers.get('x-paystack-signature')) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  if (event.event !== 'charge.success') return NextResponse.json({ ok: true })

  const { reference, amount, customer, metadata } = event.data
  const userId = metadata?.user_id
  const planKey = metadata?.plan_key ?? 'youth_monthly'

  if (!userId) return NextResponse.json({ error: 'No user_id in metadata' }, { status: 400 })

  const planInfo = PLAN_MAP[planKey] ?? PLAN_MAP.youth_monthly
  const expiresAt = new Date(Date.now() + planInfo.days * 24 * 60 * 60 * 1000).toISOString()

  await Promise.all([
    supabase.from('payments').insert({
      user_id: userId,
      amount_ngn: amount / 100,
      plan: planInfo.plan,
      paystack_ref: reference,
      status: 'success',
      paid_at: new Date().toISOString(),
    }),
    supabase.from('profiles').update({
      subscription: planInfo.plan,
      subscription_expires_at: expiresAt,
    }).eq('id', userId),
  ])

  return NextResponse.json({ ok: true })
}
