import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 *
 * NEXT_PUBLIC_* vars are inlined into the client bundle at BUILD time, so they
 * MUST be present when `next build` runs (on Railway: set them in the service's
 * Variables tab, which the builder reads, then redeploy). If they're missing,
 * we throw a clear, greppable error instead of Supabase's generic
 * "supabaseUrl is required" — and callers that wrap this in try/catch (e.g.
 * AuthProvider) keep the marketing shell alive rather than white-screening.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '[Skillora] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'These are baked into the client bundle at build time — set them in your ' +
      'Railway service Variables tab and redeploy so they are present during `next build`.'
    )
  }

  return createBrowserClient(url, key)
}
