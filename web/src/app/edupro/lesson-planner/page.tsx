'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Wand2, Loader2, Download, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const GRADE_LEVELS = ['Primary 1–3','Primary 4–6','JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3','TVET Level 1','TVET Level 2']
const DURATIONS    = ['35 minutes','40 minutes','45 minutes','60 minutes','90 minutes','2 hours']
const SUBJECTS     = ['Mathematics','English Language','Basic Science','Agricultural Science','Technical Drawing','Computer Studies','Digital Skills','Business Studies','Vocational Technology','Home Economics','Physical Education']

interface LessonPlan {
  overview: string
  learning_objectives: string[]
  materials_needed: string[]
  introduction: { duration: string; activity: string }
  main_activity: { duration: string; steps: string[] }
  assessment: { type: string; description: string }
  closure: { duration: string; activity: string }
  differentiation: { support: string; extension: string }
  homework?: string
}

export default function LessonPlannerPage() {
  const [subject, setSubject]       = useState('')
  const [topic, setTopic]           = useState('')
  const [grade, setGrade]           = useState('')
  const [duration, setDuration]     = useState('45 minutes')
  const [objectives, setObjectives] = useState('')
  const [loading, setLoading]       = useState(false)
  const [plan, setPlan]             = useState<LessonPlan | null>(null)

  async function generatePlan() {
    if (!subject || !topic || !grade) { toast.error('Please fill in subject, topic, and grade level'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, grade, duration, objectives }),
      })
      if (!res.ok) throw new Error('Failed to generate plan')
      const data = await res.json()
      setPlan(data.plan)
      toast.success('Lesson plan generated!')
    } catch {
      toast.error('Could not generate plan. Please try again.')
    }
    setLoading(false)
  }

  function printPlan() { window.print() }

  return (
    <>
      <Navbar />
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {/* 30% blue icon container */}
              <div className="w-10 h-10 bg-brand-blueLight rounded-xl flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-brand-blue" />
              </div>
              <h1 className="text-2xl font-bold text-brand-ink">AI Lesson Planner</h1>
            </div>
            <p className="text-brand-inkMid text-sm">
              Aligned to the Nigerian NERDC curriculum. Generate a full lesson plan in seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card p-6 space-y-4 sticky top-20">
                <div>
                  <label className="label">Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} className="input">
                    <option value="">Select subject…</option>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Topic / Lesson Title</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                    className="input" placeholder="e.g. Photosynthesis, Fractions, Ohm's Law" />
                </div>
                <div>
                  <label className="label">Grade / Class Level</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="input">
                    <option value="">Select grade…</option>
                    {GRADE_LEVELS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Lesson Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)} className="input">
                    {DURATIONS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Key Objectives (optional)</label>
                  <textarea value={objectives} onChange={e => setObjectives(e.target.value)}
                    className="input h-20 resize-none" placeholder="What should students know/do by end of lesson?" />
                </div>
                {/* 10% amber CTA button */}
                <button onClick={generatePlan} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    : <><Wand2 className="w-4 h-4" /> Generate Lesson Plan</>}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="lg:col-span-3" id="lesson-plan-output">
              {!plan && !loading && (
                <div className="card p-12 text-center text-brand-inkLight">
                  <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-brand-inkMid">Your AI-generated lesson plan will appear here</p>
                  <p className="text-sm mt-1">Fill in the form and click Generate</p>
                </div>
              )}

              {loading && (
                <div className="card p-12 text-center">
                  {/* 30% blue spinner */}
                  <Loader2 className="w-12 h-12 text-brand-blue mx-auto mb-4 animate-spin" />
                  <p className="font-medium text-brand-ink">Generating your lesson plan…</p>
                  <p className="text-sm text-brand-inkLight mt-1">Aligned to NERDC curriculum · Usually takes 5–10 seconds</p>
                </div>
              )}

              {plan && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg text-brand-ink">{topic} — {grade}</h2>
                    <div className="flex gap-2">
                      <button onClick={() => setPlan(null)} className="btn-outline text-sm py-2 px-3 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> New
                      </button>
                      {/* 10% amber CTA */}
                      <button onClick={printPlan} className="btn-primary text-sm py-2 px-3 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Print / Save PDF
                      </button>
                    </div>
                  </div>

                  {/* Overview */}
                  <div className="card p-5">
                    <h3 className="font-semibold text-brand-ink mb-2">Overview</h3>
                    <p className="text-sm text-brand-inkMid leading-relaxed">{plan.overview}</p>
                  </div>

                  {/* Objectives — blue numbered circles */}
                  <div className="card p-5">
                    <h3 className="font-semibold text-brand-ink mb-2">Learning Objectives</h3>
                    <ul className="space-y-1">
                      {plan.learning_objectives.map((obj, i) => (
                        <li key={i} className="text-sm text-brand-inkMid flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Materials */}
                  <div className="card p-5">
                    <h3 className="font-semibold text-brand-ink mb-2">Materials Needed</h3>
                    <div className="flex flex-wrap gap-2">
                      {plan.materials_needed.map(m => (
                        <span key={m} className="badge badge-blue">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Lesson flow — amber duration badges */}
                  {[
                    { label: '🚀 Introduction', data: plan.introduction },
                    { label: '📚 Main Activity', data: { duration: plan.main_activity.duration, activity: plan.main_activity.steps.join('\n') } },
                    { label: '✅ Assessment',    data: { duration: '', activity: `${plan.assessment.type}: ${plan.assessment.description}` } },
                    { label: '🔚 Closure',       data: plan.closure },
                  ].map(({ label, data }) => (
                    <div key={label} className="card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-brand-ink">{label}</h3>
                        {/* 10% amber badge */}
                        {data.duration && <span className="badge badge-amber">{data.duration}</span>}
                      </div>
                      <p className="text-sm text-brand-inkMid leading-relaxed whitespace-pre-line">{data.activity}</p>
                    </div>
                  ))}

                  {/* Differentiation */}
                  <div className="card p-5 grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-brand-ink mb-1 text-sm">🤝 Support (Struggling Learners)</h4>
                      <p className="text-sm text-brand-inkMid">{plan.differentiation.support}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-ink mb-1 text-sm">🚀 Extension (Advanced Learners)</h4>
                      <p className="text-sm text-brand-inkMid">{plan.differentiation.extension}</p>
                    </div>
                  </div>

                  {plan.homework && (
                    <div className="card p-5 bg-amber-50 border-brand-amber/20">
                      <h3 className="font-semibold text-brand-ink mb-1">📝 Homework</h3>
                      <p className="text-sm text-brand-inkMid">{plan.homework}</p>
                    </div>
                  )}

                  {/* 10% amber save button */}
                  <button className="btn-primary w-full flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Save to My Lesson Plans
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
