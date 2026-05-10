'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Wand2, Loader2, Download, RefreshCw, BookOpen, Target, Star, Lightbulb, Users, Home, Link2, Tag, Eye, FileText, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

// ── NERDC-aligned subject list ────────────────────────────────────────────────
const SUBJECTS = [
  // Early years / Nursery
  'Understanding the World',
  'Literacy (Early Years)',
  'Numeracy (Early Years)',
  'Religious Education',
  // Primary core
  'English Language',
  'Mathematics',
  'Basic Science & Technology',
  'Social Studies',
  'Agricultural Science',
  'Cultural & Creative Arts',
  'Physical & Health Education',
  'Computer Studies',
  'Home Economics',
  'Civic Education',
  // Primary / JSS languages
  'Yoruba Language',
  'Igbo Language',
  'Hausa Language',
  'French',
  // JSS/SSS science & tech
  'Biology',
  'Chemistry',
  'Physics',
  'Further Mathematics',
  'Basic Technology',
  'Technical Drawing',
  // JSS/SSS humanities & social
  'Geography',
  'History',
  'Government',
  'Economics',
  'Commerce',
  'Financial Accounting',
  'Business Studies',
  // Vocational
  'Vocational Technology',
  'Digital Skills',
  // Islamic studies
  'Islamic Religious Studies',
  'Christian Religious Studies',
]

const GRADE_LEVELS = [
  'Nursery 1',
  'Nursery 2 (Upper Nursery)',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SSS 1',
  'SSS 2',
  'SSS 3',
  'TVET Level 1',
  'TVET Level 2',
]

const DURATIONS = ['35 minutes', '40 minutes', '45 minutes', '60 minutes', '70 minutes', '80 minutes', '90 minutes', '2 hours']

// ── TypeScript types for NERDC plan ──────────────────────────────────────────
interface MainActivity {
  title: string
  description: string
}

interface LessonPlan {
  sub_topics: string[]
  learning_objectives: string[]
  success_criteria: string[]
  prior_learning: string
  starter_activity: string
  main_activities: MainActivity[]
  extension: string
  note: string
  plenary: string
  resources: string[]
  class_task: string[]
  home_task: string[]
  links: Record<string, string>
  key_words: string[]
  differentiation: {
    visual: string
    auditory: string
    kinesthetic: string
  }
}

// ── Section card helper ───────────────────────────────────────────────────────
function Section({ icon, title, badge, children }: {
  icon: React.ReactNode
  title: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-brand-blue">{icon}</span>
          <h3 className="font-semibold text-brand-ink text-sm">{title}</h3>
        </div>
        {badge && <span className="badge badge-amber">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LessonPlannerPage() {
  const [subject, setSubject]     = useState('')
  const [topic, setTopic]         = useState('')
  const [subTopic, setSubTopic]   = useState('')
  const [grade, setGrade]         = useState('')
  const [duration, setDuration]   = useState('45 minutes')
  const [objectives, setObjectives] = useState('')
  const [loading, setLoading]       = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [plan, setPlan]             = useState<LessonPlan | null>(null)
  const [planMeta, setPlanMeta]     = useState({ subject: '', topic: '', subTopic: '', grade: '' })

  async function generatePlan() {
    if (!subject || !topic || !grade) {
      toast.error('Please fill in Subject, Topic, and Grade Level')
      return
    }
    setLoading(true)
    setPlan(null)
    try {
      const res = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, subTopic, grade, duration, objectives }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (!data.plan) throw new Error('No plan returned')
      setPlan(data.plan)
      setPlanMeta({ subject, topic, subTopic, grade })
      toast.success('Lesson plan generated!')
    } catch (err) {
      console.error(err)
      toast.error('Could not generate plan. Please try again.')
    }
    setLoading(false)
  }

  async function downloadDocx() {
    if (!plan) return
    setDownloading(true)
    try {
      const res = await fetch('/api/lesson-plan/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          subject: planMeta.subject,
          topic: planMeta.topic,
          subTopic: planMeta.subTopic,
          grade: planMeta.grade,
          duration,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `NERDC-Lesson-Plan-${(planMeta.subTopic || planMeta.topic).replace(/\s+/g, '-')}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Word document downloaded!')
    } catch {
      toast.error('Could not generate Word document. Please try again.')
    }
    setDownloading(false)
  }

  return (
    <>
      <Navbar />
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-blueLight rounded-xl flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-brand-blue" />
              </div>
              <h1 className="text-2xl font-bold text-brand-ink">AI Lesson Planner</h1>
            </div>
            <p className="text-brand-inkMid text-sm">
              Aligned to the Nigerian NERDC curriculum. Generate a full structured lesson plan in seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">

            {/* ── Form ── */}
            <div className="lg:col-span-2">
              <div className="card p-6 space-y-4 sticky top-20">

                <div>
                  <label className="label">Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} className="input">
                    <option value="">Select subject…</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Main Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="input"
                    placeholder="e.g. Shelter, Figures of Speech, Fractions"
                  />
                </div>

                <div>
                  <label className="label">
                    Sub-Topic / Lesson Focus
                    <span className="ml-1 text-brand-inkLight font-normal">(recommended)</span>
                  </label>
                  <input
                    type="text"
                    value={subTopic}
                    onChange={e => setSubTopic(e.target.value)}
                    className="input"
                    placeholder="e.g. Types of Shelter, Simile & Metaphor, Adding Fractions"
                  />
                  <p className="text-xs text-brand-inkLight mt-1">
                    The AI will focus the entire lesson on this sub-topic
                  </p>
                </div>

                <div>
                  <label className="label">Grade / Class Level</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="input">
                    <option value="">Select grade…</option>
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Lesson Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)} className="input">
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Additional Objectives <span className="font-normal text-brand-inkLight">(optional)</span></label>
                  <textarea
                    value={objectives}
                    onChange={e => setObjectives(e.target.value)}
                    className="input h-20 resize-none"
                    placeholder="Any extra learning goals for this lesson?"
                  />
                </div>

                <button
                  onClick={generatePlan}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    : <><Wand2 className="w-4 h-4" /> Generate Lesson Plan</>}
                </button>
              </div>
            </div>

            {/* ── Output ── */}
            <div className="lg:col-span-3" id="lesson-plan-output">

              {/* Empty state */}
              {!plan && !loading && (
                <div className="card p-12 text-center text-brand-inkLight">
                  <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-brand-inkMid">Your AI-generated lesson plan will appear here</p>
                  <p className="text-sm mt-1">Fill in the form and click Generate</p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="card p-12 text-center">
                  <Loader2 className="w-12 h-12 text-brand-blue mx-auto mb-4 animate-spin" />
                  <p className="font-medium text-brand-ink">Generating your NERDC lesson plan…</p>
                  <p className="text-sm text-brand-inkLight mt-1">Building activities, objectives, differentiation &amp; more</p>
                </div>
              )}

              {/* Plan output */}
              {plan && (
                <div className="space-y-4">

                  {/* Title bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-lg text-brand-ink">
                        {planMeta.subTopic || planMeta.topic}
                      </h2>
                      <p className="text-sm text-brand-inkMid">
                        {planMeta.subject} · {planMeta.grade} · {duration}
                        {planMeta.subTopic && (
                          <span className="ml-1 text-brand-inkLight">· Topic: {planMeta.topic}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => { setPlan(null); setPlanMeta({ subject: '', topic: '', subTopic: '', grade: '' }) }}
                        className="btn-outline text-sm py-2 px-3 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> New
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="btn-outline text-sm py-2 px-3 flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> Print / PDF
                      </button>
                      <button
                        onClick={downloadDocx}
                        disabled={downloading}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1"
                      >
                        {downloading
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                          : <><FileText className="w-3 h-3" /> Download Word</>}
                      </button>
                    </div>
                  </div>

                  {/* Sub-topics covered */}
                  {plan.sub_topics?.length > 0 && (
                    <div className="card p-4">
                      <p className="text-xs font-semibold text-brand-inkMid uppercase tracking-wide mb-2">Sub-Topics Covered</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.sub_topics.map((st, i) => (
                          <span key={i} className={`badge ${i === 0 ? 'badge-amber' : 'badge-blue'}`}>{st}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  <Section icon={<Target className="w-4 h-4" />} title="Learning Objectives">
                    <ul className="space-y-2">
                      {plan.learning_objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-brand-inkMid">
                          <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Success Criteria */}
                  <Section icon={<Star className="w-4 h-4" />} title="Success Criteria">
                    <ul className="space-y-1">
                      {plan.success_criteria.map((sc, i) => (
                        <li key={i} className="text-sm text-brand-inkMid flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {sc}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Prior Learning */}
                  <Section icon={<BookOpen className="w-4 h-4" />} title="Prior Learning">
                    <p className="text-sm text-brand-inkMid leading-relaxed">{plan.prior_learning}</p>
                  </Section>

                  {/* Starter Activity */}
                  <Section icon={<Lightbulb className="w-4 h-4" />} title="Starter Activity" badge="5–8 min">
                    <p className="text-sm text-brand-inkMid leading-relaxed whitespace-pre-line">{plan.starter_activity}</p>
                  </Section>

                  {/* Main Activities */}
                  {plan.main_activities?.map((act, i) => (
                    <Section
                      key={i}
                      icon={<Users className="w-4 h-4" />}
                      title={act.title}
                      badge="10 min"
                    >
                      <p className="text-sm text-brand-inkMid leading-relaxed whitespace-pre-line">{act.description}</p>
                    </Section>
                  ))}

                  {/* Extension */}
                  {plan.extension && (
                    <Section icon={<Star className="w-4 h-4" />} title="Extension / Project">
                      <p className="text-sm text-brand-inkMid leading-relaxed">{plan.extension}</p>
                    </Section>
                  )}

                  {/* Teacher's Notes */}
                  <Section icon={<BookOpen className="w-4 h-4" />} title="Teacher's Content Notes">
                    <div className="bg-brand-blueLight/30 rounded-lg p-3">
                      <p className="text-sm text-brand-inkMid leading-relaxed whitespace-pre-line">{plan.note}</p>
                    </div>
                  </Section>

                  {/* Plenary */}
                  <Section icon={<Target className="w-4 h-4" />} title="Plenary" badge="5 min">
                    <p className="text-sm text-brand-inkMid leading-relaxed">{plan.plenary}</p>
                  </Section>

                  {/* Resources */}
                  <Section icon={<BookOpen className="w-4 h-4" />} title="Resources">
                    <div className="flex flex-wrap gap-2">
                      {plan.resources.map((r, i) => (
                        <span key={i} className="badge badge-blue">{r}</span>
                      ))}
                    </div>
                  </Section>

                  {/* Tasks */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Section icon={<Users className="w-4 h-4" />} title="Class Task">
                      <ul className="space-y-1">
                        {plan.class_task.map((t, i) => (
                          <li key={i} className="text-sm text-brand-inkMid flex items-start gap-2">
                            <span className="text-brand-amber mt-0.5">▸</span>{t}
                          </li>
                        ))}
                      </ul>
                    </Section>
                    <Section icon={<Home className="w-4 h-4" />} title="Home Task">
                      <ul className="space-y-1">
                        {plan.home_task.map((t, i) => (
                          <li key={i} className="text-sm text-brand-inkMid flex items-start gap-2">
                            <span className="text-brand-amber mt-0.5">▸</span>{t}
                          </li>
                        ))}
                      </ul>
                    </Section>
                  </div>

                  {/* Cross-curricular Links */}
                  {plan.links && Object.keys(plan.links).length > 0 && (
                    <Section icon={<Link2 className="w-4 h-4" />} title="Cross-Curricular Links">
                      <div className="space-y-2">
                        {Object.entries(plan.links).map(([subject, desc]) => (
                          <div key={subject} className="flex items-start gap-2 text-sm">
                            <span className="font-semibold text-brand-blue shrink-0 w-20">{subject}:</span>
                            <span className="text-brand-inkMid">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Key Words */}
                  {plan.key_words?.length > 0 && (
                    <Section icon={<Tag className="w-4 h-4" />} title="Key Words">
                      <div className="flex flex-wrap gap-2">
                        {plan.key_words.map((w, i) => (
                          <span key={i} className="badge badge-amber font-medium">{w}</span>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Differentiation (VAK) */}
                  <Section icon={<Eye className="w-4 h-4" />} title="Differentiation (VAK)">
                    <div className="space-y-3">
                      {[
                        { key: 'visual',      label: '👁️ Visual',       color: 'bg-blue-50 border-blue-100' },
                        { key: 'auditory',    label: '👂 Auditory',     color: 'bg-green-50 border-green-100' },
                        { key: 'kinesthetic', label: '🤲 Kinesthetic',  color: 'bg-amber-50 border-amber-100' },
                      ].map(({ key, label, color }) => (
                        <div key={key} className={`rounded-lg border p-3 ${color}`}>
                          <p className="text-xs font-semibold text-brand-ink mb-1">{label}</p>
                          <p className="text-sm text-brand-inkMid">
                            {plan.differentiation[key as keyof typeof plan.differentiation]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Evaluation table placeholder */}
                  <Section icon={<Users className="w-4 h-4" />} title="Evaluation (HA / MA / LA)">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-brand-blueLight/40">
                            <th className="text-left p-2 border border-brand-blue/20 text-brand-ink font-semibold">Names</th>
                            <th className="text-left p-2 border border-brand-blue/20 text-brand-ink font-semibold">Ability</th>
                            <th className="text-left p-2 border border-brand-blue/20 text-brand-ink font-semibold">Intended Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['HA — High Ability', 'MA — Middle Ability', 'LA — Low Ability'].map(row => (
                            <tr key={row}>
                              <td className="p-2 border border-brand-blue/10 text-brand-inkLight">&nbsp;</td>
                              <td className="p-2 border border-brand-blue/10 text-brand-inkMid font-medium">{row}</td>
                              <td className="p-2 border border-brand-blue/10 text-brand-inkLight">&nbsp;</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-brand-inkLight mt-2">Fill in pupil names and observations during/after the lesson.</p>
                  </Section>

                  {/* Download buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => window.print()}
                      className="btn-outline w-full flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" /> Print / Save PDF
                    </button>
                    <button
                      onClick={downloadDocx}
                      disabled={downloading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {downloading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                        : <><FileText className="w-4 h-4" /> Download Word (.docx)</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
