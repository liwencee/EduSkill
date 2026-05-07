import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body     = await request.json()
    const email    = (body.email    as string)?.trim()
    const password = body.password  as string
    const next     = (body.next     as string) || '/dashboard'

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json(
        { error: 'Server not configured. Contact support.' },
        { status: 500 }
      )
    }

    // Collect every cookie Supabase wants to write during sign-in
    const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(url, key, {
      cookies: {
        // No existing session needed for a fresh login
        getAll: () => [],
        // Intercept instead of writing to next/headers (which doesn't merge into NextResponse)
        setAll: (cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) => { pendingCookies.push(...cookiesToSet) },
      },
    })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const msg = error.message.toLowerCase()
      let friendly = error.message
      if (msg.includes('email not confirmed')) {
        friendly = 'Please verify your email first — check your inbox for the confirmation link.'
      } else if (
        msg.includes('invalid login') ||
        msg.includes('invalid credentials') ||
        msg.includes('invalid email or password') ||
        msg.includes('wrong password')
      ) {
        friendly = 'Wrong email or password. Please try again.'
      }
      return NextResponse.json({ error: friendly }, { status: 401 })
    }

    const role        = data.user?.user_metadata?.role ?? 'youth'
    const destination = next !== '/dashboard' ? next : `/dashboard/${role}`

    const response = NextResponse.json({ destination })

    // Explicitly attach the session cookies to the response so the browser
    // stores them (Set-Cookie headers) before window.location.href fires.
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
