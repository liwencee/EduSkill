import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders, LIMITS } from '@/lib/rate-limit'
import { logger, logRequest, logResponse } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are Skillora AI, a friendly and expert vocational skills tutor for Nigerian youth and professionals.
Your lessons are:
- Practical and immediately applicable in the Nigerian context
- Written in clear, simple English (B1 level) with occasional Pidgin phrases for warmth
- Full of local examples (Lagos markets, Kano traders, Abuja professionals, rural farmers)
- Structured for learners who may have limited data — concise but complete
- Encouraging and motivational

Always respond with valid JSON matching the exact schema provided.`

export async function POST(req: NextRequest) {
  const ctx = logRequest('/api/lesson-content', req)

  // ── Rate limiting ────────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl  = rateLimit(ip, 'lessonContent', LIMITS.lessonContent.max, LIMITS.lessonContent.windowMs)
  if (!rl.success) {
    logger.warn('Rate limit exceeded — lesson-content', { ip, route: '/api/lesson-content' })
    logResponse('/api/lesson-content', ctx, 429)
    return NextResponse.json(
      { error: 'Too many requests. Please wait before loading the next lesson.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  // ── Require an authenticated session ─────────────────────────────
  // No anonymous calls: gpt-4o is expensive and the IP limiter above is
  // per-serverless-instance, so an unauthenticated endpoint is a
  // denial-of-wallet risk. Block first, then apply a real per-user budget.
  let user: { id: string } | null = null
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }
  if (!user) {
    logResponse('/api/lesson-content', ctx, 401)
    return NextResponse.json(
      { error: 'Please sign in to load lessons.' },
      { status: 401, headers: rateLimitHeaders(rl) }
    )
  }

  // Per-user budget (the real control — survives IP rotation)
  const userRl = rateLimit(user.id, 'lessonContent:user', LIMITS.lessonContent.max, LIMITS.lessonContent.windowMs)
  if (!userRl.success) {
    logger.warn('Per-user rate limit exceeded — lesson-content', { userId: user.id, route: '/api/lesson-content' })
    logResponse('/api/lesson-content', ctx, 429)
    return NextResponse.json(
      { error: 'Too many requests. Please wait before loading the next lesson.' },
      { status: 429, headers: rateLimitHeaders(userRl) }
    )
  }

  const { courseTitle, lessonTitle, moduleTitle } = await req.json()
  if (!courseTitle || !lessonTitle) {
    logResponse('/api/lesson-content', ctx, 400)
    return NextResponse.json({ error: 'courseTitle and lessonTitle are required' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    logger.warn('No OPENAI_API_KEY — using fallback lesson content', { route: '/api/lesson-content' })
    logResponse('/api/lesson-content', ctx, 200, { fallback: true })
    return NextResponse.json(
      { content: buildFallback(courseTitle, lessonTitle, moduleTitle) },
      { headers: rateLimitHeaders(rl) }
    )
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey })

    const prompt = `
Create a complete, engaging lesson for the Skillora platform.

Course: "${courseTitle}"
Module: "${moduleTitle ?? ''}"
Lesson: "${lessonTitle}"

Return ONLY valid JSON in this exact schema:
{
  "ai_intro": "2-3 sentence warm, motivating introduction by the AI tutor (use 'you' and local Nigerian context)",
  "key_concepts": ["concept 1", "concept 2", "concept 3", "concept 4"],
  "sections": [
    { "heading": "Section heading", "body": "3-5 sentence explanation with Nigerian examples. Be practical and specific." },
    { "heading": "Section heading", "body": "..." },
    { "heading": "Section heading", "body": "..." }
  ],
  "practical_tip": "One actionable tip a learner can try today in Nigeria",
  "quiz": [
    {
      "question": "Clear, specific question testing the lesson content",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Why this answer is correct, with Nigerian context"
    },
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": 1,
      "explanation": "..."
    },
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": 2,
      "explanation": "..."
    }
  ],
  "summary": "2-sentence lesson summary and what the learner can now do"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const content = JSON.parse(raw)
    logResponse('/api/lesson-content', ctx, 200)
    return NextResponse.json({ content }, { headers: { 'X-Cache': 'MISS', ...rateLimitHeaders(rl) } })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Lesson content generation failed', {
      route: '/api/lesson-content',
      error: { message: error.message, name: error.name },
    })
    logResponse('/api/lesson-content', ctx, 200, { fallback: true, error: { message: error.message } })
    return NextResponse.json(
      { content: buildFallback(courseTitle, lessonTitle, moduleTitle) },
      { headers: rateLimitHeaders(rl) }
    )
  }
}

function buildFallback(courseTitle: string, lessonTitle: string, moduleTitle?: string) {
  return {
    ai_intro: `Welcome to "${lessonTitle}" — part of your ${courseTitle} journey! This lesson will give you practical knowledge you can apply immediately, whether you're in Lagos, Kano, Enugu or anywhere across Nigeria. Let's dive in!`,
    key_concepts: [
      `Core principles of ${lessonTitle}`,
      'Practical application in the Nigerian market',
      'Tools and resources you need',
      'Common mistakes to avoid',
    ],
    sections: [
      {
        heading: `What is ${lessonTitle}?`,
        body: `${lessonTitle} is a foundational topic within ${moduleTitle ?? courseTitle}. Understanding this concept will help you build real-world skills that employers and clients in Nigeria are actively looking for. Many successful Nigerian professionals started exactly where you are now — with curiosity and the willingness to learn.`,
      },
      {
        heading: 'Why This Matters in Nigeria',
        body: `Nigeria has one of the youngest and fastest-growing populations in Africa, which means there is enormous demand for skilled professionals in every sector. Whether you are in a major city or a smaller town, mastering this topic can open doors to new income streams, better employment, and the ability to start your own business.`,
      },
      {
        heading: 'How to Apply This Practically',
        body: `Start small and be consistent. Many successful Nigerian entrepreneurs and professionals began by practising their skills on small projects — helping neighbours, taking on low-cost jobs, or offering free services to build their portfolio. The key is to take action, learn from each experience, and improve every week.`,
      },
    ],
    practical_tip: `Today, write down three ways you could use what you learned in "${lessonTitle}" to earn money or improve your work within the next 30 days.`,
    quiz: [
      {
        question: `What is the most important reason to study ${lessonTitle}?`,
        options: [
          'To pass an exam',
          'To build practical skills for employment and business',
          'To impress friends',
          'Because it is compulsory',
        ],
        answer: 1,
        explanation: `Building practical, applicable skills is the core purpose of Skillora. Every lesson is designed to help you earn more, work better, or start a business in the Nigerian context.`,
      },
      {
        question: 'What is the best way to master a new skill?',
        options: [
          'Read about it once and move on',
          'Watch videos without practising',
          'Practise consistently and apply it to real projects',
          'Wait until you feel completely ready',
        ],
        answer: 2,
        explanation: `Consistent practice and real-world application is how skills become second nature. Every professional you admire got there through deliberate, repeated practice — not just theory.`,
      },
      {
        question: 'How can skills learned on Skillora be monetised in Nigeria?',
        options: [
          'They cannot — only degrees matter',
          'Only in Lagos and Abuja',
          'Through freelancing, employment, or starting a small business',
          'Only after 10 years of experience',
        ],
        answer: 2,
        explanation: `Skillora skills are designed to be immediately monetisable. Learners are finding freelance clients, getting hired, and launching businesses across all 36 states of Nigeria.`,
      },
    ],
    summary: `You have completed "${lessonTitle}" and gained a solid understanding of how this topic applies in the Nigerian context. Apply what you have learned today and move confidently to the next lesson.`,
  }
}
