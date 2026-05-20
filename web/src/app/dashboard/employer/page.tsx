import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import TeacherBadge from '@/components/TeacherBadge'
import {
  Briefcase, Users, ArrowRight, PlusCircle, TrendingUp,
  CheckCircle, MapPin, ChevronRight, BarChart2, Star, FileText,
  BadgeCheck, Clock, Award, GraduationCap,
} from 'lucide-react'

function calcMatchScore(t: any): number {
  let score = 60
  if (t.kyc_status === 'approved') score += 20
  if (t.cert_verified)             score += 5
  if (t.has_badge)                 score += 5
  if ((t.years_of_service ?? 0) >= 10) score += 8
  else if ((t.years_of_service ?? 0) >= 5) score += 4
  if ((t.subject_areas ?? []).length > 3) score += 2
  return Math.min(score, 99)
}

export default async function EmployerDashboard() {
  const supabase = createClient()

  // Live stats
  let activeListings  = 0
  let totalApplicants = 0
  let hired           = 0
  let topTeachers: any[] = []

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [{ count: jCount }, { count: appCount }, { count: hiredCount }] = await Promise.all([
        supabase.from('job_listings')   .select('*', { count: 'exact', head: true }).eq('employer_id', user.id).eq('is_active', true),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }).in('job_id',
          (await supabase.from('job_listings').select('id').eq('employer_id', user.id).then(r => (r.data ?? []).map((j: any) => j.id)))
        ),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'hired').in('job_id',
          (await supabase.from('job_listings').select('id').eq('employer_id', user.id).then(r => (r.data ?? []).map((j: any) => j.id)))
        ),
      ])
      activeListings  = jCount  ?? 0
      totalApplicants = appCount ?? 0
      hired           = hiredCount ?? 0
    }

    // Top verified teachers (real data)
    const { data: teachers } = await supabase
      .from('teacher_profiles')
      .select(`
        id, teacher_uid, cert_type, cert_verified, years_of_service,
        has_badge, badge_type, kyc_status, subject_areas, subject_specialization,
        profile:profiles!teacher_profiles_id_fkey(
          full_name, avatar_url, state
        )
      `)
      .eq('display_to_employers', true)
      .not('kyc_status', 'eq', 'incomplete')
      .order('has_badge',         { ascending: false })
      .order('years_of_service',  { ascending: false })
      .limit(5)

    topTeachers = (teachers ?? []).filter(Boolean).sort((a: any, b: any) => calcMatchScore(b) - calcMatchScore(a))
  } catch { /* DB unavailable — graceful degradation */ }

  const stats = [
    { label: 'Active Listings',    value: activeListings,  icon: Briefcase,   bg: 'bg-indigo-50', color: 'text-[#4F46E5]' },
    { label: 'Total Applications', value: totalApplicants, icon: Users,       bg: 'bg-orange-50', color: 'text-[#F97316]' },
    { label: 'Hired Candidates',   value: hired,           icon: CheckCircle, bg: 'bg-green-50',  color: 'text-green-600'  },
    { label: 'Saved Profiles',     value: 0,               icon: Star,        bg: 'bg-yellow-50', color: 'text-yellow-600' },
  ]

  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1E1B4B] via-[#4F46E5] to-[#6366F1] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Briefcase className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm font-medium mb-1">OpportunityHub — Employer Portal 🏢</p>
            <h1 className="text-2xl font-bold mb-1">Employer Dashboard</h1>
            <p className="text-white/75 text-sm">Connect with Nigeria&apos;s next generation of skilled, certified teachers.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/employer/post-job"
                className="inline-flex items-center gap-2 bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
                <PlusCircle className="w-4 h-4" /> Post a Job
              </Link>
              <Link href="/opportunity-hub/candidates"
                className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                <GraduationCap className="w-4 h-4" /> Browse Teachers
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
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

            {/* Active Job Listings */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">Active Job Listings</h2>
                <Link href="/employer/post-job"
                  className="text-sm font-bold text-[#4F46E5] hover:underline flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" /> Post New
                </Link>
              </div>
              {activeListings === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-8 h-8 text-[#4F46E5] opacity-50" />
                  </div>
                  <p className="font-semibold text-[#1E1B4B] mb-1">No listings yet</p>
                  <p className="text-sm text-gray-500 mb-4">Post your first job and find certified teachers</p>
                  <Link href="/employer/post-job"
                    className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Post a Job — Free
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1E1B4B]">{activeListings} active listing{activeListings !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500">{totalApplicants} total application{totalApplicants !== 1 ? 's' : ''} received</p>
                    </div>
                  </div>
                  <Link href="/employer/applicants"
                    className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    View applicants <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Top Certified Teachers — REAL DATA */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">Best-Match Teachers</h2>
                <Link href="/opportunity-hub/candidates"
                  className="text-sm text-[#4F46E5] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {topTeachers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="w-7 h-7 text-indigo-400" />
                  </div>
                  <p className="font-semibold text-[#1E1B4B] mb-1">No verified teachers yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Teachers completing KYC on EduSkill will appear here.
                  </p>
                  <Link href="/opportunity-hub/candidates"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                    Browse all candidates <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {topTeachers.map((t: any) => {
                    const profile = Array.isArray(t.profile) ? t.profile[0] : t.profile
                    if (!profile) return null
                    const score    = calcMatchScore(t)
                    const initials = profile.full_name?.charAt(0)?.toUpperCase() ?? 'T'

                    return (
                      <Link key={t.id} href={`/opportunity-hub/candidates/${t.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-indigo-100" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white font-bold text-sm border-2 border-indigo-100">
                              {initials}
                            </div>
                          )}
                          {(t.has_badge || t.kyc_status === 'approved') && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                              <BadgeCheck className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1E1B4B] text-sm group-hover:text-indigo-700 transition-colors">
                            {profile.full_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            {t.cert_type && (
                              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                <Award className="w-3 h-3 text-indigo-400" />{t.cert_type}
                              </span>
                            )}
                            {(t.years_of_service ?? 0) > 0 && (
                              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-orange-400" />{t.years_of_service}yr
                              </span>
                            )}
                            {profile.state && (
                              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />{profile.state}
                              </span>
                            )}
                          </div>
                          {(t.subject_areas ?? []).length > 0 && (
                            <p className="text-xs text-indigo-500 mt-0.5 truncate">
                              {(t.subject_areas ?? []).slice(0, 2).join(' · ')}
                              {(t.subject_areas ?? []).length > 2 ? ` +${t.subject_areas.length - 2}` : ''}
                            </p>
                          )}
                        </div>

                        {/* Match + badge */}
                        <div className="text-right shrink-0 space-y-1">
                          <TeacherBadge
                            hasBadge={t.has_badge}
                            kycStatus={t.kyc_status}
                            badgeType={t.badge_type}
                            certVerified={t.cert_verified}
                            size="sm"
                            showLabel={false}
                          />
                          <p className="text-xs font-bold text-[#4F46E5]">{score}% match</p>
                        </div>
                      </Link>
                    )
                  })}

                  <Link href="/opportunity-hub/candidates"
                    className="flex items-center justify-center gap-2 mt-2 py-2.5 text-sm font-bold text-[#4F46E5] border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
                    See all verified teachers <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1E1B4B] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/employer/post-job',             icon: PlusCircle,    label: 'Post a Job',          bg: 'bg-orange-50', color: 'text-[#F97316]' },
                  { href: '/employer/applicants',           icon: FileText,      label: 'View Applicants',     bg: 'bg-blue-50',   color: 'text-blue-600'  },
                  { href: '/opportunity-hub/candidates',    icon: GraduationCap, label: 'Browse Teachers',     bg: 'bg-indigo-50', color: 'text-[#4F46E5]' },
                  { href: '/opportunity-hub/jobs',          icon: Briefcase,     label: 'Manage Listings',     bg: 'bg-green-50',  color: 'text-green-600'  },
                  { href: '/opportunity-hub',               icon: BarChart2,     label: 'Hiring Analytics',    bg: 'bg-purple-50', color: 'text-purple-600' },
                  { href: '/contact',                       icon: TrendingUp,    label: 'Partner with Us',     bg: 'bg-yellow-50', color: 'text-yellow-600' },
                ].map(l => (
                  <Link key={l.href + l.label} href={l.href}
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

            {/* Platform Stats */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1E1B4B] mb-4">Platform Talent Pool</h2>
              <div className="space-y-3">
                {[
                  { label: 'Certified Teachers',  value: '8,400+',    color: 'text-[#4F46E5]' },
                  { label: 'Qualifications',       value: '9 types',   color: 'text-[#F97316]' },
                  { label: 'Active Job Seekers',   value: '3,200+',    color: 'text-green-600' },
                  { label: 'Avg. Hire Time',       value: '< 2 weeks', color: 'text-purple-600' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.label}</span>
                    <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1E1B4B] to-[#4F46E5] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-orange-300" />
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wide">Employer Tip</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Filter by <span className="text-orange-300 font-bold">KYC Verified</span> teachers to see candidates whose NIN and certificates have been confirmed. Hire with confidence. 🎓
              </p>
              <Link href="/opportunity-hub/candidates?verified=1"
                className="mt-3 block text-xs font-bold text-center bg-orange-400/20 hover:bg-orange-400/30 text-orange-200 px-3 py-1.5 rounded-lg transition-colors">
                → Browse KYC-Verified Teachers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
