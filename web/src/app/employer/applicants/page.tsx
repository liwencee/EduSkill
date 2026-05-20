import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ApplicantActions from './ApplicantActions'
import TeacherBadge from '@/components/TeacherBadge'
import {
  ArrowLeft, Users, MapPin, Award, Clock, BadgeCheck,
  FileText, Briefcase, ChevronRight, ExternalLink,
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:     { label: 'Pending',     bg: 'bg-gray-100',   text: 'text-gray-600'  },
  reviewed:    { label: 'Reviewed',    bg: 'bg-blue-100',   text: 'text-blue-700'  },
  shortlisted: { label: 'Shortlisted', bg: 'bg-amber-100',  text: 'text-amber-700' },
  rejected:    { label: 'Rejected',    bg: 'bg-red-100',    text: 'text-red-700'   },
  hired:       { label: 'Hired',       bg: 'bg-green-100',  text: 'text-green-700' },
}

interface Props { searchParams: { job?: string } }

export default async function EmployerApplicantsPage({ searchParams }: Props) {
  const supabase = createClient()

  // Auth check — must be employer
  let employerId: string | null = null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/signin')
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (prof?.role !== 'employer') redirect('/dashboard')
    employerId = user.id
  } catch { redirect('/auth/signin') }

  // Fetch employer's job listings
  let jobs: any[] = []
  let applications: any[] = []
  let activeJobId = searchParams.job ?? null

  try {
    const { data: jData } = await supabase
      .from('job_listings')
      .select('id, title, company_name, is_active, applications')
      .eq('employer_id', employerId!)
      .order('created_at', { ascending: false })
    jobs = jData ?? []

    if (!activeJobId && jobs.length > 0) activeJobId = jobs[0].id

    if (activeJobId) {
      const { data: apps } = await supabase
        .from('job_applications')
        .select(`
          id, cover_note, status, applied_at,
          teacher_uid_snapshot, cert_type_snapshot, years_service_snapshot, badge_snapshot,
          applicant:profiles(
            id, full_name, email, avatar_url, state, bio, phone,
            teacher_profile:teacher_profiles(
              teacher_uid, cert_type, cert_verified, years_of_service, has_badge,
              badge_type, kyc_status, subject_areas, school_name, school_type,
              subject_specialization, portfolio_url, linkedin_url
            )
          )
        `)
        .eq('job_id', activeJobId)
        .order('applied_at', { ascending: false })
      applications = apps ?? []
    }
  } catch { /* DB unavailable */ }

  const activeJob = jobs.find(j => j.id === activeJobId)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#EEF2FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <Link href="/dashboard/employer"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" /> Employer Dashboard
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1E1B4B]">Job Applicants</h1>
            <p className="text-sm text-gray-500 mt-1">Review teacher applications and manage your hiring pipeline.</p>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-indigo-100 p-16 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-[#1E1B4B] mb-2">No job listings yet</p>
              <p className="text-sm text-gray-500 mb-4">Post a job to start receiving teacher applications.</p>
              <Link href="/employer/post-job"
                className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-6">

              {/* ── Job Selector Sidebar ──────────────────────────────────── */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-indigo-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Listings</p>
                  </div>
                  <div className="divide-y divide-indigo-50">
                    {jobs.map(j => (
                      <Link key={j.id}
                        href={`/employer/applicants?job=${j.id}`}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors ${activeJobId === j.id ? 'bg-indigo-50 border-l-2 border-indigo-600' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E1B4B] truncate">{j.title}</p>
                          <p className="text-xs text-gray-400">{j.applications ?? 0} applicant{(j.applications ?? 0) !== 1 ? 's' : ''}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Applicants List ───────────────────────────────────────── */}
              <div className="lg:col-span-3">
                {activeJob && (
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-[#1E1B4B]">{activeJob.title}</h2>
                      <p className="text-sm text-gray-500">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link href={`/opportunity-hub/jobs/${activeJobId}`}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                      View listing <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {applications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-indigo-100 p-12 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-[#1E1B4B] mb-1">No applications yet</p>
                    <p className="text-sm text-gray-400">Teachers will appear here once they apply.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app: any) => {
                      const applicant   = app.applicant
                      const tp          = Array.isArray(applicant?.teacher_profile) ? applicant.teacher_profile[0] : applicant?.teacher_profile
                      const statusCfg   = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending
                      const teacherUid  = tp?.teacher_uid  ?? app.teacher_uid_snapshot
                      const certType    = tp?.cert_type    ?? app.cert_type_snapshot
                      const yearsService = tp?.years_of_service ?? app.years_service_snapshot
                      const hasBadge    = tp?.has_badge    ?? app.badge_snapshot

                      return (
                        <div key={app.id} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">

                            {/* Avatar */}
                            <div className="relative shrink-0">
                              {applicant?.avatar_url ? (
                                <img src={applicant.avatar_url} alt={applicant.full_name}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100" />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-2 border-indigo-100">
                                  {applicant?.full_name?.charAt(0) ?? 'T'}
                                </div>
                              )}
                              {hasBadge && (
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                                  <BadgeCheck className="w-3 h-3 text-white" />
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-[#1E1B4B]">{applicant?.full_name ?? 'Teacher'}</h3>
                                <TeacherBadge
                                  hasBadge={hasBadge}
                                  kycStatus={tp?.kyc_status}
                                  badgeType={tp?.badge_type}
                                  certVerified={tp?.cert_verified}
                                  size="sm"
                                  showLabel={false}
                                />
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                                  {statusCfg.label}
                                </span>
                              </div>

                              {/* Teacher ID + Quick Stats */}
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                                {teacherUid && (
                                  <span className="font-mono font-bold text-indigo-600">{teacherUid}</span>
                                )}
                                {certType && (
                                  <span className="flex items-center gap-1">
                                    <Award className="w-3 h-3" />{certType}
                                  </span>
                                )}
                                {yearsService > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{yearsService} yr{yearsService !== 1 ? 's' : ''} experience
                                  </span>
                                )}
                                {applicant?.state && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />{applicant.state}
                                  </span>
                                )}
                                {tp?.school_name && (
                                  <span>{tp.school_name}</span>
                                )}
                              </div>

                              {/* Subjects */}
                              {(tp?.subject_areas ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {(tp.subject_areas ?? []).slice(0, 4).map((s: string) => (
                                    <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{s}</span>
                                  ))}
                                  {(tp.subject_areas ?? []).length > 4 && (
                                    <span className="text-xs text-gray-400">+{tp.subject_areas.length - 4} more</span>
                                  )}
                                </div>
                              )}

                              {/* Cover Note */}
                              {app.cover_note && (
                                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                                  <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Cover Note
                                  </p>
                                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                                    {app.cover_note}
                                  </p>
                                </div>
                              )}

                              {/* Bio */}
                              {applicant?.bio && (
                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{applicant.bio}</p>
                              )}

                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-xs text-gray-400">
                                  Applied {new Date(app.applied_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                {applicant?.email && (
                                  <a href={`mailto:${applicant.email}`}
                                    className="text-xs text-indigo-600 hover:underline">
                                    {applicant.email}
                                  </a>
                                )}
                                {applicant?.phone && (
                                  <a href={`tel:${applicant.phone}`}
                                    className="text-xs text-indigo-600 hover:underline">
                                    {applicant.phone}
                                  </a>
                                )}
                                {tp?.portfolio_url && (
                                  <a href={tp.portfolio_url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                    Portfolio <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {tp?.linkedin_url && (
                                  <a href={tp.linkedin_url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                    LinkedIn <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Status Actions */}
                            <ApplicantActions
                              applicationId={app.id}
                              currentStatus={app.status}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
