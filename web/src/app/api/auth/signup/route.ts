import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders, LIMITS } from '@/lib/rate-limit'
import { logger, logRequest, logResponse } from '@/lib/logger'

export async function POST(request: Request) {
  const ctx = logRequest('/api/auth/signup', request)

  // ── Rate limit: 3 signups / minute per IP ──────────────────────
  const ip = getClientIp(request)
  const rl  = rateLimit(ip, 'signup', LIMITS.signup.max, LIMITS.signup.windowMs)
  if (!rl.success) {
    logger.warn('Signup rate limit exceeded', { ip, route: '/api/auth/signup' })
    logResponse('/api/auth/signup', ctx, 429)
    return NextResponse.json(
      { error: 'Too many signup attempts. Please wait before trying again.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  try {
    const body     = await request.json()
    const email    = (body.email    as string)?.trim()
    const password = body.password  as string
    const fullName = (body.fullName as string)?.trim()
    const role     = (body.role     as string) || 'youth'

    if (!password || password.length < 8) {
      logResponse('/api/auth/signup', ctx, 400)
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      logResponse('/api/auth/signup', ctx, 500)
      return NextResponse.json(
        { error: 'Server not configured. Contact support.' },
        { status: 500 }
      )
    }

    const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => [],
        setAll: (cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) => { pendingCookies.push(...cookiesToSet) },
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
      logger.warn('Signup failed', { ip, route: '/api/auth/signup', error: { message: error.message } })
      logResponse('/api/auth/signup', ctx, 400)
      return NextResponse.json({ error: friendly }, { status: 400 })
    }

    logger.info('Signup successful', { ip, route: '/api/auth/signup', userId: data.user?.id })
    logResponse('/api/auth/signup', ctx, 200)

    const destination = data.session ? `/dashboard/${role}` : '/auth/verify-email'

    const response = NextResponse.json({ destination })

    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    })

    return response
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Signup route error', {
      route: '/api/auth/signup',
      error: { message: error.message, name: error.name },
    })
    logResponse('/api/auth/signup', ctx, 500, { error: { message: error.message } })
    return NextResponse.json(
      { error: error.message ?? 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
