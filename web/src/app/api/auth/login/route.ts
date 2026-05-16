import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders, LIMITS } from '@/lib/rate-limit'
import { logger, logRequest, logResponse } from '@/lib/logger'

export async function POST(request: Request) {
  const ctx = logRequest('/api/auth/login', request)

  // ── Brute-force rate limit: 5 attempts / minute per IP ─────────
  const ip = getClientIp(request)
  const rl  = rateLimit(ip, 'login', LIMITS.login.max, LIMITS.login.windowMs)
  if (!rl.success) {
    logger.warn('Login rate limit exceeded', { ip, route: '/api/auth/login' })
    logResponse('/api/auth/login', ctx, 429)
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 60 seconds and try again.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  try {
    const body     = await request.json()
    const email    = (body.email    as string)?.trim()
    const password = body.password  as string
    const next     = (body.next     as string) || '/dashboard'

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      logResponse('/api/auth/login', ctx, 500)
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
      logger.warn('Login failed', { ip, route: '/api/auth/login', error: { message: error.message } })
      logResponse('/api/auth/login', ctx, 401)
      return NextResponse.json({ error: friendly }, { status: 401 })
    }

    const role        = data.user?.user_metadata?.role ?? 'youth'
    const destination = next !== '/dashboard' ? next : `/dashboard/${role}`

    logger.info('Login successful', { ip, route: '/api/auth/login', userId: data.user?.id })
    logResponse('/api/auth/login', ctx, 200)

    const response = NextResponse.json({ destination })

    // Explicitly attach the session cookies to the response so the browser
    // stores them (Set-Cookie headers) before window.location.href fires.
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    })

    return response
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Login route error', {
      route: '/api/auth/login',
      error: { message: error.message, name: error.name },
    })
    logResponse('/api/auth/login', ctx, 500, { error: { message: error.message } })
    return NextResponse.json(
      { error: error.message ?? 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
