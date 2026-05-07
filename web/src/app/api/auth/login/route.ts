import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body     = await request.json()
    const email    = (body.email    as string)?.trim()
    const password = body.password  as string
    const next     = (body.next     as string) || '/dashboard'

    const supabase = createClient()
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

    // Cookies are set in the response by createServerClient's setAll callback.
    // The browser stores them when it receives this response.
    const role = data.user?.user_metadata?.role ?? 'youth'
    const destination = next !== '/dashboard' ? next : `/dashboard/${role}`

    return NextResponse.json({ destination })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
