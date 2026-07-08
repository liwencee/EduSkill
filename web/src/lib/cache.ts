/**
 * Skillora — In-Memory LRU Response Cache
 *
 * Caches AI-generated responses (lesson plans, result recommendations)
 * to avoid duplicate OpenAI API calls for identical inputs.
 * Saves cost and reduces latency from ~8s to <50ms on cache hit.
 *
 * TTL defaults:
 *   • Lesson plans     — 7 days  (NERDC curriculum doesn't change)
 *   • AI result recs   — 2 hours (different student sets)
 *
 * For production at scale, replace with:
 *   @vercel/kv  (Redis on Vercel) or  Upstash Redis
 */

interface Entry<T> {
  value:     T
  expiresAt: number  // epoch ms
  hits:      number
}

class LRUCache<T> {
  private map     = new Map<string, Entry<T>>()
  private maxSize: number

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const entry = this.map.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key)
      return null
    }
    // Move to end = most recently used
    this.map.delete(key)
    entry.hits++
    this.map.set(key, entry)
    return entry.value
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.map.has(key)) this.map.delete(key)
    // Evict LRU entry when at capacity
    if (this.map.size >= this.maxSize) {
      const oldest = this.map.keys().next().value
      if (oldest) this.map.delete(oldest)
    }
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs, hits: 0 })
  }

  delete(key: string): void {
    this.map.delete(key)
  }

  has(key: string): boolean {
    const entry = this.map.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) { this.map.delete(key); return false }
    return true
  }

  /** Purge all expired entries (call periodically) */
  evictExpired(): number {
    const now = Date.now()
    let evicted = 0
    for (const [k, v] of this.map) {
      if (now > v.expiresAt) { this.map.delete(k); evicted++ }
    }
    return evicted
  }

  stats() {
    return { size: this.map.size, maxSize: this.maxSize }
  }
}

// ── Shared cache instances ────────────────────────────────────────

/** Lesson plan cache — up to 200 entries, 7-day TTL */
export const lessonPlanCache = new LRUCache<unknown>(200)

/** AI result recommendations cache — up to 100 entries, 2-hour TTL */
export const resultRecsCache = new LRUCache<unknown>(100)

export const CACHE_TTL = {
  lessonPlan:  7 * 24 * 60 * 60 * 1000,  // 7 days
  resultRecs:  2  * 60 * 60 * 1000,       // 2 hours
}

// ── Cache key builder ─────────────────────────────────────────────
/**
 * Deterministic hash key from arbitrary params.
 * Same inputs always produce the same key regardless of property order.
 */
export function cacheKey(params: Record<string, string | number | undefined>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, string | number | undefined>>((acc, k) => {
      acc[k] = params[k]
      return acc
    }, {})

  const str = JSON.stringify(sorted)
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash | 0   // keep as 32-bit int
  }
  return `ck_${Math.abs(hash).toString(36)}`
}

// ── Periodic eviction (prevents memory bloat) ─────────────────────
setInterval(() => {
  lessonPlanCache.evictExpired()
  resultRecsCache.evictExpired()
}, 30 * 60 * 1000)   // every 30 minutes
