import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are an expert Nigerian educator specialising in curriculum design aligned to the NERDC (Nigerian Educational Research and Development Council) curriculum.
Generate detailed, practical lesson plans for Nigerian classrooms. Consider:
- Local examples, contexts, and resources available in Nigerian schools
- Mixed-ability classrooms common in Nigerian public schools
- Limited resources (chalk boards, limited electricity, basic materials)
- Local languages and cultural contexts
- The specific requirements of the Nigerian national curriculum
- Practical, activity-based learning appropriate for Nigerian students

Always respond with valid JSON matching the exact schema provided.`

export async function POST(req: NextRequest) {
  // Dynamic import so openai package never loads at build time
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify teacher role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Only teachers can use the lesson planner' }, { status: 403 })
  }

  const { subject, topic, grade, duration, objectives } = await req.json()
  if (!subject || !topic || !grade) {
    return NextResponse.json({ error: 'subject, topic, and grade are required' }, { status: 400 })
  }

  const userPrompt = `
Create a lesson plan for:
- Subject: ${subject}
- Topic: ${topic}
- Grade/Class: ${grade}
- Duration: ${duration}
${objectives ? `- Key objectives: ${objectives}` : ''}

Return ONLY valid JSON in this exact schema:
{
  "overview": "2-3 sentence lesson overview",
  "learning_objectives": ["objective 1", "objective 2", "objective 3"],
  "materials_needed": ["item 1", "item 2"],
  "introduction": { "duration": "5 minutes", "activity": "description" },
  "main_activity": { "duration": "25 minutes", "steps": ["step 1", "step 2", "step 3"] },
  "assessment": { "type": "Quiz/Observation/Class work", "description": "description" },
  "closure": { "duration": "5 minutes", "activity": "description" },
  "differentiation": { "support": "for struggling learners", "extension": "for advanced learners" },
  "homework": "optional homework description or null"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const plan = JSON.parse(raw)

    // Persist in background (don't block response)
    supabase.from('lesson_plans').insert({
      teacher_id: user.id,
      title: topic,
      subject,
      grade_level: grade,
      objectives: plan.learning_objectives,
      content_json: plan,
    }).then(() => {})

    return NextResponse.json({ plan })
  } catch (err) {
    console.error('Lesson plan generation error:', err)
    return NextResponse.json({ error: 'Failed to generate lesson plan' }, { status: 500 })
  }
}
