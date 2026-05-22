import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Only routes that truly need auth — public landing pages (/edupro, /skillup,
// /opportunity-hub, /employer) are accessible without login; only their
// authenticated sub-features and all /dashboard routes require a session.
const PROTECTED: string[] = ['/admin']
const AUTH_PAGES = ['/auth/login', '/auth/signup']

export async function middleware(request: NextRequest) {
  // ── Inject X-Request-ID for end-to-end tracing ────────────────
  // The ID is generated here (edge) so it flows through every server
  // component, API handler, and log line for the same request.
  const requestId = crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('x-request-id', requestId)
    return res
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
  supabaseResponse.headers.set('x-request-id', requestId)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Auth error (e.g. invalid/missing key) — treat as unauthenticated
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
