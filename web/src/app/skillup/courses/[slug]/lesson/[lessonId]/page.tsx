'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  Sparkles, Loader2, ChevronLeft, ChevronRight, CheckCircle,
  XCircle, BookOpen, Lightbulb, Clock, ArrowLeft, Trophy
} from 'lucide-react'
import { COURSE_CURRICULUM, findLesson, allLessons } from '@/lib/course-content'
import { STATIC_COURSES } from '@/lib/static-courses'

/** Extract YouTube video ID from any YouTube URL format */
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]{11})/)
  return m ? m[1] : null
}

interface QuizQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

interface LessonContent {
  ai_intro: string
  key_concepts: string[]
  sections: { heading: string; body: string }[]
  practical_tip: string
  quiz: QuizQuestion[]
  summary: string
}

export default function LessonPage() {
  const params   = useParams()
  const slug     = params.slug as string
  const lessonId = params.lessonId as string

  const [content,     setContent]     = useState<LessonContent | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState<(number | null)[]>([])
  const [submitted,   setSubmitted]   = useState(false)
  const [score,       setScore]       = useState(0)

  // Find static course & lesson info
  const course   = STATIC_COURSES.find(c => c.slug === slug)
  const found    = findLesson(slug, lessonId)
  const lessons  = allLessons(slug)
  const lessonIdx = lessons.findIndex(l => l.id === lessonId)
  const prevLesson = lessons[lessonIdx - 1] ?? null
  const nextLesson = lessons[lessonIdx + 1] ?? null

  useEffect(() => {
    if (!found || !course) return
    setContent(null)
    setLoading(true)
    setSelected([])
    setSubmitted(false)

    fetch('/api/lesson-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseTitle: course.title,
        moduleTitle: found.module.title,
        lessonTitle: found.lesson.title,
      }),
    })
      .then(r => r.json())
      .then(data => { setContent(data.content); setLoading(false) })
      .catch(() => setLoading(false))
  }, [lessonId, slug])

  function submitQuiz() {
    if (!content) return
    const s = content.quiz.reduce((acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0), 0)
    setScore(s)
    setSubmitted(true)
  }

  if (!found || !course) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-ink font-semibold mb-4">Lesson not found</p>
          <Link href={`/skillup/courses/${slug}`} className="text-brand-blue hover:underline">
            ← Back to course
          </Link>
        </div>
      </div>
    )
  }

  const { module: mod, lesson } = found
  const allMods = COURSE_CURRICULUM[slug] ?? []

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ── Left Sidebar: Curriculum ── */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden sticky top-20">
              <div className="bg-[#4F46E5] px-4 py-3">
                <Link href={`/skillup/courses/${slug}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white text-xs mb-1">
                  <ArrowLeft className="w-3 h-3" /> Back to course
                </Link>
                <p className="text-white font-bold text-sm leading-tight line-clamp-2">{course.title}</p>
              </div>
              <div className="overflow-y-auto max-h-[70vh]">
                {allMods.map(m => (
                  <div key={m.id}>
                    <div className="px-4 py-2 bg-indigo-50 border-y border-indigo-100">
                      <p className="text-xs font-bold text-[#4F46E5] uppercase tracking-wide">{m.title}</p>
                    </div>
                    {m.lessons.map(l => (
                      <Link key={l.id}
                        href={`/skillup/courses/${slug}/lesson/${l.id}`}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-indigo-50 transition-colors border-b border-indigo-50 ${
                          l.id === lessonId ? 'bg-indigo-100 font-semibold text-[#4F46E5]' : 'text-gray-600'
                        }`}>
                        <span className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                          l.id === lessonId ? 'bg-[#4F46E5] text-white' : 'bg-indigo-100 text-[#4F46E5]'
                        }`}>{l.order_index}</span>
                        <span className="line-clamp-2 leading-tight">{l.title}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="lg:col-span-3 space-y-5">

            {/* Lesson Header */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center gap-2 text-xs text-[#4F46E5] font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{mod.title}</span>
              </div>
              <h1 className="text-xl font-bold text-[#1E1B4B] mb-2">{lesson.title}</h1>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration_mins} min</span>
                <span className="text-gray-300">·</span>
                <span>Lesson {lessonIdx + 1} of {lessons.length}</span>
              </div>
            </div>

            {/* ── YouTube Video Player ── */}
            {lesson.youtube_url && (() => {
              const vid = getYouTubeId(lesson.youtube_url)
              if (!vid) return null
              return (
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <div className="px-4 py-2 bg-indigo-50 flex items-center gap-2">
                    <span className="text-xs text-[#4F46E5] font-semibold">🎬 Video Lesson</span>
                    <span className="text-xs text-gray-400">· Continue with the AI lesson notes below</span>
                  </div>
                </div>
              )
            })()}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#4F46E5] animate-pulse" />
                </div>
                <p className="font-semibold text-[#1E1B4B] mb-1">AI Tutor is preparing your lesson…</p>
                <p className="text-sm text-gray-400">Generating personalised content for you</p>
                <Loader2 className="w-5 h-5 text-[#4F46E5] animate-spin mx-auto mt-4" />
              </div>
            )}

            {content && !loading && (
              <>
                {/* AI Intro */}
                <div className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-2xl p-6 text-white">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/60 uppercase tracking-wide mb-1">SkillBridge AI Tutor</p>
                      <p className="text-sm leading-relaxed">{content.ai_intro}</p>
                    </div>
                  </div>
                </div>

                {/* Key Concepts */}
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
                  <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#F97316]" /> Key Concepts
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {content.key_concepts.map((kc, i) => (
                      <div key={i} className="flex items-start gap-3 bg-indigo-50 rounded-xl p-3">
                        <span className="w-6 h-6 bg-[#4F46E5] text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="text-sm text-[#1E1B4B] font-medium leading-snug">{kc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Sections */}
                {content.sections.map((section, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
                    <h2 className="font-bold text-[#1E1B4B] text-lg mb-3">{section.heading}</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{section.body}</p>
                  </div>
                ))}

                {/* Practical Tip */}
                {content.practical_tip && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#F97316] uppercase tracking-wide mb-1">Today's Action Step</p>
                        <p className="text-sm text-orange-900 font-medium">{content.practical_tip}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quiz */}
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
                  <h2 className="font-bold text-[#1E1B4B] text-lg mb-1 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#F97316]" /> Knowledge Check
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">Test what you've learned in this lesson</p>

                  {content.quiz.map((q, qi) => (
                    <div key={qi} className="mb-6">
                      <p className="font-semibold text-[#1E1B4B] text-sm mb-3">
                        <span className="text-[#4F46E5] mr-1">Q{qi + 1}.</span> {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const isSelected = selected[qi] === oi
                          const isCorrect  = oi === q.answer
                          let cls = 'border-indigo-100 bg-white text-gray-700 hover:border-[#4F46E5] hover:bg-indigo-50'
                          if (submitted) {
                            if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800'
                            else if (isSelected && !isCorrect) cls = 'border-red-300 bg-red-50 text-red-700'
                            else cls = 'border-indigo-50 bg-gray-50 text-gray-400'
                          } else if (isSelected) {
                            cls = 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-semibold'
                          }
                          return (
                            <button key={oi}
                              disabled={submitted}
                              onClick={() => {
                                const s = [...selected]
                                s[qi] = oi
                                setSelected(s)
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${cls}`}>
                              <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>
                              {opt}
                              {submitted && isCorrect && <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />}
                              {submitted && isSelected && !isCorrect && <XCircle className="inline w-4 h-4 text-red-400 ml-2" />}
                            </button>
                          )
                        })}
                      </div>
                      {submitted && (
                        <div className={`mt-2 text-xs px-4 py-2 rounded-lg ${selected[qi] === q.answer ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          <strong>{selected[qi] === q.answer ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {!submitted ? (
                    <button
                      onClick={submitQuiz}
                      disabled={selected.filter(s => s !== null && s !== undefined).length < content.quiz.length}
                      className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed">
                      Submit Answers
                    </button>
                  ) : (
                    <div className={`rounded-xl p-4 text-center mb-4 ${score === content.quiz.length ? 'bg-green-50 border border-green-200' : score >= content.quiz.length / 2 ? 'bg-indigo-50 border border-indigo-200' : 'bg-orange-50 border border-orange-200'}`}>
                      <p className="font-bold text-[#1E1B4B] text-lg">{score}/{content.quiz.length} Correct</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {score === content.quiz.length ? '🎉 Perfect score! You nailed it.' : score >= content.quiz.length / 2 ? '👍 Good work! Review the explanations above.' : '📚 Review the lesson and try again.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-[#1E1B4B] rounded-2xl p-6 text-white">
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Lesson Summary</p>
                  <p className="text-sm leading-relaxed text-white/90">{content.summary}</p>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pb-8">
              {prevLesson ? (
                <Link href={`/skillup/courses/${slug}/lesson/${prevLesson.id}`}
                  className="flex items-center gap-2 text-sm font-semibold text-[#4F46E5] hover:underline">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Link>
              ) : (
                <Link href={`/skillup/courses/${slug}`}
                  className="flex items-center gap-2 text-sm font-semibold text-[#4F46E5] hover:underline">
                  <ChevronLeft className="w-4 h-4" /> Back to Course
                </Link>
              )}
              {nextLesson ? (
                <Link href={`/skillup/courses/${slug}/lesson/${nextLesson.id}`}
                  className="flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link href={`/skillup/courses/${slug}`}
                  className="flex items-center gap-2 bg-[#F97316] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
                  Course Complete 🎉 <Trophy className="w-4 h-4" />
                </Link>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
