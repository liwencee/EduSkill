import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders, LIMITS } from '@/lib/rate-limit'
import { logger, logRequest, logResponse } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are Skillora Assistant, the friendly AI helper for Skillora — Nigeria's #1 skills, teaching, and jobs platform.

About Skillora:
- SkillUp: practical vocational & digital skills courses for youth (18+). Courses cost ₦8,000 for lifetime access, paid via Paystack.
- EduPro: CPD training and an AI Lesson Planner for teachers (₦5,000/month, or Institutional Licenses for schools/NGOs).
- OpportunityHub: a skills-based job marketplace where certified learners get matched to jobs, apprenticeships, and freelance gigs.
- Result Generator: a tool for teachers to generate student result sheets.
- Works offline on low-end Android phones and slow 2G connections; content available in English, Yoruba, Igbo, Hausa, and Pidgin.

Your job:
- Help users navigate the platform, understand courses, pricing, certificates, jobs, and how to apply.
- Give practical, encouraging answers in clear simple English. A little Pidgin warmth is welcome ("No wahala", "I dey here for you").
- Use Nigerian context and examples.
- Keep replies short and conversational (2-4 sentences unless the user asks for detail).
- If asked something outside Skillora or general learning/career help, gently steer back or give a brief helpful answer.
- Never invent fake prices, URLs, or features. If unsure, suggest contacting support via WhatsApp.
- Do not ask for or store phone numbers, passwords, or payment card details.`

interface ChatMessage { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  const ctx = logRequest('/api/chat', req)

  // ── Rate limiting (per IP) ──────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(ip, 'chat', LIMITS.chat.max, LIMITS.chat.windowMs)
  if (!rl.success) {
    logResponse('/api/chat', ctx, 429)
    return NextResponse.json(
      { error: 'You are sending messages too fast. Please wait a moment.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  let body: { messages?: ChatMessage[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  if (messages.length === 0) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 })
  }

  // Keep only the last 10 turns to bound cost, sanitise shape
  const history = messages
    .slice(-10)
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    logResponse('/api/chat', ctx, 200, { fallback: true })
    return NextResponse.json(
      { reply: "I'm here to help with Skillora! Right now my AI brain is offline, but you can explore courses under SkillUp, find jobs on OpportunityHub, or reach our team on WhatsApp support. 😊" },
      { headers: rateLimitHeaders(rl) }
    )
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content?.trim()
      ?? "Sorry, I didn't catch that. Could you rephrase?"

    logResponse('/api/chat', ctx, 200)
    return NextResponse.json({ reply }, { headers: rateLimitHeaders(rl) })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Chat completion failed', {
      route: '/api/chat',
      error: { message: error.message, name: error.name },
    })
    logResponse('/api/chat', ctx, 200, { fallback: true })
    return NextResponse.json(
      { reply: "I'm having trouble thinking right now. Please try again in a moment, or reach our team on WhatsApp support." },
      { headers: rateLimitHeaders(rl) }
    )
  }
}
