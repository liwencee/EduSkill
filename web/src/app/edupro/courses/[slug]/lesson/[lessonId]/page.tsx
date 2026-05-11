'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { CPD_COURSES } from '@/lib/static-cpd-courses'
import type { CPDLesson, CPDModule } from '@/lib/static-cpd-courses'
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle, Clock, Lightbulb,
  Trophy, ChevronRight, Award
} from 'lucide-react'

export default function CPDLessonPage() {
  const params = useParams()
  const slug = params.slug as string
  const lessonId = params.lessonId as string

  const course = CPD_COURSES.find(c => c.slug === slug)

  // Find the lesson and its module
  let currentModule: CPDModule | undefined
  let currentLesson: CPDLesson | undefined
  let lessonIndex = 0
  let globalLessonIndex = 0
  let totalLessons = 0

  if (course) {
    let idx = 0
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        if (les.id === lessonId) {
          currentModule = mod
          currentLesson = les
          lessonIndex = idx
          globalLessonIndex = idx
        }
        idx++
      }
    }
    totalLessons = idx
  }

  // Find prev/next lessons
  const allLessons = course
    ? course.modules.flatMap(m => m.lessons)
    : []
  const prevLesson = globalLessonIndex > 0 ? allLessons[globalLessonIndex - 1] : null
  const nextLesson = globalLessonIndex < allLessons.length - 1 ? allLessons[globalLessonIndex + 1] : null
  const isLastLesson = globalLessonIndex === allLessons.length - 1

  // Quiz state
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)

  const quizScore = useMemo(() => {
    if (!currentLesson || !showResults) return 0
    let correct = 0
    currentLesson.quiz.forEach((q, qi) => {
      const correctIdx = q.options.findIndex(o => o.correct)
      if (selected[qi] === correctIdx) correct++
    })
    return currentLesson.quiz.length > 0
      ? Math.round((correct / currentLesson.quiz.length) * 100)
      : 0
  }, [currentLesson, selected, showResults])

  if (!course || !currentModule || !currentLesson) {
    return (
      <div className="bg-brand-bg min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <BookOpen className="w-16 h-16 text-brand-inkLight mx-auto mb-4 opacity-30" />
          <h1 className="text-xl font-bold text-brand-ink mb-2">Lesson Not Found</h1>
          <p className="text-brand-inkMid text-sm mb-6">This lesson does not exist or has been moved.</p>
          <Link href="/edupro/courses" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* Breadcrumb header */}
      <div className="bg-white border-b border-[#E0DDD5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-brand-inkLight">
            <Link href="/edupro/courses" className="hover:text-brand-blue transition-colors">CPD Courses</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/edupro/courses/${course.slug}`} className="hover:text-brand-blue transition-colors truncate max-w-[200px]">
              {course.title}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-ink font-medium truncate max-w-[200px]">{currentLesson.title}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-[#E0DDD5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-inkLight font-medium">
              Lesson {globalLessonIndex + 1} of {totalLessons}
            </span>
            <div className="flex-1 h-2 bg-brand-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-blue rounded-full transition-all duration-500"
                style={{ width: `${((globalLessonIndex + 1) / totalLessons) * 100}%` }}
              />
            </div>
            <span className="text-xs text-brand-inkLight">
              {Math.round(((globalLessonIndex + 1) / totalLessons) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Module + Lesson title */}
        <div className="mb-8">
          <span className="badge badge-blue text-xs mb-2">{currentModule.title}</span>
          <h1 className="text-2xl font-bold text-brand-ink mb-2">{currentLesson.title}</h1>
          <div className="flex items-center gap-3 text-sm text-brand-inkLight">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {currentLesson.duration_mins} min read</span>
            <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> {currentLesson.quiz.length} quiz questions</span>
          </div>
        </div>

        {/* Lesson content */}
        <div className="space-y-6 mb-10">
          {currentLesson.content.map((paragraph, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E0DDD5] p-6">
              <p className="text-sm text-brand-inkMid leading-relaxed">{paragraph}</p>
            </div>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-brand-ink mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-blue" />
            Key Takeaways
          </h2>
          <ul className="space-y-2">
            {currentLesson.key_takeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-inkMid">
                <span className="text-brand-blue mt-0.5 font-bold">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Practical Activity */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F97316] uppercase tracking-wide mb-1">Practical Activity</p>
              <p className="text-sm text-orange-900 font-medium leading-relaxed">{currentLesson.practical_activity}</p>
            </div>
          </div>
        </div>

        {/* Quiz */}
        <div className="bg-white rounded-2xl border border-[#E0DDD5] shadow-sm p-6 mb-10">
          <h2 className="font-bold text-brand-ink text-lg mb-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F97316]" /> Knowledge Check
          </h2>
          <p className="text-sm text-brand-inkLight mb-6">
            Test what you&apos;ve learned in this lesson. Score {course.pass_mark}% across all lessons to earn your certificate.
          </p>

          {currentLesson.quiz.map((q, qi) => {
            const correctIdx = q.options.findIndex(o => o.correct)
            return (
              <div key={qi} className="mb-6">
                <p className="font-semibold text-brand-ink text-sm mb-3">
                  <span className="text-brand-blue mr-1">Q{qi + 1}.</span> {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected[qi] === oi
                    const isCorrect = oi === correctIdx
                    let optClass = 'border-[#E0DDD5] hover:border-brand-blue/40 cursor-pointer'
                    if (showResults) {
                      if (isCorrect) optClass = 'border-green-400 bg-green-50'
                      else if (isSelected && !isCorrect) optClass = 'border-red-400 bg-red-50'
                      else optClass = 'border-[#E0DDD5] opacity-60'
                    } else if (isSelected) {
                      optClass = 'border-brand-blue bg-brand-blueLight'
                    }

                    return (
                      <button
                        key={oi}
                        onClick={() => !showResults && setSelected(prev => ({ ...prev, [qi]: oi }))}
                        disabled={showResults}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${optClass}`}
                      >
                        <span className="font-medium text-brand-ink">
                          {String.fromCharCode(65 + oi)}.
                        </span>{' '}
                        <span className="text-brand-inkMid">{opt.text}</span>
                        {showResults && isCorrect && <span className="ml-2 text-green-600 font-bold">✓</span>}
                        {showResults && isSelected && !isCorrect && <span className="ml-2 text-red-600 font-bold">✗</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {showResults && (
                  <div className={`mt-2 p-3 rounded-lg text-xs ${selected[qi] === correctIdx ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                    <strong>{selected[qi] === correctIdx ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}

          {/* Submit / Score */}
          {!showResults ? (
            <button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(selected).length < currentLesson.quiz.length}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Check Answers
            </button>
          ) : (
            <div className={`text-center p-4 rounded-xl ${quizScore >= course.pass_mark ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-2xl font-bold mb-1" style={{ color: quizScore >= course.pass_mark ? '#16a34a' : '#d97706' }}>
                {quizScore}%
              </p>
              <p className="text-sm text-brand-inkMid">
                {quizScore >= course.pass_mark
                  ? 'Great work! You passed this lesson.'
                  : `You need ${course.pass_mark}% to pass. Review the material and try again.`}
              </p>
              {quizScore < course.pass_mark && (
                <button
                  onClick={() => { setSelected({}); setShowResults(false) }}
                  className="btn-outline text-sm mt-3 py-2 px-4"
                >
                  Retry Quiz
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          {prevLesson ? (
            <Link
              href={`/edupro/courses/${course.slug}/lesson/${prevLesson.id}`}
              className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/edupro/courses/${course.slug}/lesson/${nextLesson.id}`}
              className="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
            >
              Next: {nextLesson.title} <ArrowRight className="w-4 h-4" />
            </Link>
          ) : isLastLesson ? (
            <Link
              href={`/edupro/courses/${course.slug}/certificate`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> Claim Your Certificate
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
