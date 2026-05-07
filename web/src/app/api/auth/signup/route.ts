import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json(
        { error: 'Server not configured. Contact support.' },
        { status: 500 }
      )
    }

    const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => [],
        setAll: (cookiesToSet) => { pendingCookies.push(...cookiesToSet) },
      },
    })

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

    const destination = data.session ? `/dashboard/${role}` : '/auth/verify-email'

    const response = NextResponse.json({ destination })

    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
