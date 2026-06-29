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

/** Keyword-based fallback so the bot still helps when the AI is unavailable. */
function fallbackReply(text: string): string {
  const q = text.toLowerCase()
  if (/course|learn|study|skill|class/.test(q))
    return "On SkillUp you can learn practical skills like Fashion Design, Coding, Digital Marketing, Phone Repair, Catering and more. Each course is ₦8,000 for lifetime access and works offline. Tap 'For Youth' in the menu to browse them all! 🎓"
  if (/price|cost|pay|much|fee|₦|naira/.test(q))
    return "Courses are ₦8,000 one-time for lifetime access. Teachers can subscribe to EduPro for ₦5,000/month, and schools/NGOs can get an Institutional License. Payments are made securely through Paystack. 💳"
  if (/job|work|employ|hire|apply|vacancy|gig/.test(q))
    return "Head to OpportunityHub (the 'Jobs' menu) to find jobs, apprenticeships, and freelance gigs. Finish a course, earn your certificate, and you'll get matched to roles that fit your skills. 💼"
  if (/teacher|cpd|lesson|edupro/.test(q))
    return "Teachers get CPD courses, digital certificates, and an AI Lesson Planner that saves hours every week. Tap 'For Teachers' to explore EduPro. 👩🏽‍🏫"
  if (/certificate|cert|badge/.test(q))
    return "When you complete a course and pass the assessment, you earn a verifiable digital certificate you can share with employers and add to your profile on OpportunityHub. 🏆"
  return "I'm here to help with Skillora! You can explore courses under SkillUp, find jobs on OpportunityHub, or reach our team on WhatsApp support. What would you like to know? 😊"
}

async function getUser(): Promise<{ id: string } | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    return data.user ? { id: data.user.id } : null
  } catch {
    return null
  }
}

// ── GET: load the signed-in user's chat history ─────────────────────────────
export async function GET(req: NextRequest) {
  const ctx = logRequest('/api/chat', req)
  const user = await getUser()
  if (!user) {
    logResponse('/api/chat', ctx, 200)
    return NextResponse.json({ messages: [] })
  }
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data } = await supabase
      .from('ai_chat_messages')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(100)
    logResponse('/api/chat', ctx, 200)
    return NextResponse.json({ messages: data ?? [] })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Chat history load failed', { route: '/api/chat', error: { message: error.message } })
    logResponse('/api/chat', ctx, 200)
    return NextResponse.json({ messages: [] })
  }
}

// ── POST: send a message, get a reply, persist both (if signed in) ──────────
export async function POST(req: NextRequest) {
  const ctx = logRequest('/api/chat', req)

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

  const history = messages
    .slice(-10)
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))

  const lastUserMsg = [...history].reverse().find(m => m.role === 'user')?.content ?? ''

  const user = await getUser()

  // Persist the user's message + the assistant reply for signed-in users.
  async function persist(userText: string, assistantText: string) {
    if (!user) return
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      const rows = [
        { user_id: user.id, role: 'user',      content: userText.slice(0, 4000) },
        { user_id: user.id, role: 'assistant', content: assistantText.slice(0, 4000) },
      ].filter(r => r.content.length > 0)
      if (rows.length) await supabase.from('ai_chat_messages').insert(rows)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.warn('Chat persist failed', { route: '/api/chat', error: { message: error.message } })
    }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    const reply = fallbackReply(lastUserMsg)
    await persist(lastUserMsg, reply)
    logResponse('/api/chat', ctx, 200, { fallback: 'no-key' })
    return NextResponse.json({ reply }, { headers: rateLimitHeaders(rl) })
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

    await persist(lastUserMsg, reply)
    logResponse('/api/chat', ctx, 200)
    return NextResponse.json({ reply }, { headers: rateLimitHeaders(rl) })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    // Surface the real cause in logs (Vercel → Logs) for diagnosis, e.g.
    // invalid_api_key, insufficient_quota, model_not_found.
    logger.error('Chat completion failed', {
      route: '/api/chat',
      error: { message: error.message, name: error.name },
    })
    const reply = fallbackReply(lastUserMsg)
    await persist(lastUserMsg, reply)
    logResponse('/api/chat', ctx, 200, { fallback: 'error' })
    return NextResponse.json({ reply }, { headers: rateLimitHeaders(rl) })
  }
}
