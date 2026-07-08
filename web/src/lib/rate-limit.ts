/**
 * Skillora — Sliding-Window Rate Limiter
 *
 * Uses an in-process Map (works on Vercel serverless per-instance).
 * For multi-region / distributed rate limiting, swap the store for
 * Upstash Redis:  https://upstash.com/docs/redis/sdks/ratelimit
 *
 * Usage:
 *   const { success, remaining, retryAfterMs } = rateLimit(ip, 'lesson-plan', 10, 60_000)
 *   if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface Window {
  count:   number
  resetAt: number   // epoch ms
}

// Separate stores per rule-key to avoid cross-route interference
const stores = new Map<string, Map<string, Window>>()

function getStore(rule: string): Map<string, Window> {
  if (!stores.has(rule)) stores.set(rule, new Map())
  return stores.get(rule)!
}

// Evict expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const store of stores.values()) {
    for (const [key, win] of store) {
      if (now > win.resetAt) store.delete(key)
    }
  }
}, 5 * 60 * 1000)

// ─────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success:      boolean
  remaining:    number
  limit:        number
  resetAt:      number   // epoch ms
  retryAfterMs: number   // 0 when success
}

/**
 * Check if a key (typically IP address) is within its rate limit.
 *
 * @param key         — identifier (IP, user ID, …)
 * @param rule        — logical rule name ('login', 'lesson-plan', …)
 * @param maxRequests — max calls allowed in the window
 * @param windowMs    — window length in milliseconds
 */
export function rateLimit(
  key:         string,
  rule:        string,
  maxRequests: number,
  windowMs:    number,
): RateLimitResult {
  const store = getStore(rule)
  const now   = Date.now()
  const win   = store.get(key)

  if (!win || now > win.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: maxRequests - 1, limit: maxRequests, resetAt: now + windowMs, retryAfterMs: 0 }
  }

  if (win.count >= maxRequests) {
    return {
      success:      false,
      remaining:    0,
      limit:        maxRequests,
      resetAt:      win.resetAt,
      retryAfterMs: win.resetAt - now,
    }
  }

  win.count++
  return {
    success:      true,
    remaining:    maxRequests - win.count,
    limit:        maxRequests,
    resetAt:      win.resetAt,
    retryAfterMs: 0,
  }
}

// ── Pre-defined limits ────────────────────────────────────────────
export const LIMITS = {
  /** AI Lesson Planner — 10 plans per minute per IP */
  lessonPlan:     { max: 10,  windowMs: 60_000 },
  /** AI Lesson Content (SkillUp) — 20 per minute per IP */
  lessonContent:  { max: 20,  windowMs: 60_000 },
  /** Result Generator — 20 per minute per IP */
  generateResult: { max: 20,  windowMs: 60_000 },
  /** AI Assistant chat — 30 messages per minute per IP */
  chat:           { max: 30,  windowMs: 60_000 },
  /** Login — 5 attempts per minute per IP (brute-force guard) */
  login:          { max: 5,   windowMs: 60_000 },
  /** Signup — 3 per minute per IP */
  signup:         { max: 3,   windowMs: 60_000 },
  /** DOCX export — 15 per minute per IP */
  docxExport:     { max: 15,  windowMs: 60_000 },
  /** General API — 100 per minute per IP */
  general:        { max: 100, windowMs: 60_000 },
} as const

/** Extract the real client IP from Vercel/Next.js headers */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

/** Build standard 429 rate-limit response headers */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit':     String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset':     String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfterMs > 0 && {
      'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)),
    }),
  }
}
