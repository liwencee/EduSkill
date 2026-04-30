import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { BookOpen, TrendingUp, Briefcase, Award, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard')

  const { data: profile }     = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(title, slug, duration_weeks)')
    .eq('user_id', user.id).order('enrolled_at', { ascending: false }).limit(4)
  const { data: certs } = await supabase
    .from('certificates')
    .select('*, course:courses(title)')
    .eq('user_id', user.id)

  const role = profile?.role ?? 'youth'

  type QuickLink = { href: string; icon: React.ElementType; label: string; iconBg: string; iconColor: string }

  const QUICK_LINKS: Record<string, QuickLink[]> = {
    youth: [
      { href: '/skillup/courses',        icon: BookOpen,   label: 'Browse Courses',    iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue'  },
      { href: '/opportunity-hub/jobs',   icon: Briefcase,  label: 'Find Jobs',         iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue'  },
      { href: '/dashboard/certificates', icon: Award,      label: 'My Certificates',   iconBg: 'bg-amber-50',        iconColor: 'text-brand-amber' },
    ],
    teacher: [
      { href: '/edupro/courses',         icon: BookOpen,   label: 'My CPD Courses',    iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue'  },
      { href: '/edupro/lesson-planner',  icon: TrendingUp, label: 'AI Lesson Planner', iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue'  },
      { href: '/edupro/community',       icon: Briefcase,  label: 'Teacher Community', iconBg: 'bg-amber-50',        iconColor: 'text-brand-amber' },
    ],
    employer: [
      { href: '/employer/dashboard',     icon: Briefcase,  label: 'Manage Listings',   iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue'  },
      { href: '/employer/post-job',      icon: TrendingUp, label: 'Post a Job',        iconBg: 'bg-amber-50',        iconColor: 'text-brand-amber' },
      { href: '/opportunity-hub',        icon: Award,      label: 'Browse Candidates', iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue'  },
    ],
  }

  const links = QUICK_LINKS[role] ?? QUICK_LINKS.youth

  return (
    /* 60% cream page */
    <div className="bg-brand-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome — 30% blue banner */}
        <div className="bg-brand-blue text-white rounded-2xl p-6 mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {role === 'teacher' && 'Your students are waiting — what will you teach today?'}
            {role === 'youth'   && 'Keep building. Your next opportunity is one course away.'}
            {role === 'employer'&& 'Connect with Nigeria\'s next generation of skilled workers.'}
          </p>
        </div>

        {/* Stats row — white cards on cream bg */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Courses Enrolled',   value: enrollments?.length ?? 0, icon: BookOpen,   iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue' },
            { label: 'Certificates Earned',value: certs?.length ?? 0,       icon: Award,      iconBg: 'bg-amber-50',        iconColor: 'text-brand-amber' },
            { label: 'Days Streak',        value: 7,                         icon: TrendingUp, iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue' },
            { label: 'Profile Views',      value: 42,                        icon: Clock,      iconBg: 'bg-amber-50',        iconColor: 'text-brand-amber' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E0DDD5] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-ink">{s.value}</p>
                <p className="text-xs text-brand-inkMid">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-brand-ink">Continue Learning</h2>
              <Link href="/skillup" className="text-sm text-brand-blue hover:underline flex items-center gap-1">
                All courses <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {enrollments && enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((e: any) => (
                  <Link key={e.id} href={`/skillup/courses/${e.course?.slug ?? ''}`}
                    className="bg-white rounded-2xl border border-[#E0DDD5] p-4 flex items-center gap-4 hover:border-brand-blue/30 hover:shadow-sm transition-all">
                    <div className="w-12 h-12 rounded-xl bg-brand-blueLight flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-ink text-sm truncate">{e.course?.title}</p>
                      {/* 10% amber progress bar */}
                      <div className="mt-1.5 w-full bg-brand-bg rounded-full h-1.5">
                        <div className="bg-brand-amber h-1.5 rounded-full transition-all" style={{ width: `${e.progress_pct}%` }} />
                      </div>
                      <p className="text-xs text-brand-inkLight mt-1">{e.progress_pct}% complete</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-inkLight shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E0DDD5] p-10 text-center">
                <BookOpen className="w-12 h-12 text-brand-inkLight opacity-30 mx-auto mb-3" />
                <p className="font-medium text-brand-inkMid mb-2">No courses yet</p>
                <p className="text-sm text-brand-inkLight mb-4">Browse our library of practical skills courses</p>
                <Link href="/skillup/courses" className="btn-primary inline-block text-sm py-2 px-4">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>

          {/* Quick links + Certificates */}
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-brand-ink mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {links.map((l: any) => (
                  <Link key={l.href} href={l.href}
                    className="bg-white rounded-xl border border-[#E0DDD5] p-3 flex items-center gap-3 hover:border-brand-blue/30 hover:shadow-sm transition-all">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${l.iconBg}`}>
                      <l.icon className={`w-5 h-5 ${l.iconColor}`} />
                    </div>
                    <span className="font-medium text-sm text-brand-ink">{l.label}</span>
                    <ArrowRight className="w-4 h-4 text-brand-inkLight ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {certs && certs.length > 0 && (
              <div>
                <h2 className="font-bold text-brand-ink mb-3">Recent Certificates</h2>
                <div className="space-y-2">
                  {certs.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="bg-white rounded-xl border border-[#E0DDD5] p-3 flex items-center gap-3">
                      {/* 10% amber icon */}
                      <Award className="w-8 h-8 text-brand-amber shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-ink truncate">{c.course?.title}</p>
                        <p className="text-xs text-brand-inkLight">Issued {new Date(c.issued_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
