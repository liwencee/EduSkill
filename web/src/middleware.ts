import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Only routes that truly need auth — public landing pages (/edupro, /skillup,
// /opportunity-hub, /employer) are accessible without login; only their
// authenticated sub-features and all /dashboard routes require a session.
// Only protect routes where we need a hard server-side block.
// Dashboard routes are protected client-side by RoleGuard (session lives
// in localStorage after client login — server can't always read the cookie).
const PROTECTED: string[] = [
  '/admin',
]
const AUTH_PAGES = ['/auth/login', '/auth/signup']

export async function middleware(request: NextRequest) {
  // ── Inject X-Request-ID for end-to-end tracing ────────────────
  // The ID is generated here (edge) so it flows through every server
  // component, API handler, and log line for the same request.
  const requestId = crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)

  // Guard against BOTH the var being unset AND being set to a malformed
  // value (e.g. missing the https:// scheme, or a misconfigured Railway
  // env var). This middleware's matcher covers almost every route, so an
  // uncaught throw here — unlike a client-side error — takes down every
  // single request on the entire site, not just the React tree after
  // hydration. Fail open: let pages render without middleware-level auth
  // redirects rather than 500 the whole app over a config problem.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let validUrl = false
  if (supabaseUrl) {
    try { new URL(supabaseUrl); validUrl = true } catch { validUrl = false }
  }

  if (!supabaseUrl || !validUrl || !supabaseKey) {
    if (supabaseUrl && !validUrl) {
      console.error(
        `[Skillora] NEXT_PUBLIC_SUPABASE_URL is set but is not a valid URL: "${supabaseUrl}". ` +
        'Check the Railway service Variables tab — it must be the full URL including https://.'
      )
    }
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('x-request-id', requestId)
    return res
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
  supabaseResponse.headers.set('x-request-id', requestId)

  let user = null
  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
            supabaseResponse.headers.set('x-request-id', requestId)
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Use getSession() here — it reads the JWT from the cookie without a
    // network round-trip to Supabase Auth. getUser() (which does a live
    // server call) is too slow/unreliable at the edge and causes the login
    // redirect loop: loginAction sets the cookie → middleware calls getUser()
    // before the cookie propagates → returns null → redirect back to /auth/login.
    // Security-sensitive server components call getUser() independently.
    const { data } = await supabase.auth.getSession()
    user = data.session?.user ?? null
  } catch {
    // Client construction or cookie parse error — treat as unauthenticated
  }

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  if (!user && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
