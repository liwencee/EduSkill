import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { CPD_COURSES } from '@/lib/static-cpd-courses'
import {
  Clock, BookOpen, Users, Star, CheckCircle, ArrowRight, Award,
  ArrowLeft, PlayCircle, Shield
} from 'lucide-react'

interface Props {
  params: { slug: string }
}

export default function CPDCourseDetailPage({ params }: Props) {
  const course = CPD_COURSES.find(c => c.slug === params.slug)
  if (!course) return notFound()

  const totalQuizzes = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.quiz.length, 0), 0
  )

  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="bg-brand-blue text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/edupro/courses" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All CPD Courses
          </Link>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shrink-0 border border-white/20">
              {course.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge bg-white/20 text-white text-xs">{course.category}</span>
                {course.avg_rating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {course.avg_rating.toFixed(1)}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
            </div>
          </div>

          <p className="text-white/80 max-w-3xl leading-relaxed mb-6">{course.long_description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.weeks} weeks</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.total_lessons} lessons</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.total_enrolled.toLocaleString()} enrolled</span>
            <span className="flex items-center gap-1"><Award className="w-4 h-4 text-brand-amber" /> CPD Certificate on completion</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* What you'll learn */}
            <div className="bg-white rounded-2xl border border-[#E0DDD5] p-6">
              <h2 className="font-bold text-lg text-brand-ink mb-4">What You&apos;ll Learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.what_you_learn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span className="text-sm text-brand-inkMid">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Modules */}
            <div>
              <h2 className="font-bold text-lg text-brand-ink mb-4">Course Content</h2>
              <div className="space-y-4">
                {course.modules.map((mod, mi) => (
                  <div key={mod.id} className="bg-white rounded-2xl border border-[#E0DDD5] overflow-hidden">
                    <div className="p-5 border-b border-[#E0DDD5]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-7 h-7 rounded-lg bg-brand-blue text-white text-xs font-bold flex items-center justify-center">
                          {mi + 1}
                        </span>
                        <h3 className="font-bold text-brand-ink">{mod.title}</h3>
                      </div>
                      <p className="text-sm text-brand-inkMid ml-9">{mod.description}</p>
                    </div>
                    <div className="divide-y divide-[#E0DDD5]">
                      {mod.lessons.map((lesson, li) => (
                        <Link
                          key={lesson.id}
                          href={`/edupro/courses/${course.slug}/lesson/${lesson.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-brand-bg/50 transition-colors group"
                        >
                          <PlayCircle className="w-5 h-5 text-brand-inkLight group-hover:text-brand-blue transition-colors shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-brand-ink group-hover:text-brand-blue transition-colors truncate">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-brand-inkLight">
                              {lesson.duration_mins} min · {lesson.quiz.length} quiz question{lesson.quiz.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-brand-inkLight group-hover:text-brand-blue transition-colors shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NERDC Alignment */}
            <div className="bg-white rounded-2xl border border-[#E0DDD5] p-6">
              <h2 className="font-bold text-lg text-brand-ink mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-blue" />
                NERDC &amp; Regulatory Alignment
              </h2>
              <ul className="space-y-2">
                {course.nerdc_alignment.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-brand-inkMid">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Start CTA card */}
            <div className="bg-white rounded-2xl border border-[#E0DDD5] p-6 sticky top-20">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-brand-blue mb-1">Free</p>
                <p className="text-xs text-brand-inkLight">Included with EduPro subscription</p>
              </div>

              <Link
                href={`/edupro/courses/${course.slug}/lesson/${course.modules[0].lessons[0].id}`}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
              >
                Start Course <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-3 text-sm text-brand-inkMid">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-inkLight" />
                  <span>{course.weeks} weeks, self-paced</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-inkLight" />
                  <span>{course.total_lessons} lessons across {course.modules.length} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-inkLight" />
                  <span>{totalQuizzes} quiz questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-amber" />
                  <span>CPD certificate on passing ({course.pass_mark}% required)</span>
                </div>
              </div>
            </div>

            {/* Who it's for */}
            <div className="bg-white rounded-2xl border border-[#E0DDD5] p-6">
              <h3 className="font-bold text-brand-ink mb-3">Who This Course Is For</h3>
              <ul className="space-y-2">
                {course.who_its_for.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-inkMid">
                    <span className="text-brand-amber mt-0.5">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pass mark info */}
            <div className="bg-gradient-to-br from-brand-blue to-[#1e4f8a] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-brand-amber" />
                <span className="text-xs font-bold text-brand-amber uppercase tracking-wide">Certificate</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Score {course.pass_mark}% or above across all quizzes to earn your verifiable CPD certificate. Only passing scores appear on certificates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
