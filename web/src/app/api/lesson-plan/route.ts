import { NextRequest, NextResponse } from 'next/server'

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

Always respond with valid JSON matching the exact schema provided.`

export async function POST(req: NextRequest) {
  const { subject, topic, subTopic, grade, duration, objectives } = await req.json()

  if (!subject || !topic || !grade) {
    return NextResponse.json(
      { error: 'subject, topic, and grade are required' },
      { status: 400 }
    )
  }

  const focus = subTopic?.trim() || topic

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      plan: buildFallback(subject, topic, subTopic, grade, duration, objectives),
    })
  }

  const userPrompt = `Create a full NERDC-aligned lesson plan for a Nigerian classroom:

Subject: ${subject}
Main Topic: ${topic}
Sub-Topic / Lesson Focus: ${focus}
Grade / Class: ${grade}
Duration: ${duration || '45 minutes'}
${objectives ? `Teacher's Additional Objectives: ${objectives}` : ''}

CRITICAL: The entire lesson must specifically teach "${focus}" as a sub-topic under the main topic "${topic}". All examples, notes, activities, and tasks must be focused on "${focus}" — not just the general topic.

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
  "extension": "A challenge project or enrichment activity for fast finishers, linking ${focus} to real Nigerian life",
  "note": "Thorough content notes for the teacher explaining ${focus} clearly with definitions, examples from Nigerian context, key facts, and common misconceptions to address. This should be substantial — 4-6 sentences minimum.",
  "plenary": "5-minute wrap-up activity: how the teacher will check understanding of ${focus} and summarise key learning",
  "resources": ["Chalkboard and chalk", "Pupils' textbooks", "add 3-5 specific resources relevant to ${focus}"],
  "class_task": [
    "Specific in-class task 1 pupils will complete about ${focus}",
    "Specific in-class task 2"
  ],
  "home_task": [
    "Specific homework task related to ${focus} that pupils can complete at home with no special resources"
  ],
  "links": {
    "Literacy": "How this lesson connects to reading, writing, or oral English",
    "Numeracy": "How this lesson connects to numbers or mathematics (if applicable, otherwise omit this key)",
    "Art": "How this lesson connects to drawing, colouring, or creative arts (if applicable)"
  },
  "key_words": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "differentiation": {
    "visual": "Specific strategy for visual learners — charts, pictures, diagrams, videos related to ${focus}",
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
      max_tokens: 2800,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const plan = JSON.parse(raw)
    return NextResponse.json({ plan })
  } catch (err) {
    console.error('Lesson plan generation error:', err)
    return NextResponse.json({
      plan: buildFallback(subject, topic, subTopic, grade, duration, objectives),
    })
  }
}

// ─── Rich static fallback (used when no API key or on error) ─────────────────
function buildFallback(
  subject: string,
  topic: string,
  subTopic: string | undefined,
  grade: string,
  duration = '45 minutes',
  objectives?: string
) {
  const focus = subTopic?.trim() || topic
  const isEarly = grade.toLowerCase().includes('nursery') || grade.toLowerCase().includes('primary 1') || grade.toLowerCase().includes('primary 2') || grade.toLowerCase().includes('primary 3')
  const gradeLabel = grade

  return {
    sub_topics: [
      focus,
      `Introduction to ${topic}`,
      `Examples of ${focus} in everyday Nigerian life`,
    ],
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
    prior_learning: `Pupils in ${gradeLabel} have prior knowledge of ${topic} from everyday experiences and previous lessons. They are familiar with the school environment and can relate the concept of "${focus}" to things they see around them in Nigeria.`,
    starter_activity: `(5–8 minutes) Teacher writes the word "${focus}" on the chalkboard and asks pupils: "Who can tell me what this means?" Record responses on the board. Use a short brainstorming activity — invite 3–4 pupils to share what they know. Display a wall chart or drawing related to "${focus}" if available. State the lesson objectives clearly and explain why learning about "${focus}" is important in everyday Nigerian life.`,
    main_activities: [
      {
        title: 'Main Activity 1 — Teacher Explanation',
        description: `(10 minutes) Teacher explains "${focus}" clearly using the chalkboard. Write a simple definition of "${focus}" on the board and ask pupils to copy it into their exercise books. Use local Nigerian examples — for instance, reference things pupils see in their homes, streets, markets, or the school compound. Ask comprehension questions throughout: "Can anyone give me an example?" "Where have you seen this before?" Use a chart or diagram if available to illustrate key points about "${focus}".`,
      },
      {
        title: 'Main Activity 2 — Guided Practice',
        description: `(10 minutes) Divide the class into groups of 4–5 pupils. Each group discusses: "Give three examples of ${focus} that you can find in Nigeria." One pupil from each group shares their answers with the class. Teacher writes key examples on the board and corrects any misconceptions. HA pupils: ask them to explain WHY each example fits. MA pupils: complete the task as described. LA pupils: teacher or HA peer provides prompts and support.`,
      },
      {
        title: 'Main Activity 3 — Independent Work',
        description: `(10 minutes) Each pupil completes a short individual task in their exercise book: Draw and label ${isEarly ? 'a picture showing' : 'two examples of'} "${focus}". ${isEarly ? 'Colour the picture and write the name underneath.' : 'Write one sentence about each example explaining how it relates to the topic.'} Teacher moves around the class to observe and assist. Collect books for review or mark together as a class at the end.`,
      },
    ],
    extension: `Extension / Project: Pupils collect or draw examples of "${focus}" from their home environment. They bring their work to show the class in the next lesson. HA pupils may write a short paragraph (5–8 sentences) explaining "${focus}" to a younger sibling in simple terms.`,
    note: `TEACHER'S CONTENT NOTES — "${focus}" (${subject}, ${gradeLabel})\n\n"${focus}" is a key concept within the topic of "${topic}" in the ${subject} curriculum. Teachers should ensure they are confident in explaining this concept with clear, simple language suited to ${gradeLabel} pupils. When explaining "${focus}", always start from what pupils already know and build towards new knowledge. Use concrete, real-world examples from everyday Nigerian life — markets, homes, farms, rivers, and local community — to make the concept meaningful. Avoid abstract explanations without a local connection. Common misconceptions should be addressed early: pupils may confuse "${focus}" with related concepts, so the teacher should clearly distinguish them using examples on the chalkboard. Encourage pupils to use the key words in their own sentences throughout the lesson.`,
    plenary: `(5 minutes) Ask pupils: "What did we learn today about ${focus}?" Invite 3–4 pupils to share one thing they learned. Write a 2-line summary on the board. Pupils read it aloud together. Teacher acknowledges good participation and previews the next lesson. Quick exit check: show a picture or word card related to "${focus}" — pupils give a thumbs up/thumbs down to show understanding.`,
    resources: [
      'Chalkboard and chalk',
      'Pupils\' exercise books and textbooks',
      `Wall chart or poster showing "${focus}"`,
      'Cardboard / chart paper for group activity',
      'Markers, crayons, or coloured pencils',
    ],
    class_task: [
      `Pupils write the definition of "${focus}" in their exercise books and give two examples from everyday Nigerian life`,
      isEarly
        ? `Pupils draw and colour a picture related to "${focus}" and label it`
        : `Pupils write 3–5 sentences describing "${focus}" and how it relates to "${topic}"`,
    ],
    home_task: [
      `Pupils find and write down two examples of "${focus}" from their home environment and share with the class next lesson`,
      isEarly
        ? `Pupils colour the worksheet on "${focus}" provided by the teacher`
        : `Pupils write a short paragraph (5–8 sentences) explaining "${focus}" to a family member`,
    ],
    links: {
      Literacy: `Pupils learn and use new vocabulary related to "${focus}". They practise reading definitions and writing sentences about the topic.`,
      Numeracy: `Pupils count and categorise examples of "${focus}" during the group activity.`,
      Art: `Pupils draw and colour diagrams or pictures illustrating "${focus}" during independent work.`,
    },
    key_words: [
      focus,
      topic,
      subject,
      'definition',
      'example',
    ],
    differentiation: {
      visual: `Display a wall chart, diagram, or flashcards showing "${focus}". Write all key words on the chalkboard. Use pictures and drawings to illustrate concepts throughout the lesson.`,
      auditory: `Teacher explains "${focus}" orally using clear, simple language. Pupils repeat key words aloud. Use a related song, rhyme, or story that features "${focus}" if available.`,
      kinesthetic: `Pupils sort picture cards or objects related to "${focus}" during the group activity. They draw and label their own examples. Role-play or physical demonstration used where applicable.`,
    },
  }
}
