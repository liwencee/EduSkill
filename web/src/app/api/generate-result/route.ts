import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface SubjectResult {
  subjectName: string
  score: number
  maxScore: number
  percentage: number
  grade: string
  remark: string
}

interface StudentInput {
  name: string
  position: number
  percentage: number
  overallGrade: string
  passed: boolean
  subjectResults: SubjectResult[]
}

interface ClassInfo {
  schoolName: string
  className: string
  term: string
  session: string
  passmark: number
}

const SYSTEM_PROMPT = `You are an experienced Nigerian school counsellor and academic advisor who analyses student results and gives constructive, encouraging feedback tailored to each pupil's performance.

Your recommendations must:
1. Be honest but encouraging — even for failing students, highlight effort and potential
2. Identify the student's strongest and weakest subjects from their scores
3. Suggest specific, actionable steps for improvement in weak subjects
4. Recommend realistic career paths based on the student's strongest subjects
5. Use Nigeria-relevant career suggestions (e.g. Engineering, Medicine, Law, Education, Agriculture, ICT, Business, Nursing, Accounting, Architecture, etc.)
6. Keep recommendations concise and age-appropriate (secondary school level)
7. Always return valid JSON — no markdown, no extra text

Return ONLY a JSON object in this exact structure:
{
  "recommendations": [
    {
      "name": "student full name exactly as given",
      "recommendation": "2-3 sentence performance summary and encouragement",
      "strengths": ["specific strength or improvement tip 1", "specific strength or improvement tip 2", "specific strength or improvement tip 3"],
      "careerSuggestions": ["Career 1", "Career 2", "Career 3", "Career 4"]
    }
  ]
}`

function buildFallbackRecommendations(students: StudentInput[]) {
  return {
    recommendations: students.map(st => {
      const best    = [...st.subjectResults].sort((a, b) => b.percentage - a.percentage).slice(0, 2)
      const weakest = [...st.subjectResults].sort((a, b) => a.percentage - b.percentage).slice(0, 2)

      const careerMap: Record<string, string[]> = {
        'Mathematics':        ['Engineering', 'Accounting', 'Data Science', 'Architecture'],
        'English Language':   ['Law', 'Journalism', 'Teaching', 'Public Relations'],
        'Basic Science':      ['Medicine', 'Nursing', 'Pharmacy', 'Agriculture'],
        'Physics':            ['Engineering', 'Piloting', 'ICT', 'Architecture'],
        'Chemistry':          ['Medicine', 'Pharmacy', 'Chemical Engineering', 'Food Technology'],
        'Biology':            ['Medicine', 'Nursing', 'Agriculture', 'Microbiology'],
        'Economics':          ['Business', 'Accounting', 'Banking & Finance', 'Entrepreneurship'],
        'Government':         ['Law', 'Public Administration', 'Diplomacy', 'Journalism'],
        'Literature':         ['Law', 'Journalism', 'Theatre Arts', 'Creative Writing'],
        'Agricultural Science':['Agriculture', 'Agribusiness', 'Food Science', 'Environmental Science'],
        'Computer Science':   ['Software Engineering', 'Cybersecurity', 'Data Science', 'ICT'],
        'Fine Art':           ['Architecture', 'Graphic Design', 'Fashion Design', 'Animation'],
      }

      const careers = best.flatMap(b => careerMap[b.subjectName] || ['Teaching', 'Business', 'Civil Service', 'Entrepreneurship'])
      const uniqueCareers = [...new Set(careers)].slice(0, 4)

      const rec = st.passed
        ? `${st.name} performed ${st.percentage >= 65 ? 'commendably' : 'adequately'} this term with ${st.percentage}% overall. ${best[0] ? `${st.name} shows clear aptitude in ${best[0].subjectName}.` : ''} Keep up the consistent effort!`
        : `${st.name} has room to grow this term. With focused revision especially in ${weakest[0]?.subjectName || 'key subjects'}, significant improvement is achievable next term. Do not give up!`

      return {
        name: st.name,
        recommendation: rec,
        strengths: [
          best[0]    ? `Strong performance in ${best[0].subjectName} (${best[0].percentage}%) — keep building on this`       : 'Work on consistent study habits across all subjects',
          weakest[0] ? `Focus extra revision time on ${weakest[0].subjectName} (${weakest[0].percentage}%) to boost overall score` : 'Maintain balanced performance across all subjects',
          st.percentage >= 65
            ? 'Excellent consistency — aim for the top 3 positions next term'
            : 'Attend extra lessons or seek teacher help for challenging subjects',
        ],
        careerSuggestions: uniqueCareers.length > 0 ? uniqueCareers : ['Teaching', 'Business', 'Entrepreneurship', 'Civil Service'],
      }
    }),
  }
}

export async function POST(req: NextRequest) {
  const body: { classInfo: ClassInfo; students: StudentInput[] } = await req.json()
  const { classInfo, students } = body

  if (!students || students.length === 0) {
    return NextResponse.json({ error: 'No student data provided' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // Return rule-based fallback when no AI key configured
    return NextResponse.json(buildFallbackRecommendations(students))
  }

  const userPrompt = `Analyse the following ${classInfo.term} term results for ${classInfo.className} (${classInfo.session}) and provide recommendations for each student.

Class: ${classInfo.className}
Term: ${classInfo.term} Term
Session: ${classInfo.session}
Pass Mark: ${classInfo.passmark}%

STUDENT RESULTS:
${students.map((st, i) => `
${i + 1}. ${st.name}
   Position: ${st.position}
   Overall: ${st.percentage}% — Grade ${st.overallGrade} — ${st.passed ? 'PASS' : 'FAIL'}
   Subject Scores:
${st.subjectResults.map(sr => `     • ${sr.subjectName}: ${sr.score}/${sr.maxScore} (${sr.percentage}%) — ${sr.grade} (${sr.remark})`).join('\n')}
`).join('')}

Generate personalised recommendations for ALL ${students.length} students. Return ONLY valid JSON matching the exact schema.`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'gpt-4o-mini',
        temperature: 0.7,
        max_tokens:  2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userPrompt },
        ],
      }),
    })

    if (!res.ok) {
      return NextResponse.json(buildFallbackRecommendations(students))
    }

    const data = await res.json()
    const raw  = data.choices?.[0]?.message?.content?.trim() || ''

    // Strip markdown fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed  = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch {
    // Fall back gracefully — results still displayed, just no AI recommendations
    return NextResponse.json(buildFallbackRecommendations(students))
  }
}
