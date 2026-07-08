import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
  BookOpen, Award, Users, ArrowRight, Zap, FileText,
  TrendingUp, MessageSquare, ChevronRight, Lightbulb, Star,
  ClipboardList, ShieldCheck, Briefcase,
} from 'lucide-react'
import { CPD_COURSES } from '@/lib/static-cpd-courses'

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-[#EBF4FF]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1E4F8A] to-[#378ADD] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm font-medium mb-1">EduPro Teacher Hub 🎓</p>
            <h1 className="text-2xl font-bold mb-1">Teacher Dashboard</h1>
            <p className="text-white/75 text-sm">Your students are waiting — what will you teach today?</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/edupro/lesson-planner"
                className="inline-flex items-center gap-2 bg-[#F37321] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
                <Zap className="w-4 h-4" /> AI Lesson Planner
              </Link>
              <Link href="/edupro/result-generator"
                className="inline-flex items-center gap-2 bg-amber-400 text-[#1E4F8A] text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-300 transition-colors">
                <ClipboardList className="w-4 h-4" /> Generate Result
              </Link>
              <Link href="/edupro/courses"
                className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                <BookOpen className="w-4 h-4" /> Browse CPD Courses
              </Link>
              <Link href="/edupro/community"
                className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                <Users className="w-4 h-4" /> Teacher Community
              </Link>
              <Link href="/edupro/certificates"
                className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                <Award className="w-4 h-4" /> CPD Certificates
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CPD Courses',         value: 0, icon: BookOpen,  bg: 'bg-blue-50',  color: 'text-[#378ADD]' },
            { label: 'Certificates Earned', value: 0, icon: Award,     bg: 'bg-orange-50',  color: 'text-[#F37321]' },
            { label: 'Lesson Plans',        value: 0, icon: FileText,  bg: 'bg-purple-50',  color: 'text-purple-600' },
            { label: 'Students Reached',    value: 0, icon: Users,     bg: 'bg-green-50',   color: 'text-green-600'  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-blue-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E4F8A]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Lesson Plans placeholder */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E4F8A] text-lg">My Lesson Plans</h2>
                <Link href="/edupro/lesson-planner"
                  className="text-sm font-bold text-[#378ADD] hover:underline flex items-center gap-1">
                  + New Plan
                </Link>
              </div>
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lightbulb className="w-8 h-8 text-purple-400" />
                </div>
                <p className="font-semibold text-[#1E4F8A] mb-1">No lesson plans yet</p>
                <p className="text-sm text-gray-500 mb-4">Create your first AI-powered lesson plan in minutes</p>
                <Link href="/edupro/lesson-planner"
                  className="inline-flex items-center gap-2 bg-[#378ADD] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                  <Zap className="w-4 h-4" /> Generate with AI
                </Link>
              </div>
            </div>

            {/* Student Results */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E4F8A] text-lg">Student Results</h2>
                <Link href="/edupro/result-generator"
                  className="text-sm font-bold text-[#F37321] hover:underline flex items-center gap-1">
                  + Generate New
                </Link>
              </div>
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-8 h-8 text-amber-400" />
                </div>
                <p className="font-semibold text-[#1E4F8A] mb-1">No results generated yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Enter student scores and get ranked results, letter grades,
                  and AI career recommendations in seconds.
                </p>
                <Link href="/edupro/result-generator"
                  className="inline-flex items-center gap-2 bg-amber-400 text-[#1E4F8A] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-amber-300 transition-colors">
                  <ClipboardList className="w-4 h-4" /> Generate Result Sheet
                </Link>
              </div>
            </div>

            {/* CPD Courses */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E4F8A] text-lg">CPD Courses in Progress</h2>
                <Link href="/edupro/courses" className="text-sm text-[#378ADD] hover:underline flex items-center gap-1">
                  All courses <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {CPD_COURSES.slice(0, 3).map(c => (
                  <Link key={c.slug} href={`/edupro/courses/${c.slug}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-2xl">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1E4F8A] text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.weeks} weeks · {c.total_enrolled.toLocaleString()} enrolled</p>
                    </div>
                    <span className="text-xs font-bold text-[#378ADD] bg-blue-50 px-2 py-0.5 rounded-full">Start</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1E4F8A] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/dashboard/teacher/profile',  icon: ShieldCheck,   label: 'My Profile & KYC',     bg: 'bg-blue-50',  color: 'text-[#378ADD]' },
                  { href: '/opportunity-hub/jobs',      icon: Briefcase,     label: 'Browse & Apply Jobs',  bg: 'bg-blue-50',    color: 'text-blue-600'  },
                  { href: '/edupro/lesson-planner',   icon: Zap,           label: 'AI Lesson Planner',    bg: 'bg-orange-50',  color: 'text-[#F37321]' },
                  { href: '/edupro/result-generator', icon: ClipboardList, label: 'Generate Result Sheet', bg: 'bg-amber-50',   color: 'text-amber-500' },
                  { href: '/edupro/courses',           icon: BookOpen,      label: 'Browse CPD Courses',   bg: 'bg-purple-50',  color: 'text-purple-600' },
                  { href: '/edupro/community',         icon: MessageSquare, label: 'Teacher Community',    bg: 'bg-pink-50',    color: 'text-pink-600'  },
                  { href: '/dashboard/certificates',   icon: Award,         label: 'My Certificates',      bg: 'bg-yellow-50',  color: 'text-yellow-600' },
                  { href: '/edupro',                   icon: TrendingUp,    label: 'Teaching Materials',   bg: 'bg-green-50',   color: 'text-green-600'  },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${l.bg}`}>
                      <l.icon className={`w-4 h-4 ${l.color}`} />
                    </div>
                    <span className="text-sm font-medium text-[#1E4F8A]">{l.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E4F8A]">CPD Certificates</h2>
                <Link href="/dashboard/certificates" className="text-xs text-[#378ADD] hover:underline">View all</Link>
              </div>
              <div className="text-center py-4">
                <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Complete a CPD course to earn your certificate</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1E4F8A] to-[#378ADD] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-orange-300" />
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wide">Pro Tip</span>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-3">
                Use the <span className="text-orange-300 font-bold">AI Lesson Planner</span> to generate NERDC-aligned plans in 10 seconds. Then use <span className="text-amber-300 font-bold">Generate Result</span> to rank your students and get AI career guidance — all in one place. ⚡
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/edupro/lesson-planner"
                  className="text-xs font-bold text-center bg-orange-400/20 hover:bg-orange-400/30 text-orange-200 px-3 py-1.5 rounded-lg transition-colors">
                  → Open Lesson Planner
                </Link>
                <Link href="/edupro/result-generator"
                  className="text-xs font-bold text-center bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                  → Generate Result Sheet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
