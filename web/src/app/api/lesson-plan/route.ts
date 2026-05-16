import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders, LIMITS } from '@/lib/rate-limit'
import { logger, logRequest, logResponse } from '@/lib/logger'
import { lessonPlanCache, CACHE_TTL, cacheKey } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are an expert Nigerian educator and curriculum specialist fully aligned to the NERDC (Nigerian Educational Research and Development Council) curriculum framework.

Generate detailed, practical lesson plans that follow the EXACT NERDC lesson plan format used in Nigerian schools. Your plans must:

1. Address BOTH the main topic AND the specific sub-topic — every activity, note, and task must relate directly to the sub-topic within the broader topic
2. Use local Nigerian examples, names, places, and resources (Lagos, Kano, Abuja, Enugu, rivers, markets, local animals, local food, etc.)
3. Be appropriate for mixed-ability classrooms (High Ability / Middle Ability / Low Ability — HA/MA/LA)
4. Account for limited resources common in Nigerian schools (chalkboard, chalk, cardboard, textbooks)
5. Write Learning Objectives starting with "At the end of the lesson, pupils should be able to:"
6. Write Success Criteria in the first person: "I will be successful if I can..."
7. Structure activities: Starter → Main Activity 1 → Main Activity 2 → Main Activity 3 → Plenary
8. Differentiate for VAK learners: Visual, Auditory, Kinesthetic
9. Include cross-curricular LINKS (Literacy, Numeracy, Art, etc.)
10. Include KEY WORDS the pupils will learn
11. Include subject-matter NOTES that give the teacher thorough content on the specific sub-topic

CRITICAL — every plan MUST include a rich "lesson_notes" object with:
   • definition  — pupil-friendly definition of the sub-topic in 2–3 sentences
   • detailed_explanation  — exactly 4 substantive paragraphs that BREAK DOWN the sub-topic step-by-step, expand on it, address common misconceptions, and give scientific/historical/cultural depth
   • examples  — exactly 4 worked examples each with a short title and a 2–3 sentence Nigerian-context description
   • daily_life_application  — exactly 3 paragraphs explaining HOW the sub-topic applies to everyday Nigerian life (home, market, farm, community, work, safety, citizenship)

CRITICAL — every plan MUST include "class_work" as an array of EXACTLY 5 questions, each with:
   • question  — the question text (mix of: define, explain, give examples, apply, higher-order reasoning)
   • marks     — integer mark allocation (2, 3, 4, 5, 6 progressively)
   • model_answer  — the teacher's marking guide / sample answer

Always respond with valid JSON matching the exact schema provided. Do not omit lesson_notes or class_work fields.`

export async function POST(req: NextRequest) {
  const ctx = logRequest('/api/lesson-plan', req)

  // ── Rate limiting ────────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(ip, 'lesson-plan', LIMITS.lessonPlan.max, LIMITS.lessonPlan.windowMs)
  if (!rl.success) {
    logger.warn('Rate limit exceeded — lesson-plan', { ip, route: '/api/lesson-plan' })
    logResponse('/api/lesson-plan', ctx, 429)
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before generating another lesson plan.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const { subject, topic, subTopic, grade, duration, objectives } = await req.json()

  if (!subject || !topic || !grade) {
    logResponse('/api/lesson-plan', ctx, 400)
    return NextResponse.json(
      { error: 'subject, topic, and grade are required' },
      { status: 400 }
    )
  }

  // ── Cache check ──────────────────────────────────────────────────
  const key = cacheKey({ subject, topic, subTopic: subTopic ?? '', grade, duration: duration ?? '' })
  const cached = lessonPlanCache.get(key)
  if (cached) {
    logger.info('Cache HIT — lesson plan', { route: '/api/lesson-plan', key })
    logResponse('/api/lesson-plan', ctx, 200, { cached: true })
    return NextResponse.json({ plan: cached }, { headers: { 'X-Cache': 'HIT', ...rateLimitHeaders(rl) } })
  }

  const focus = subTopic?.trim() || topic

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    logger.warn('No OPENAI_API_KEY — using fallback lesson plan', { route: '/api/lesson-plan' })
    logResponse('/api/lesson-plan', ctx, 200, { fallback: true })
    return NextResponse.json(
      { plan: buildFallback(subject, topic, subTopic, grade, duration, objectives) },
      { headers: rateLimitHeaders(rl) }
    )
  }

  const userPrompt = `Create a full NERDC-aligned lesson plan for a Nigerian classroom:

Subject: ${subject}
Main Topic: ${topic}
Sub-Topic / Lesson Focus: ${focus}
Grade / Class: ${grade}
Duration: ${duration || '45 minutes'}
${objectives ? `Teacher's Additional Objectives: ${objectives}` : ''}

CRITICAL: The entire lesson must specifically teach "${focus}" as a sub-topic under the main topic "${topic}". All examples, notes, activities, and tasks must be focused on "${focus}".

Return ONLY valid JSON in this exact schema:
{
  "sub_topics": ["${focus}", "add 1-3 other closely related sub-topics covered in this lesson"],
  "learning_objectives": [
    "At the end of the lesson, pupils should be able to: [specific objective about ${focus}]",
    "At the end of the lesson, pupils should be able to: [second objective]",
    "At the end of the lesson, pupils should be able to: [third objective]"
  ],
  "success_criteria": [
    "I will be successful if I can [criterion directly about ${focus}]",
    "I will be successful if I can [second criterion]",
    "I will be successful if I can [third criterion]"
  ],
  "prior_learning": "What pupils already know that connects to ${focus} and ${topic}",
  "key_words": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],

  "lesson_notes": {
    "definition": "Clear, pupil-friendly definition of '${focus}' in 2-3 sentences. Use simple language suitable for ${grade}.",
    "detailed_explanation": [
      "First paragraph: Explain what ${focus} is, its core characteristics, and why it matters — using Nigerian context throughout.",
      "Second paragraph: Go deeper — explain HOW or WHY ${focus} works the way it does. Give the teacher enough content to answer any pupil question confidently.",
      "Third paragraph: Compare ${focus} to related concepts pupils may confuse it with. Address common misconceptions clearly.",
      "Fourth paragraph: Expand further — historical context, scientific basis, or real-world significance of ${focus} in Nigeria and globally."
    ],
    "examples": [
      { "title": "Example 1 — [brief label]", "description": "Full Nigerian-context example of ${focus}. Name specific places, people, or things." },
      { "title": "Example 2 — [brief label]", "description": "Second distinct example from a different Nigerian context." },
      { "title": "Example 3 — [brief label]", "description": "Third example relevant to pupils' everyday life in Nigeria." },
      { "title": "Example 4 — [brief label]", "description": "Fourth example, ideally from nature, market, or home environment." }
    ],
    "daily_life_application": [
      "Application 1: Explain one specific way ${focus} is seen or used in everyday Nigerian life — at home, in the market, on the farm, or in the community.",
      "Application 2: Explain a second way ${focus} is relevant to daily activities Nigerian pupils experience.",
      "Application 3: Explain how understanding ${focus} can help pupils make better decisions, stay safe, earn money, or improve their community."
    ]
  },

  "starter_activity": "Engaging 5-8 minute introduction activity to activate prior knowledge about ${focus}. Include specific instructions for the teacher.",
  "main_activities": [
    {
      "title": "Main Activity 1 — Teacher Introduction",
      "description": "Detailed 10-minute teacher-led explanation of ${focus} with Nigerian examples and chalkboard work. Include what to write on the board."
    },
    {
      "title": "Main Activity 2 — Guided Practice",
      "description": "Detailed 10-minute guided practice or group activity related to ${focus}. Include grouping instructions and specific tasks."
    },
    {
      "title": "Main Activity 3 — Independent/Creative Work",
      "description": "Detailed 10-minute independent or creative activity for pupils to demonstrate understanding of ${focus}."
    }
  ],
  "plenary": "5-minute wrap-up activity: how the teacher will check understanding of ${focus} and summarise key learning",
  "extension": "A challenge project or enrichment activity for fast finishers, linking ${focus} to real Nigerian life",

  "class_work": [
    {
      "question": "Question 1: Definition/knowledge question about ${focus} (e.g. 'What is...?' or 'Define...')",
      "marks": 2,
      "model_answer": "Model answer the teacher can use for marking"
    },
    {
      "question": "Question 2: Comprehension question requiring pupils to explain ${focus} in their own words",
      "marks": 3,
      "model_answer": "Model answer with key points to look for"
    },
    {
      "question": "Question 3: Example question — 'Give TWO examples of ${focus} from your daily life in Nigeria and explain each one'",
      "marks": 4,
      "model_answer": "Two acceptable examples with brief explanations"
    },
    {
      "question": "Question 4: Application question — pupils apply their knowledge of ${focus} to a real scenario",
      "marks": 5,
      "model_answer": "What a good answer should include"
    },
    {
      "question": "Question 5: Higher-order thinking — how does understanding ${focus} help you in everyday Nigerian life?",
      "marks": 6,
      "model_answer": "Points to look for in the answer"
    }
  ],

  "resources": ["Chalkboard and chalk", "Pupils' textbooks", "add 3-5 specific resources relevant to ${focus}"],
  "home_task": [
    "Specific homework task related to ${focus} that pupils can complete at home with no special resources"
  ],
  "note": "Thorough content notes for the teacher explaining ${focus} clearly with definitions, examples from Nigerian context, key facts, and common misconceptions to address. This should be substantial — 4-6 sentences minimum.",
  "links": {
    "Literacy": "How this lesson connects to reading, writing, or oral English",
    "Numeracy": "How this lesson connects to numbers or mathematics (if applicable)",
    "Art": "How this lesson connects to drawing, colouring, or creative arts (if applicable)"
  },
  "differentiation": {
    "visual": "Specific strategy for visual learners — charts, pictures, diagrams related to ${focus}",
    "auditory": "Specific strategy for auditory learners — songs, discussion, storytelling about ${focus}",
    "kinesthetic": "Specific strategy for kinesthetic learners — hands-on activity, role-play, or movement related to ${focus}"
  }
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
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const plan = JSON.parse(raw)

    // ── Store in cache for future identical requests ──────────────
    lessonPlanCache.set(key, plan, CACHE_TTL.lessonPlan)
    logger.info('Lesson plan generated + cached', { route: '/api/lesson-plan', key })
    logResponse('/api/lesson-plan', ctx, 200, { cached: false })

    return NextResponse.json(
      { plan },
      { headers: { 'X-Cache': 'MISS', ...rateLimitHeaders(rl) } }
    )
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Lesson plan generation failed', {
      route: '/api/lesson-plan',
      error: { message: error.message, name: error.name, stack: error.stack },
    })
    logResponse('/api/lesson-plan', ctx, 500, {
      error: { message: error.message },
    })
    return NextResponse.json(
      { plan: buildFallback(subject, topic, subTopic, grade, duration, objectives) },
      { headers: rateLimitHeaders(rl) }
    )
  }
}

// ─── Rich static fallback ─────────────────────────────────────────────────────
function buildFallback(
  subject: string,
  topic: string,
  subTopic: string | undefined,
  grade: string,
  duration = '45 minutes',
  objectives?: string
) {
  const focus = subTopic?.trim() || topic
  const isEarly = ['nursery','primary 1','primary 2','primary 3'].some(l => grade.toLowerCase().includes(l))

  return {
    sub_topics: [focus, `Introduction to ${topic}`, `Examples of ${focus} in everyday Nigerian life`],
    learning_objectives: [
      `At the end of the lesson, pupils should be able to: define and explain "${focus}" in their own words`,
      `At the end of the lesson, pupils should be able to: identify at least three key features or examples of "${focus}"`,
      objectives
        ? `At the end of the lesson, pupils should be able to: ${objectives}`
        : `At the end of the lesson, pupils should be able to: apply knowledge of "${focus}" through a class activity`,
    ],
    success_criteria: [
      `I will be successful if I can explain what "${focus}" means`,
      `I will be successful if I can give at least two examples of "${focus}" from my daily life in Nigeria`,
      `I will be successful if I can answer questions about "${focus}" in class`,
    ],
    prior_learning: `Pupils in ${grade} have prior knowledge of ${topic} from everyday experiences and previous lessons. They can relate "${focus}" to things they see around them in Nigeria.`,
    key_words: [focus, topic, subject, 'definition', 'example'],

    lesson_notes: {
      definition: `"${focus}" is a key concept within the topic of "${topic}" in the ${subject} curriculum. It refers to the specific characteristics, features, or processes that define "${focus}" and distinguish it from related ideas. Understanding "${focus}" helps pupils make sense of the world around them in everyday Nigerian life.`,
      detailed_explanation: [
        `"${focus}" is one of the important sub-topics under "${topic}" in ${subject}. At its core, "${focus}" describes a concept or phenomenon that pupils can observe in their environment — from the homes and streets of Lagos, to the farms of Benue State, and the markets of Kano. Teachers should begin by connecting the topic to something pupils already know before introducing new terminology.`,
        `To understand "${focus}" fully, it is important to know how it works and why it behaves the way it does. Every aspect of "${focus}" has underlying principles that explain its behaviour. These principles can be demonstrated using simple materials available in a Nigerian classroom — a chalkboard diagram, everyday objects, or a local story. The teacher should use clear, step-by-step explanations and pause to ask comprehension questions at each stage.`,
        `A common misconception about "${focus}" is that pupils may confuse it with other related concepts under "${topic}". Teachers should clearly highlight the differences using side-by-side comparisons on the chalkboard. For example, if pupils mix up "${focus}" with a similar term, the teacher should ask: "What is the same? What is different?" and write responses on the board so all pupils can see the distinction clearly.`,
        `"${focus}" has broad significance in both the Nigerian context and in global knowledge. Understanding it empowers pupils to ask better questions, solve everyday problems, and participate more confidently in their communities. In Nigerian schools, mastering "${focus}" prepares pupils for higher-level examinations such as WAEC, NECO, and JAMB, and also supports practical skills needed in Nigerian daily life, agriculture, trade, and public health.`,
      ],
      examples: [
        { title: `Example 1 — In the Home`, description: `In a typical Nigerian household, "${focus}" can be observed when families prepare food, manage water supply, or maintain their compound. For instance, in many homes in Lagos and Abuja, the daily routine reflects principles of "${focus}" in practical ways that pupils can recognise immediately.` },
        { title: `Example 2 — In the Market`, description: `At a local Nigerian market — such as Onitsha Main Market or Balogun Market in Lagos — traders regularly demonstrate "${focus}" in the way they organise goods, price items, or interact with customers. This provides a vivid, real-world illustration pupils can connect to their own experience.` },
        { title: `Example 3 — In Nature and the Environment`, description: `In Nigeria's diverse natural environments — from the Niger Delta, to the Jos Plateau, to the Sahel in the north — "${focus}" can be clearly observed. Teachers can describe examples from the pupils' local region to make the lesson more relevant and memorable.` },
        { title: `Example 4 — In School and Community Life`, description: `Right inside the school compound or nearby community, pupils can find examples of "${focus}". During break time, community events, or even the walk to school, aspects of "${focus}" are at work. Encouraging pupils to spot these examples builds observation skills and deepens understanding.` },
      ],
      daily_life_application: [
        `Health and Safety: Understanding "${focus}" helps Nigerians make better decisions about their health, safety, and wellbeing. For example, knowledge of "${focus}" can help families prevent illness, maintain clean water, or identify hazards in the home or farm environment.`,
        `Work and Trade: In Nigeria's growing economy, "${focus}" is relevant to farming, trading, manufacturing, and digital skills. Pupils who understand "${focus}" are better equipped to earn a living, run a small business, or contribute to their family's income as they grow older.`,
        `Community and Citizenship: Awareness of "${focus}" enables Nigerians to participate more effectively in their communities — whether through environmental protection, civic responsibility, or applying scientific or social knowledge to solve local problems. This is especially relevant as Nigeria continues to develop and urbanise.`,
      ],
    },

    starter_activity: `(5–8 minutes) Write "${focus}" on the chalkboard and ask: "Who can tell me what this means?" Record responses. Use a brainstorming activity — invite 3–4 pupils to share what they know. Display a wall chart or drawing if available. State the lesson objectives and explain why "${focus}" matters in everyday Nigerian life.`,
    main_activities: [
      {
        title: 'Main Activity 1 — Teacher Explanation',
        description: `(10 minutes) Explain "${focus}" clearly using the chalkboard. Write the definition and ask pupils to copy it. Use local Nigerian examples. Ask comprehension questions throughout. Use a chart or diagram to illustrate key points.`,
      },
      {
        title: 'Main Activity 2 — Guided Practice',
        description: `(10 minutes) Groups of 4–5 pupils discuss: "Give three examples of ${focus} found in Nigeria." One pupil per group shares answers. Teacher writes key examples on the board. HA: explain WHY. MA: complete as described. LA: teacher provides prompts.`,
      },
      {
        title: 'Main Activity 3 — Independent Work',
        description: `(10 minutes) Each pupil completes an individual task: ${isEarly ? `Draw and label a picture showing "${focus}"` : `Write two examples of "${focus}" and one sentence each explaining how they relate to "${topic}"`}. Teacher moves around to observe. Collect books for review.`,
      },
    ],
    plenary: `(5 minutes) Ask: "What did we learn about ${focus} today?" Invite 3–4 pupils to share. Write a 2-line summary on the board. Pupils read it aloud. Quick exit check: show a word card — thumbs up/down for understanding.`,
    extension: `Pupils collect or draw examples of "${focus}" from their home environment. HA pupils write a short paragraph explaining "${focus}" to a younger sibling in simple language.`,

    class_work: [
      {
        question: `1. What is "${focus}"? Write the definition in your own words. (2 marks)`,
        marks: 2,
        model_answer: `Any clear, accurate definition of "${focus}" that captures its key meaning. Award 1 mark for a partial definition and 2 marks for a complete one.`,
      },
      {
        question: `2. Explain "${focus}" as if you were describing it to a friend who has never heard of it before. (3 marks)`,
        marks: 3,
        model_answer: `Look for: accurate description (1 mark), at least one example (1 mark), and clarity of explanation (1 mark).`,
      },
      {
        question: `3. Give TWO examples of "${focus}" from your daily life in Nigeria and explain each one. (4 marks)`,
        marks: 4,
        model_answer: `2 marks per example: 1 mark for naming a valid example + 1 mark for a brief explanation. Any reasonable Nigerian-context examples should be credited.`,
      },
      {
        question: `4. Describe ONE way that "${focus}" is important in everyday life in Nigeria. Give a specific example. (5 marks)`,
        marks: 5,
        model_answer: `Look for: identification of a relevant application (2 marks), specific Nigerian example (2 marks), and clear explanation of importance (1 mark).`,
      },
      {
        question: `5. How does understanding "${focus}" help you or your community? Write at least four sentences. (6 marks)`,
        marks: 6,
        model_answer: `Award marks for: relevance to "${focus}" (2), quality of reasoning (2), use of examples or evidence (1), and clarity of expression (1).`,
      },
    ],

    resources: [
      'Chalkboard and chalk',
      "Pupils' exercise books and textbooks",
      `Wall chart or poster showing "${focus}"`,
      'Cardboard / chart paper for group activity',
      'Markers, crayons, or coloured pencils',
    ],
    home_task: [
      `Find and write down two examples of "${focus}" from your home environment and explain each one in two sentences.`,
      isEarly
        ? `Ask a family member what they know about "${focus}" and draw a picture of what they tell you.`
        : `Write a short paragraph (6–8 sentences) explaining "${focus}" to a family member who has never studied ${subject}.`,
    ],
    note: `TEACHER'S CONTENT NOTES — "${focus}" (${subject}, ${grade})\n\n"${focus}" is a key concept within "${topic}" in the ${subject} curriculum. Teachers should ensure they are confident explaining this concept with clear, simple language suited to ${grade} pupils. Use concrete, real-world examples from everyday Nigerian life — markets, homes, farms, rivers, and local community — to make the concept meaningful. Address misconceptions early by clearly distinguishing "${focus}" from related concepts using chalkboard comparisons. Encourage pupils to use key words in their own sentences throughout the lesson.`,
    links: {
      Literacy: `Pupils learn and use new vocabulary related to "${focus}". They practise reading definitions and writing sentences.`,
      Numeracy: `Pupils count and categorise examples of "${focus}" during the group activity.`,
      Art: `Pupils draw and colour diagrams or pictures illustrating "${focus}" during independent work.`,
    },
    differentiation: {
      visual: `Display a wall chart, diagram, or flashcards showing "${focus}". Write all key words on the chalkboard.`,
      auditory: `Teacher explains "${focus}" orally with clear language. Pupils repeat key words aloud. Use a related song or rhyme if available.`,
      kinesthetic: `Pupils sort picture cards or objects during the group activity. They draw and label their own examples.`,
    },
  }
}
