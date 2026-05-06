import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
  BookOpen, Award, Users, ArrowRight, Zap, FileText,
  TrendingUp, MessageSquare, ChevronRight, Lightbulb, Star
} from 'lucide-react'

export default async function TeacherDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard/teacher')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(title, slug, duration_weeks)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })
    .limit(4)

  const { data: certs } = await supabase
    .from('certificates')
    .select('*, course:courses(title)')
    .eq('user_id', user.id)

  const { data: lessonPlans } = await supabase
    .from('lesson_plans')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Teacher'

  const CPD_COURSES = [
    { title: 'Digital Classroom Essentials', category: 'Digital Teaching', weeks: 2, enrolled: '1.2K', slug: 'digital-classroom' },
    { title: 'AI Tools for Teachers', category: 'Technology', weeks: 3, enrolled: '890', slug: 'ai-tools-teachers' },
    { title: 'Inclusive Education Nigeria', category: 'Pedagogy', weeks: 4, enrolled: '2.1K', slug: 'inclusive-education' },
  ]

  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1E1B4B] to-[#4F46E5] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm font-medium mb-1">EduPro Teacher Hub 🎓</p>
            <h1 className="text-2xl font-bold mb-1">Good day, {firstName}!</h1>
            <p className="text-white/75 text-sm">Your students are waiting — what will you teach today?</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/edupro/lesson-planner"
                className="inline-flex items-center gap-2 bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
                <Zap className="w-4 h-4" /> AI Lesson Planner
              </Link>
              <Link href="/edupro/courses"
                className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                Browse CPD Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CPD Courses',         value: enrollments?.length ?? 0, icon: BookOpen,      bg: 'bg-indigo-50',  color: 'text-[#4F46E5]' },
            { label: 'Certificates Earned', value: certs?.length ?? 0,        icon: Award,         bg: 'bg-orange-50',  color: 'text-[#F97316]' },
            { label: 'Lesson Plans',        value: lessonPlans?.length ?? 0,  icon: FileText,      bg: 'bg-purple-50',  color: 'text-purple-600' },
            { label: 'Students Reached',    value: (lessonPlans?.length ?? 0) * 35, icon: Users, bg: 'bg-green-50',   color: 'text-green-600'  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-indigo-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E1B4B]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Lesson Plans */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">My Lesson Plans</h2>
                <Link href="/edupro/lesson-planner"
                  className="text-sm font-bold text-[#4F46E5] hover:underline flex items-center gap-1">
                  + New Plan
                </Link>
              </div>
              {lessonPlans && lessonPlans.length > 0 ? (
                <div className="space-y-3">
                  {lessonPlans.map((lp: any) => (
                    <div key={lp.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1E1B4B] text-sm truncate">{lp.title}</p>
                        <p className="text-xs text-gray-500">{lp.subject} · Grade {lp.grade_level}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lp.is_public ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {lp.is_public ? 'Public' : 'Draft'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="font-semibold text-[#1E1B4B] mb-1">No lesson plans yet</p>
                  <p className="text-sm text-gray-500 mb-4">Create your first AI-powered lesson plan in minutes</p>
                  <Link href="/edupro/lesson-planner"
                    className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                    <Zap className="w-4 h-4" /> Generate with AI
                  </Link>
                </div>
              )}
            </div>

            {/* CPD Courses in Progress */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">CPD Courses in Progress</h2>
                <Link href="/edupro/courses" className="text-sm text-[#4F46E5] hover:underline flex items-center gap-1">
                  All courses <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-3">
                  {enrollments.map((e: any) => (
                    <Link key={e.id} href={`/edupro/courses`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-[#4F46E5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1E1B4B] text-sm truncate">{e.course?.title}</p>
                        <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#4F46E5] h-1.5 rounded-full" style={{ width: `${e.progress_pct ?? 0}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{e.progress_pct ?? 0}% complete</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {CPD_COURSES.map(c => (
                    <Link key={c.slug} href="/edupro/courses"
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-indigo-100">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-[#4F46E5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1E1B4B] text-sm">{c.title}</p>
                        <p className="text-xs text-gray-500">{c.weeks} weeks · {c.enrolled} enrolled</p>
                      </div>
                      <span className="text-xs font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-full">Enrol</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1E1B4B] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/edupro/lesson-planner', icon: Zap,          label: 'AI Lesson Planner',   bg: 'bg-orange-50',  color: 'text-[#F97316]' },
                  { href: '/edupro/courses',         icon: BookOpen,     label: 'Browse CPD Courses',  bg: 'bg-indigo-50',  color: 'text-[#4F46E5]' },
                  { href: '/edupro/community',       icon: MessageSquare,label: 'Teacher Community',   bg: 'bg-purple-50',  color: 'text-purple-600' },
                  { href: '/dashboard/certificates', icon: Award,        label: 'My Certificates',     bg: 'bg-yellow-50',  color: 'text-yellow-600' },
                  { href: '/edupro',                 icon: TrendingUp,   label: 'Teaching Materials',  bg: 'bg-green-50',   color: 'text-green-600'  },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${l.bg}`}>
                      <l.icon className={`w-4 h-4 ${l.color}`} />
                    </div>
                    <span className="text-sm font-medium text-[#1E1B4B]">{l.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* CPD Certificates */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B]">CPD Certificates</h2>
                <Link href="/dashboard/certificates" className="text-xs text-[#4F46E5] hover:underline">View all</Link>
              </div>
              {certs && certs.length > 0 ? (
                <div className="space-y-2">
                  {certs.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50">
                      <Award className="w-8 h-8 text-[#4F46E5] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E1B4B] truncate">{c.course?.title}</p>
                        <p className="text-xs text-gray-500">Issued {new Date(c.issued_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Complete a CPD course to earn your certificate</p>
                </div>
              )}
            </div>

            {/* Tip */}
            <div className="bg-gradient-to-br from-[#1E1B4B] to-[#4F46E5] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-orange-300" />
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wide">Pro Tip</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Use the AI Lesson Planner to generate NERDC-aligned lesson plans. Save 3–5 hours of prep time every week! ⚡
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
