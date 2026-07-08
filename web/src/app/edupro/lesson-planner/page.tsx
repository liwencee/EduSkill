'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import {
  Wand2, Loader2, Download, RefreshCw, BookOpen,
  Target, CheckSquare, Users, Home,
  Link2, FileText, Pencil, Star, Key, PlayCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const GRADE_LEVELS = [
  'Nursery 1','Nursery 2',
  'Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6',
  'JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3',
  'TVET Level 1','TVET Level 2',
]
const DURATIONS = ['35 minutes','40 minutes','45 minutes','60 minutes','90 minutes','2 hours']
const SUBJECTS  = [
  'Mathematics','English Language','Basic Science','Agricultural Science',
  'Technical Drawing','Computer Studies','Digital Skills','Business Studies',
  'Vocational Technology','Home Economics','Physical Education',
  'Social Studies','Civic Education','Yoruba','Igbo','Hausa',
  'Biology','Chemistry','Physics','Geography','History','Economics',
]

interface Example      { title: string; description: string }
interface ClassWork    { question: string; marks: number; model_answer: string }
interface MainActivity { title: string; description: string }

interface LessonPlan {
  sub_topics?: string[]
  key_words?: string[]
  learning_objectives?: string[]
  success_criteria?: string[]
  prior_learning?: string
  lesson_notes?: {
    definition?: string
    detailed_explanation?: string[]
    examples?: Example[]
    daily_life_application?: string[]
  }
  starter_activity?: string
  main_activities?: MainActivity[]
  plenary?: string
  extension?: string
  class_work?: ClassWork[]
  note?: string
  resources?: string[]
  home_task?: string[]
  links?: Record<string, string>
  differentiation?: { visual?: string; auditory?: string; kinesthetic?: string }
}

function Section({ icon, title, children, accent = 'blue' }: {
  icon: React.ReactNode; title: string; children: React.ReactNode
  accent?: 'blue'|'amber'|'green'|'purple'
}) {
  const hdr: Record<string,string> = {
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
    amber:  'bg-amber-50 border-amber-200 text-amber-800',
    green:  'bg-emerald-50 border-emerald-200 text-emerald-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  }
  return (
    <div className="card overflow-hidden">
      <div className={`px-5 py-3 flex items-center gap-2 border-b ${hdr[accent]}`}>
        <span className="shrink-0">{icon}</span>
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5 space-y-2">{children}</div>
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-700">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
      {text}
    </li>
  )
}

export default function LessonPlannerPage() {
  const [subject,    setSubject]    = useState('')
  const [topic,      setTopic]      = useState('')
  const [subTopic,   setSubTopic]   = useState('')
  const [grade,      setGrade]      = useState('')
  const [duration,   setDuration]   = useState('45 minutes')
  const [objectives, setObjectives] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [plan,       setPlan]       = useState<LessonPlan | null>(null)

  async function generatePlan() {
    if (!subject || !topic || !grade) { toast.error('Please fill in Subject, Topic and Grade'); return }
    setLoading(true); setPlan(null)
    try {
      const res = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, subTopic, grade, duration, objectives }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPlan(data.plan)
      toast.success('Lesson plan generated!')
    } catch { toast.error('Could not generate plan. Please try again.') }
    setLoading(false)
  }

  async function downloadDOCX() {
    if (!plan) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, subject, topic, grade }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Lesson-Plan-${subject}-${topic}.docx`.replace(/\s+/g,'-')
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Word document downloaded!')
    } catch { toast.error('Could not export DOCX. Try again.') }
    setExporting(false)
  }

  const totalMarks = plan?.class_work?.reduce((s,q) => s+(q.marks??0), 0) ?? 0

  return (
    <>
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">NERDC Lesson Plan</h1>
        <p className="text-sm text-gray-500">{subject} · {topic}{subTopic?` · ${subTopic}`:''} · {grade}</p>
      </div>

      <Navbar />

      <style>{`
        @media print {
          .no-print{display:none!important;}
          body{background:#fff!important;}
          .card{box-shadow:none!important;border:1px solid #e2e8f0!important;}
        }
      `}</style>

      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="mb-8 no-print">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-blueLight rounded-xl flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-brand-blue" />
              </div>
              <h1 className="text-2xl font-bold text-brand-ink">AI Lesson Planner</h1>
            </div>
            <p className="text-brand-inkMid text-sm">
              NERDC-aligned · Full lesson notes · Definitions, examples & daily-life application · Class work · Export to Word & PDF
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">

            {/* Form */}
            <div className="lg:col-span-2 no-print">
              <div className="card p-6 space-y-4 sticky top-20">

                <div>
                  <label className="label">Subject</label>
                  <select value={subject} onChange={e=>setSubject(e.target.value)} className="input">
                    <option value="">Select subject…</option>
                    {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Main Topic</label>
                  <input type="text" value={topic} onChange={e=>setTopic(e.target.value)}
                    className="input" placeholder="e.g. Figures of Speech" />
                </div>

                <div>
                  <label className="label">Sub-Topic / Lesson Focus <span className="text-brand-inkLight font-normal">(optional)</span></label>
                  <input type="text" value={subTopic} onChange={e=>setSubTopic(e.target.value)}
                    className="input" placeholder="e.g. Similes and Metaphors" />
                </div>

                <div>
                  <label className="label">Grade / Class Level</label>
                  <select value={grade} onChange={e=>setGrade(e.target.value)} className="input">
                    <option value="">Select grade…</option>
                    {GRADE_LEVELS.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Lesson Duration</label>
                  <select value={duration} onChange={e=>setDuration(e.target.value)} className="input">
                    {DURATIONS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Additional Objectives <span className="text-brand-inkLight font-normal">(optional)</span></label>
                  <textarea value={objectives} onChange={e=>setObjectives(e.target.value)}
                    className="input h-20 resize-none" placeholder="Any specific exam skills or objectives?" />
                </div>

                <button onClick={generatePlan} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading?<><Loader2 className="w-4 h-4 animate-spin"/>Generating…</>
                         :<><Wand2 className="w-4 h-4"/>Generate Lesson Plan</>}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="lg:col-span-3 space-y-5">

              {!plan && !loading && (
                <div className="card p-12 text-center text-brand-inkLight no-print">
                  <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                  <p className="font-medium text-brand-inkMid">Your AI lesson plan will appear here</p>
                  <p className="text-sm mt-1">Fill in the form and click Generate</p>
                  <div className="mt-6 grid grid-cols-2 gap-2 text-left text-xs text-brand-inkLight max-w-sm mx-auto">
                    {['📖 Full lesson notes & breakdown','✍️ Class work with model answers',
                      '🌍 Daily-life application in Nigeria','📄 Export as Word (.docx) or PDF'].map(f=>(
                      <div key={f}>{f}</div>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="card p-12 text-center no-print">
                  <Loader2 className="w-12 h-12 text-brand-blue mx-auto mb-4 animate-spin"/>
                  <p className="font-medium text-brand-ink">Generating your lesson plan…</p>
                  <p className="text-sm text-brand-inkLight mt-1">NERDC-aligned · Usually 10–20 seconds</p>
                </div>
              )}

              {plan && (<>

                {/* Action bar */}
                <div className="flex items-center justify-between flex-wrap gap-3 no-print">
                  <h2 className="font-bold text-lg text-brand-ink">
                    {topic}{subTopic?` — ${subTopic}`:''}
                    <span className="text-brand-inkLight font-normal text-base ml-2">· {grade}</span>
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={()=>setPlan(null)}
                      className="btn-outline text-sm py-2 px-3 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3"/>New Plan
                    </button>
                    <button onClick={()=>window.print()}
                      className="btn-outline text-sm py-2 px-3 flex items-center gap-1.5">
                      <Download className="w-3 h-3"/>Save PDF
                    </button>
                    <button onClick={downloadDOCX} disabled={exporting}
                      className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5">
                      {exporting?<><Loader2 className="w-3 h-3 animate-spin"/>Exporting…</>
                               :<><FileText className="w-3 h-3"/>Save Word (.docx)</>}
                    </button>
                  </div>
                </div>

                {/* Sub-topics */}
                {plan.sub_topics?.length?(
                  <Section icon={<BookOpen className="w-4 h-4"/>} title="Sub-Topics" accent="blue">
                    <div className="flex flex-wrap gap-2">
                      {plan.sub_topics.map((s,i)=>(
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </Section>
                ):null}

                {/* Key Words */}
                {plan.key_words?.length?(
                  <Section icon={<Key className="w-4 h-4"/>} title="Key Words" accent="purple">
                    <div className="flex flex-wrap gap-2">
                      {plan.key_words.map((k,i)=>(
                        <span key={i} className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">{k}</span>
                      ))}
                    </div>
                  </Section>
                ):null}

                {/* Learning Objectives */}
                {plan.learning_objectives?.length?(
                  <Section icon={<Target className="w-4 h-4"/>} title="Learning Objectives" accent="blue">
                    <ul className="space-y-1.5">
                      {plan.learning_objectives.map((o,i)=><Bullet key={i} text={o}/>)}
                    </ul>
                  </Section>
                ):null}

                {/* Success Criteria */}
                {plan.success_criteria?.length?(
                  <Section icon={<CheckSquare className="w-4 h-4"/>} title="Success Criteria" accent="green">
                    <ul className="space-y-1.5">
                      {plan.success_criteria.map((s,i)=><Bullet key={i} text={s}/>)}
                    </ul>
                  </Section>
                ):null}

                {/* Prior Learning */}
                {plan.prior_learning?(
                  <Section icon={<Link2 className="w-4 h-4"/>} title="Prior Learning" accent="amber">
                    <p className="text-sm text-slate-700 leading-relaxed">{plan.prior_learning}</p>
                  </Section>
                ):null}

                {/* ── LESSON NOTES ── */}
                {plan.lesson_notes&&(
                  <div className="card overflow-hidden">
                    <div className="px-5 py-3 bg-blue-600 text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 shrink-0"/>
                      <h3 className="font-bold text-sm uppercase tracking-wide">📖 Lesson Notes</h3>
                    </div>
                    <div className="p-5 space-y-6">

                      {plan.lesson_notes.definition&&(
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">📌 Definition</p>
                          <p className="text-sm text-blue-900 leading-relaxed font-medium">{plan.lesson_notes.definition}</p>
                        </div>
                      )}

                      {plan.lesson_notes.detailed_explanation?.length?(
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">🔍 Detailed Explanation</p>
                          <div className="space-y-3">
                            {plan.lesson_notes.detailed_explanation.map((p,i)=>(
                              <p key={i} className="text-sm text-slate-700 leading-relaxed">{p}</p>
                            ))}
                          </div>
                        </div>
                      ):null}

                      {plan.lesson_notes.examples?.length?(
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">💡 Examples</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {plan.lesson_notes.examples.map((ex,i)=>(
                              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                <p className="text-xs font-bold text-brand-blue mb-1">{ex.title}</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{ex.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ):null}

                      {plan.lesson_notes.daily_life_application?.length?(
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">
                            🌍 How This Applies to Daily Life in Nigeria
                          </p>
                          <ul className="space-y-2">
                            {plan.lesson_notes.daily_life_application.map((a,i)=>(
                              <Bullet key={i} text={a}/>
                            ))}
                          </ul>
                        </div>
                      ):null}

                    </div>
                  </div>
                )}

                {/* Lesson Flow */}
                <Section icon={<PlayCircle className="w-4 h-4"/>} title="Lesson Flow" accent="blue">
                  <div className="space-y-4">
                    {plan.starter_activity&&(
                      <div>
                        <p className="text-xs font-bold text-brand-blue mb-1">🚀 Starter Activity</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{plan.starter_activity}</p>
                      </div>
                    )}
                    {plan.main_activities?.map((act,i)=>(
                      <div key={i} className="border-l-2 border-brand-blue pl-3">
                        <p className="text-xs font-bold text-brand-blue mb-1">{act.title}</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{act.description}</p>
                      </div>
                    ))}
                    {plan.plenary&&(
                      <div>
                        <p className="text-xs font-bold text-brand-blue mb-1">🔚 Plenary</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{plan.plenary}</p>
                      </div>
                    )}
                    {plan.extension&&(
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p className="text-xs font-bold text-amber-700 mb-1">⭐ Extension / Enrichment</p>
                        <p className="text-sm text-amber-900">{plan.extension}</p>
                      </div>
                    )}
                  </div>
                </Section>

                {/* ── CLASS WORK ── */}
                {plan.class_work?.length?(
                  <div className="card overflow-hidden">
                    <div className="px-5 py-3 bg-emerald-700 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pencil className="w-4 h-4"/>
                        <h3 className="font-bold text-sm uppercase tracking-wide">✍️ Class Work</h3>
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                        Total: {totalMarks} marks
                      </span>
                    </div>
                    <div className="p-5 space-y-5">
                      {plan.class_work.map((cw,i)=>(
                        <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-slate-50 flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800 flex-1">
                              <span className="text-emerald-700 mr-1">Q{i+1}.</span>
                              {cw.question.replace(/^\d+\.\s*/,'')}
                            </p>
                            <span className="shrink-0 text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {cw.marks} {cw.marks===1?'mark':'marks'}
                            </span>
                          </div>
                          {/* Writing lines */}
                          <div className="px-4 pt-3 pb-1 space-y-3">
                            {[1,2,3].map(l=>(
                              <div key={l} className="h-6 border-b border-dashed border-slate-200"/>
                            ))}
                          </div>
                          {/* Model answer */}
                          <div className="px-4 pb-3 no-print">
                            <details>
                              <summary className="text-xs text-slate-400 cursor-pointer hover:text-brand-blue mt-2 select-none">
                                View model answer (teacher only)
                              </summary>
                              <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">{cw.model_answer}</p>
                            </details>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ):null}

                {/* Teacher's Notes */}
                {plan.note?(
                  <Section icon={<FileText className="w-4 h-4"/>} title="Teacher's Content Notes" accent="amber">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{plan.note}</p>
                  </Section>
                ):null}

                {/* Differentiation */}
                {plan.differentiation?(
                  <Section icon={<Users className="w-4 h-4"/>} title="Differentiation (VAK)" accent="purple">
                    <div className="space-y-3">
                      {plan.differentiation.visual&&(<div>
                        <p className="text-xs font-bold text-purple-700 mb-0.5">👁 Visual</p>
                        <p className="text-sm text-slate-700">{plan.differentiation.visual}</p>
                      </div>)}
                      {plan.differentiation.auditory&&(<div>
                        <p className="text-xs font-bold text-purple-700 mb-0.5">👂 Auditory</p>
                        <p className="text-sm text-slate-700">{plan.differentiation.auditory}</p>
                      </div>)}
                      {plan.differentiation.kinesthetic&&(<div>
                        <p className="text-xs font-bold text-purple-700 mb-0.5">🤸 Kinesthetic</p>
                        <p className="text-sm text-slate-700">{plan.differentiation.kinesthetic}</p>
                      </div>)}
                    </div>
                  </Section>
                ):null}

                {/* Resources */}
                {plan.resources?.length?(
                  <Section icon={<Star className="w-4 h-4"/>} title="Resources Needed" accent="amber">
                    <ul className="space-y-1.5">
                      {plan.resources.map((r,i)=><Bullet key={i} text={r}/>)}
                    </ul>
                  </Section>
                ):null}

                {/* Cross-curricular Links */}
                {plan.links&&Object.keys(plan.links).length?(
                  <Section icon={<Link2 className="w-4 h-4"/>} title="Cross-Curricular Links" accent="blue">
                    <div className="space-y-2">
                      {Object.entries(plan.links).map(([k,v])=>(
                        <div key={k}>
                          <p className="text-xs font-bold text-brand-blue mb-0.5">{k}</p>
                          <p className="text-sm text-slate-700">{v}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                ):null}

                {/* Home Task */}
                {plan.home_task?.length?(
                  <Section icon={<Home className="w-4 h-4"/>} title="Home Task / Homework" accent="green">
                    <ul className="space-y-1.5">
                      {plan.home_task.map((h,i)=><Bullet key={i} text={h}/>)}
                    </ul>
                  </Section>
                ):null}

                {/* Bottom export row */}
                <div className="flex gap-3 pb-10 no-print">
                  <button onClick={()=>window.print()}
                    className="btn-outline flex-1 flex items-center justify-center gap-2 py-3">
                    <Download className="w-4 h-4"/>Save as PDF
                  </button>
                  <button onClick={downloadDOCX} disabled={exporting}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                    {exporting?<><Loader2 className="w-4 h-4 animate-spin"/>Exporting…</>
                             :<><FileText className="w-4 h-4"/>Save as Word (.docx)</>}
                  </button>
                </div>

              </>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
