import { NextRequest, NextResponse } from 'next/server'

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
  const { subject, topic, grade, duration, objectives } = await req.json()
  if (!subject || !topic || !grade) {
    return NextResponse.json({ error: 'subject, topic, and grade are required' }, { status: 400 })
  }

  // If no OpenAI key, return a rich static fallback immediately
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ plan: buildFallback(subject, topic, grade, duration, objectives) })
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
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey })

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
    return NextResponse.json({ plan })
  } catch (err) {
    console.error('Lesson plan generation error:', err)
    // Fall back to static plan so the teacher always gets something useful
    return NextResponse.json({ plan: buildFallback(subject, topic, grade, duration, objectives) })
  }
}

function buildFallback(
  subject: string, topic: string, grade: string,
  duration = '45 minutes', objectives?: string
) {
  return {
    overview: `This lesson introduces students in ${grade} to the topic of "${topic}" within the ${subject} curriculum. By the end of the lesson, students will be able to identify, explain and apply the core concepts through guided activities and discussion. The lesson is designed for a typical Nigerian classroom environment with mixed ability learners.`,
    learning_objectives: [
      `Students will be able to define and explain the concept of "${topic}" in their own words`,
      `Students will be able to identify at least three key features or examples related to "${topic}"`,
      objectives ? objectives : `Students will apply their knowledge of "${topic}" through a practical class activity`,
    ],
    materials_needed: [
      'Chalkboard and chalk',
      'Textbooks and exercise books',
      'Cardboard / chart paper for display',
      'Markers or crayons',
      'Sample worksheets (teacher-prepared)',
    ],
    introduction: {
      duration: '5–8 minutes',
      activity: `Begin by asking students what they already know about ${topic}. Write key words on the board as students respond. Use a relatable Nigerian example or everyday context to spark interest. State the lesson objectives clearly and explain why this topic matters to them.`,
    },
    main_activity: {
      duration: '25–30 minutes',
      steps: [
        `Explanation (10 min): Present the key concepts of "${topic}" using the chalkboard. Use local Nigerian examples to make the content relatable. Ask comprehension questions throughout.`,
        `Guided Practice (10 min): Work through two or three examples together as a class. Invite volunteer students to attempt answers on the board. Provide corrective feedback and encourage participation.`,
        `Group Activity (10 min): Divide the class into small groups of 4–5. Each group discusses or completes a short task related to "${topic}" and shares their findings with the class.`,
      ],
    },
    assessment: {
      type: 'Class exercise / Observation',
      description: `Give students a short 3–5 question exercise on "${topic}" to complete individually in their exercise books. Walk around to observe progress and provide support. Collect books for marking or review answers orally as a class.`,
    },
    closure: {
      duration: '5 minutes',
      activity: `Summarise the key points covered in the lesson by asking students: "What did we learn today?" Write a brief summary on the board. Acknowledge student participation. Preview what will be covered in the next lesson.`,
    },
    differentiation: {
      support: `Pair struggling learners with stronger peers during the group activity. Provide simplified worksheets with sentence starters and visual aids. Check in with this group more frequently during independent work.`,
      extension: `Challenge advanced learners to create their own examples of "${topic}", write a short paragraph explaining the concept to a younger student, or attempt a higher-order question from the textbook.`,
    },
    homework: `Students should write a short paragraph (5–8 sentences) explaining "${topic}" in their own words and give two examples from their daily life in Nigeria. To be submitted at the start of the next class.`,
  }
}
