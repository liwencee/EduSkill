/**
 * EduSkill — Health Check Endpoint
 *
 * Used by:
 *   • Vercel uptime checks
 *   • UptimeRobot / Better Uptime / StatusPage monitors
 *   • Docker / k8s liveness probes
 *
 * GET /api/health  →  { status: 'ok', ts, version, env }
 * Returns 200 when healthy, 503 when degraded.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VERSION = process.env.npm_package_version ?? '1.0.0'

export async function GET() {
  const checks: Record<string, string> = {}

  // ── Supabase reachability ─────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    checks.supabase = 'missing env'
  } else {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method:  'HEAD',
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
        signal:  AbortSignal.timeout(3000),
      })
      checks.supabase = res.ok || res.status === 404 ? 'ok' : `http_${res.status}`
    } catch {
      checks.supabase = 'unreachable'
    }
  }

  // ── OpenAI env (key presence only — no live call) ─────────────
  checks.openai = process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'

  // ── Paystack env ──────────────────────────────────────────────
  checks.paystack = process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured'

  // ── Overall status ────────────────────────────────────────────
  const degraded = checks.supabase !== 'ok'
  const status   = degraded ? 'degraded' : 'ok'

  return NextResponse.json(
    {
      status,
      version: VERSION,
      env:     process.env.NODE_ENV ?? 'development',
      ts:      new Date().toISOString(),
      checks,
    },
    {
      status: degraded ? 503 : 200,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
