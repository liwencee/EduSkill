import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body     = await request.json()
    const email    = (body.email    as string)?.trim()
    const password = body.password  as string
    const fullName = (body.fullName as string)?.trim()
    const role     = (body.role     as string) || 'youth'

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      let friendly = error.message
      if (msg.includes('already registered') || msg.includes('already exists')) {
        friendly = 'An account with this email already exists. Try logging in instead.'
      }
      return NextResponse.json({ error: friendly }, { status: 400 })
    }

    // If session is present, email confirmation is disabled → log straight in
    if (data.session) {
      return NextResponse.json({ destination: `/dashboard/${role}` })
    }

    // Email confirmation required
    return NextResponse.json({ destination: '/auth/verify-email' })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
