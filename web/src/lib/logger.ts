/**
 * EduSkill — Structured Logger
 *
 * Outputs JSON in production (ingested by Vercel / Datadog / Sentry).
 * Pretty-prints with emoji in development for readability.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info('Lesson plan generated', { route: '/api/lesson-plan', teacherId })
 *   logger.error('OpenAI call failed', { error, route })
 */

type Level = 'debug' | 'info' | 'warn' | 'error'

interface LogMeta {
  route?:     string
  userId?:    string
  ip?:        string
  requestId?: string
  durationMs?: number
  statusCode?: number
  error?: {
    message: string
    name?:  string
    stack?: string
    code?:  string | number
  }
  [key: string]: unknown
}

interface LogEntry extends LogMeta {
  level:     Level
  message:   string
  timestamp: string
  service:   string
  env:       string
}

const IS_PROD = process.env.NODE_ENV === 'production'
const SERVICE = 'eduskill-web'

const ICONS: Record<Level, string> = {
  debug: '🔍',
  info:  'ℹ️ ',
  warn:  '⚠️ ',
  error: '❌',
}

function emit(level: Level, message: string, meta: LogMeta = {}) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service:   SERVICE,
    env:       process.env.NODE_ENV ?? 'development',
    ...meta,
  }

  if (IS_PROD) {
    // Structured JSON — parsed by Vercel log drain / Datadog / Sentry
    const fn = level === 'error' ? console.error
             : level === 'warn'  ? console.warn
             : console.log
    fn(JSON.stringify(entry))
  } else {
    // Human-readable in dev
    const { level: _l, message: _m, timestamp, service: _s, env: _e, ...rest } = entry
    const base = `${ICONS[level]} [${timestamp}] ${message}`
    if (Object.keys(rest).length > 0) {
      console[level === 'debug' ? 'log' : level](base, rest)
    } else {
      console[level === 'debug' ? 'log' : level](base)
    }
  }
}

// ── Public API ────────────────────────────────────────────────────
export const logger = {
  debug: (msg: string, meta?: LogMeta) => emit('debug', msg, meta),
  info:  (msg: string, meta?: LogMeta) => emit('info',  msg, meta),
  warn:  (msg: string, meta?: LogMeta) => emit('warn',  msg, meta),
  error: (msg: string, meta?: LogMeta) => emit('error', msg, meta),
}

// ── Request logger helper ─────────────────────────────────────────
/** Call at the start of every API route handler */
export function logRequest(route: string, req: Request, extra?: LogMeta) {
  const requestId = crypto.randomUUID()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  logger.info(`→ ${req.method} ${route}`, { route, ip, requestId, ...extra })
  return { requestId, ip, startedAt: Date.now() }
}

/** Call at the end of every API route handler */
export function logResponse(
  route: string,
  ctx: ReturnType<typeof logRequest>,
  statusCode: number,
  meta?: LogMeta,
) {
  const durationMs = Date.now() - ctx.startedAt
  const level: Level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
  emit(level, `← ${statusCode} ${route} (${durationMs}ms)`, {
    route, statusCode, durationMs,
    requestId: ctx.requestId,
    ip: ctx.ip,
    ...meta,
  })
}
