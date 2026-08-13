import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import JobApplyButton from './JobApplyButton'
import TeacherBadge from '@/components/TeacherBadge'
import {
  Briefcase, MapPin, Clock, DollarSign, ArrowLeft, CalendarDays,
  CheckCircle, Users, Building2, Globe,
} from 'lucide-react'

const RATE_SUFFIX: Record<string, string> = {
  hourly: '/hr', daily: '/day', weekly: '/wk',
  monthly: '/mo', per_term: '/term', fixed: ' fixed',
}

const JOB_TYPES: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time',
  apprenticeship: 'Apprenticeship', freelance: 'Freelance', internship: 'Internship',
}

interface Props { params: { id: string } }

export default async function JobDetailPage({ params }: Props) {
  const supabase = createClient()

  // Fetch job + employer profile
  let job: any = null
  let currentUserRole: string | null = null
  let alreadyApplied = false
  let teacherProfile: any = null

  try {
    const [{ data: j }, { data: { user } }] = await Promise.all([
      supabase
        .from('job_listings')
        .select('*, employer:profiles(full_name, avatar_url, bio, state)')
        .eq('id', params.id)
        .eq('is_active', true)
        .single(),
      supabase.auth.getUser(),
    ])

    job = j

    if (user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      currentUserRole = prof?.role ?? null

      if (currentUserRole === 'teacher') {
        // Check existing application
        const { data: app } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', params.id)
          .eq('applicant_id', user.id)
          .single()
        alreadyApplied = !!app

        // Load teacher profile for display
        const { data: tp } = await supabase
          .from('teacher_profiles')
          .select('teacher_uid, cert_type, years_of_service, has_badge, badge_type, kyc_status, cert_verified')
          .eq('id', user.id)
          .single()
        teacherProfile = tp
      }
    }
  } catch { /* DB unavailable */ }

  if (!job) notFound()

  return (
    <>
      <Navbar />
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <Link href="/opportunity-hub/jobs"
            className="inline-flex items-center gap-2 text-sm text-brand-blue hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>

          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* ── Main Job Info ──────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blueLight flex items-center justify-center shrink-0">
                    <Briefcase className="w-7 h-7 text-brand-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-brand-ink">{job.title}</h1>
                      <span className="badge badge-blue">{JOB_TYPES[job.job_type] ?? job.job_type}</span>
                      {job.is_featured && <span className="badge badge-amber">Featured</span>}
                    </div>
                    <p className="text-brand-inkMid font-medium">{job.company_name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-brand-inkLight mt-2">
                      {job.location_state && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location_state}</span>
                      )}
                      {job.is_remote && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />Remote</span>}
                      {job.salary_min_ngn && (
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                          <DollarSign className="w-3 h-3" />
                          ₦{Number(job.salary_min_ngn).toLocaleString()}
                          {job.salary_max_ngn ? `–₦${Number(job.salary_max_ngn).toLocaleString()}` : ''}
                          {RATE_SUFFIX[job.rate_type] ?? '/mo'}
                        </span>
                      )}
                      {job.engagement_duration && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <CalendarDays className="w-3 h-3" />{job.engagement_duration}
                        </span>
                      )}
                      {job.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />Deadline: {new Date(job.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />{job.applications ?? 0} applicant{(job.applications ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="font-bold text-brand-ink text-lg mb-4">Job Description</h2>
                <div className="prose prose-sm max-w-none text-brand-inkMid leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Required Skills */}
              {(job.required_skills ?? []).length > 0 && (
                <div className="card p-6">
                  <h2 className="font-bold text-brand-ink text-lg mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {(job.required_skills ?? []).map((s: string) => (
                      <span key={s} className="bg-brand-blueLight text-brand-blue text-sm px-3 py-1.5 rounded-lg font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* About the Employer */}
              {job.employer && (
                <div className="card p-6">
                  <h2 className="font-bold text-brand-ink text-lg mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-blue" /> About the Employer
                  </h2>
                  <div className="flex items-center gap-3">
                    {job.employer.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.employer.avatar_url}
                        alt={job.employer.full_name ?? 'Employer'}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-brand-blueLight flex items-center justify-center text-brand-blue font-bold text-lg shrink-0">
                        {job.employer.full_name?.charAt(0) ?? 'E'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-brand-ink">{job.employer.full_name}</p>
                      {job.employer.state && (
                        <p className="text-sm text-brand-inkLight flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{job.employer.state}
                        </p>
                      )}
                    </div>
                  </div>
                  {job.employer.bio && (
                    <p className="text-sm text-brand-inkMid mt-3 leading-relaxed">{job.employer.bio}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar: Apply Card ─────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Teacher profile snapshot */}
              {currentUserRole === 'teacher' && teacherProfile && (
                <div className="card p-4">
                  <p className="text-xs font-bold text-brand-inkLight uppercase tracking-wide mb-3">Applying as</p>
                  <div className="space-y-2">
                    {teacherProfile.teacher_uid && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-inkMid">Teacher ID</span>
                        <span className="font-mono font-bold text-brand-ink">{teacherProfile.teacher_uid}</span>
                      </div>
                    )}
                    {teacherProfile.cert_type && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-inkMid">Qualification</span>
                        <span className="font-medium text-brand-ink">{teacherProfile.cert_type}</span>
                      </div>
                    )}
                    {teacherProfile.years_of_service > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-inkMid">Experience</span>
                        <span className="font-medium text-brand-ink">{teacherProfile.years_of_service} yr{teacherProfile.years_of_service !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="pt-1">
                      <TeacherBadge
                        hasBadge={teacherProfile.has_badge}
                        kycStatus={teacherProfile.kyc_status}
                        badgeType={teacherProfile.badge_type}
                        certVerified={teacherProfile.cert_verified}
                        size="sm"
                      />
                    </div>
                  </div>
                  {teacherProfile.kyc_status === 'incomplete' && (
                    <Link href="/dashboard/teacher/profile"
                      className="mt-3 block text-xs text-center text-blue-600 underline">
                      Complete your KYC to strengthen your application →
                    </Link>
                  )}
                </div>
              )}

              {/* Apply CTA */}
              <JobApplyButton
                jobId={params.id}
                jobTitle={job.title}
                companyName={job.company_name}
                deadline={job.deadline}
                currentUserRole={currentUserRole}
                alreadyApplied={alreadyApplied}
              />

              {/* Job highlights */}
              <div className="card p-4">
                <h3 className="font-bold text-brand-ink text-sm mb-3">Job Overview</h3>
                <div className="space-y-2.5 text-sm text-brand-inkMid">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
                    <span>Open to <strong>qualified teachers only</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
                    <span>KYC-verified teachers get priority</span>
                  </div>
                  {job.is_remote && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>Remote-friendly position</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>Closes {new Date(job.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
