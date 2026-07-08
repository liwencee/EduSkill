import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { BookOpen, Clock, Users, ArrowRight, Star, Award } from 'lucide-react'
import { CPD_COURSES } from '@/lib/static-cpd-courses'
import TeacherOnlyGate from '@/components/TeacherOnlyGate'

export default async function EduProCoursesPage() {
  return (
    <TeacherOnlyGate>
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* 30% blue header */}
      <div className="bg-brand-blue text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-brand-amber" />
            <span className="text-white/70 text-sm font-medium">NERDC &amp; TRCN Aligned</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">CPD Courses for Teachers</h1>
          <p className="text-white/80 max-w-2xl">
            2–6 week self-paced courses aligned to Nigerian education standards.
            Earn verifiable CPD certificates upon completion. Designed for the challenges Nigerian teachers face today.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Course grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {CPD_COURSES.map(c => (
            <Link key={c.slug} href={`/edupro/courses/${c.slug}`}
              className="card-interactive relative bg-white rounded-2xl border border-[#E0DDD5] overflow-hidden group flex flex-col">

              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-brand-blue to-brand-amber" />

              <div className="p-6 flex flex-col flex-1">
                {/* Emoji block */}
                <div className="w-14 h-14 bg-gradient-to-br from-brand-blueLight to-brand-bg rounded-xl flex items-center justify-center text-3xl mb-4 shadow-sm">
                  {c.emoji}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-blue text-xs">{c.category}</span>
                  {c.avg_rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-brand-inkLight">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {c.avg_rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-brand-ink mb-1 group-hover:text-brand-blue transition-colors">{c.title}</h3>
                <p className="text-brand-inkMid text-sm leading-relaxed mb-4 flex-1">{c.description}</p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-inkLight mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.weeks} weeks</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.total_lessons} lessons</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.total_enrolled.toLocaleString()}</span>
                </div>

                <span className="inline-flex items-center justify-center gap-1.5 w-full bg-brand-amber/10 group-hover:bg-brand-amber text-brand-amber group-hover:text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
                  Start Course <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* What you get */}
        <div className="bg-white rounded-2xl border border-[#E0DDD5] p-8 mb-10">
          <h2 className="font-bold text-xl text-brand-ink mb-6 text-center">What Every CPD Course Includes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📚', label: 'Structured Modules', desc: 'Self-paced lessons with practical activities' },
              { icon: '✅', label: 'Knowledge Checks', desc: 'Quizzes after every lesson to reinforce learning' },
              { icon: '🎯', label: 'NERDC Aligned', desc: 'Content mapped to Nigerian curriculum standards' },
              { icon: '🏆', label: 'CPD Certificate', desc: 'Verifiable certificate on passing the final assessment' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-brand-ink text-sm mb-1">{item.label}</p>
                <p className="text-xs text-brand-inkMid">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Lesson Planner promo — 30% blue card */}
        <div className="bg-brand-blue rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-bold text-xl">Try the AI Lesson Planner</h3>
            </div>
            <p className="text-white/80 text-sm">Generate a full NERDC-aligned lesson plan in 10 seconds. Save 3–5 hours every week.</p>
          </div>
          {/* 10% amber CTA */}
          <Link href="/edupro/lesson-planner" className="btn-primary shrink-0 inline-flex items-center gap-2">
            Open Lesson Planner <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
    </TeacherOnlyGate>
  )
}
