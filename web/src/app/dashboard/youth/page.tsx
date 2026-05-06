import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
  BookOpen, Award, Briefcase, ArrowRight, TrendingUp,
  Flame, Star, Target, Clock, Download, ChevronRight
} from 'lucide-react'

export default async function YouthDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard/youth')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(title, slug, duration_weeks, category)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })
    .limit(4)

  const { data: certs } = await supabase
    .from('certificates')
    .select('*, course:courses(title)')
    .eq('user_id', user.id)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Learner'

  const FEATURED_COURSES = [
    { title: 'Digital Marketing Mastery', category: 'Business', weeks: 4, students: '2.4K', free: false, slug: 'digital-marketing-mastery', color: 'bg-orange-100', text: 'text-orange-700' },
    { title: 'Coding Basics for Beginners', category: 'Tech', weeks: 6, students: '1.8K', free: false, slug: 'coding-basics', color: 'bg-indigo-100', text: 'text-indigo-700' },
    { title: 'Agribusiness Fundamentals', category: 'Agriculture', weeks: 4, students: '1.2K', free: true, slug: 'agribusiness-fundamentals', color: 'bg-green-100', text: 'text-green-700' },
  ]

  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full opacity-10">
            <div className="w-full h-full bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-2xl font-bold mb-1">{firstName}</h1>
            <p className="text-white/75 text-sm">Keep building. Your next opportunity is one course away.</p>
            <Link href="/skillup/courses"
              className="inline-flex items-center gap-2 mt-4 bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Courses Enrolled',    value: enrollments?.length ?? 0,  icon: BookOpen,   bg: 'bg-indigo-50',  color: 'text-[#4F46E5]' },
            { label: 'Certificates Earned', value: certs?.length ?? 0,         icon: Award,      bg: 'bg-orange-50',  color: 'text-[#F97316]' },
            { label: 'Day Streak',          value: profile?.streak_days ?? 0,  icon: Flame,      bg: 'bg-red-50',     color: 'text-red-500'   },
            { label: 'Skills Unlocked',     value: certs?.length ?? 0,         icon: Star,       bg: 'bg-yellow-50',  color: 'text-yellow-600'},
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
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">Continue Learning</h2>
                <Link href="/skillup" className="text-sm text-[#4F46E5] hover:underline flex items-center gap-1">
                  All courses <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-3">
                  {enrollments.map((e: any) => (
                    <Link key={e.id} href={`/skillup/courses/${e.course?.slug ?? ''}`}
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
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-[#4F46E5] opacity-50" />
                  </div>
                  <p className="font-semibold text-[#1E1B4B] mb-1">No courses yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start with a free course — no credit card needed</p>
                  <Link href="/skillup/courses"
                    className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                    Browse Free Courses <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended Courses */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">Recommended for You</h2>
                <Link href="/skillup/courses" className="text-sm text-[#4F46E5] hover:underline">See all</Link>
              </div>
              <div className="space-y-3">
                {FEATURED_COURSES.map(c => (
                  <Link key={c.slug} href={`/skillup/courses/${c.slug}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                      <Target className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1E1B4B] text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.weeks} weeks · {c.students} students</p>
                    </div>
                    {c.free
                      ? <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">FREE</span>
                      : <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.color} ${c.text}`}>{c.category}</span>
                    }
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1E1B4B] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/skillup/courses',         icon: BookOpen,    label: 'Browse Courses',     bg: 'bg-indigo-50',  color: 'text-[#4F46E5]' },
                  { href: '/opportunity-hub/jobs',    icon: Briefcase,   label: 'Find Jobs',          bg: 'bg-orange-50',  color: 'text-[#F97316]' },
                  { href: '/dashboard/certificates',  icon: Award,       label: 'My Certificates',    bg: 'bg-yellow-50',  color: 'text-yellow-600' },
                  { href: '/opportunity-hub',         icon: TrendingUp,  label: 'Opportunity Hub',    bg: 'bg-green-50',   color: 'text-green-600'  },
                  { href: '/skillup',                 icon: Download,    label: 'Offline Content',    bg: 'bg-purple-50',  color: 'text-purple-600' },
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

            {/* Certificates */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B]">My Certificates</h2>
                <Link href="/dashboard/certificates" className="text-xs text-[#4F46E5] hover:underline">View all</Link>
              </div>
              {certs && certs.length > 0 ? (
                <div className="space-y-2">
                  {certs.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50">
                      <Award className="w-8 h-8 text-[#F97316] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E1B4B] truncate">{c.course?.title}</p>
                        <p className="text-xs text-gray-500">Issued {new Date(c.issued_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Complete a course to earn your first certificate</p>
                </div>
              )}
            </div>

            {/* Learning Tip */}
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-300" />
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wide">Daily Tip</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Spend just 30 minutes a day on SkillBridge and complete a course in 4 weeks. Small steps, big results! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
