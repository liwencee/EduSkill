import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import TeacherBadge from '@/components/TeacherBadge'
import {
  ArrowLeft, MapPin, Award, Clock, BookOpen, BadgeCheck,
  Mail, Phone, Globe, Linkedin, GraduationCap, Briefcase,
  Shield, Star, Users, CheckCircle,
} from 'lucide-react'

interface Props { params: { id: string } }

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  public: 'Public School', private: 'Private School',
  federal: 'Federal Government School', unity: 'Unity School',
  tertiary: 'Tertiary Institution', ngo: 'NGO / Community School',
}

const KYC_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  approved:   { label: 'KYC Verified',   color: 'text-green-700', bg: 'bg-green-100'  },
  pending:    { label: 'Under Review',   color: 'text-amber-700', bg: 'bg-amber-100'  },
  incomplete: { label: 'Profile Active', color: 'text-blue-700',  bg: 'bg-blue-100'   },
  rejected:   { label: 'Pending Docs',   color: 'text-gray-600',  bg: 'bg-gray-100'   },
}

export default async function TeacherPublicProfilePage({ params }: Props) {
  const supabase = createClient()

  let teacher: any = null
  let profile: any  = null

  try {
    const { data } = await supabase
      .from('teacher_profiles')
      .select(`
        id, teacher_uid, cert_type, cert_verified, years_of_service,
        has_badge, badge_type, kyc_status, subject_areas, school_name,
        school_type, subject_specialization, portfolio_url, linkedin_url,
        cpd_points, total_courses_created, total_students,
        profile:profiles!teacher_profiles_id_fkey(
          id, full_name, avatar_url, state, bio, email, phone
        )
      `)
      .eq('id', params.id)
      .eq('display_to_employers', true)
      .single()

    teacher = data
    profile = Array.isArray(data?.profile) ? data.profile[0] : data?.profile
  } catch { /* DB unavailable */ }

  if (!teacher || !profile) notFound()

  let cpdCertificates: { course_title: string; overall_score: number; issued_at: string }[] = []
  try {
    const { data } = await supabase
      .from('cpd_certificates')
      .select('course_title, overall_score, issued_at')
      .eq('user_id', params.id)
      .order('issued_at', { ascending: false })
    cpdCertificates = data ?? []
  } catch { /* DB unavailable — section just won't show */ }

  const kycCfg   = KYC_STATUS_LABELS[teacher.kyc_status ?? 'incomplete']
  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'T'

  const stats = [
    { label: 'Years of Service',  value: (teacher.years_of_service ?? 0) > 0 ? `${teacher.years_of_service} yr${teacher.years_of_service !== 1 ? 's' : ''}` : '—', icon: Clock    },
    { label: 'CPD Points',        value: teacher.cpd_points ?? 0,                    icon: Star      },
    { label: 'Courses Created',   value: teacher.total_courses_created ?? 0,          icon: BookOpen  },
    { label: 'Students Reached',  value: (teacher.total_students ?? 0).toLocaleString(), icon: Users },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#EBF4FF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <Link href="/opportunity-hub/candidates"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Candidates
          </Link>

          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* ── Left: Profile Card ────────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Main profile card */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {/* Cover strip */}
                <div className="h-20 bg-gradient-to-r from-[#1E4F8A] to-[#378ADD]" />

                <div className="px-5 pb-5">
                  {/* Avatar — overlapping cover */}
                  <div className="relative -mt-10 mb-3">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#378ADD] to-[#378ADD] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
                        {initials}
                      </div>
                    )}
                    {teacher.has_badge && (
                      <span className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                        <BadgeCheck className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg font-bold text-[#1E4F8A] leading-tight">{profile.full_name}</h1>

                  {teacher.teacher_uid && (
                    <p className="text-xs font-mono text-blue-500 mt-0.5 mb-2">{teacher.teacher_uid}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <TeacherBadge
                      hasBadge={teacher.has_badge}
                      kycStatus={teacher.kyc_status}
                      badgeType={teacher.badge_type}
                      certVerified={teacher.cert_verified}
                      size="sm"
                    />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kycCfg.bg} ${kycCfg.color}`}>
                      {kycCfg.label}
                    </span>
                  </div>

                  {profile.state && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />{profile.state}
                    </p>
                  )}

                  {/* Contact buttons */}
                  <div className="space-y-2">
                    {profile.email && (
                      <a href={`mailto:${profile.email}`}
                        className="flex items-center gap-2 w-full text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2.5 rounded-xl transition-colors">
                        <Mail className="w-4 h-4" /> {profile.email}
                      </a>
                    )}
                    {profile.phone && (
                      <a href={`tel:${profile.phone}`}
                        className="flex items-center gap-2 w-full text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2.5 rounded-xl transition-colors">
                        <Phone className="w-4 h-4" /> {profile.phone}
                      </a>
                    )}
                    {teacher.portfolio_url && (
                      <a href={teacher.portfolio_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-2.5 rounded-xl transition-colors">
                        <Globe className="w-4 h-4" /> Portfolio / Website
                      </a>
                    )}
                    {teacher.linkedin_url && (
                      <a href={teacher.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2.5 rounded-xl transition-colors">
                        <Linkedin className="w-4 h-4" /> LinkedIn Profile
                      </a>
                    )}
                  </div>

                  {/* Hire CTA */}
                  <Link href="/employer/post-job"
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-[#F37321] hover:bg-orange-600 text-white font-bold text-sm px-4 py-3 rounded-xl transition-colors">
                    <Briefcase className="w-4 h-4" /> Post a Job for this Teacher
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map(s => (
                    <div key={s.label} className="text-center p-2 bg-blue-50 rounded-xl">
                      <p className="text-lg font-bold text-[#1E4F8A]">{s.value}</p>
                      <p className="text-xs text-gray-500 leading-tight mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Details ────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* About */}
              {profile.bio && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1E4F8A] mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" /> About
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Qualifications & Experience */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1E4F8A] mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" /> Qualifications & Experience
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {teacher.cert_type && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                      <Award className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Teaching Certificate</p>
                        <p className="font-bold text-[#1E4F8A] text-sm">{teacher.cert_type}</p>
                        {teacher.cert_verified && (
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle className="w-3 h-3" /> Verified by Skillora
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {(teacher.years_of_service ?? 0) > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                      <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Years of Service</p>
                        <p className="font-bold text-[#1E4F8A] text-sm">
                          {teacher.years_of_service} year{teacher.years_of_service !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  {teacher.school_name && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                      <BookOpen className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Current / Recent School</p>
                        <p className="font-bold text-[#1E4F8A] text-sm">{teacher.school_name}</p>
                        {teacher.school_type && (
                          <p className="text-xs text-gray-500">{SCHOOL_TYPE_LABELS[teacher.school_type] ?? teacher.school_type}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {teacher.subject_specialization && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                      <Star className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Specialization</p>
                        <p className="font-bold text-[#1E4F8A] text-sm">{teacher.subject_specialization}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subjects */}
              {(teacher.subject_areas ?? []).length > 0 && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1E4F8A] mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" /> Subjects Taught
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(teacher.subject_areas ?? []).map((s: string) => (
                      <span key={s}
                        className="text-sm bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CPD Certifications */}
              {cpdCertificates.length > 0 && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1E4F8A] mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-500" /> CPD Certifications
                  </h2>
                  <div className="space-y-2">
                    {cpdCertificates.map(c => (
                      <div key={c.course_title} className="flex items-center gap-3 p-3 bg-green-50/60 border border-green-100 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1E4F8A] truncate">{c.course_title}</p>
                          <p className="text-xs text-gray-500">
                            Verified {new Date(c.issued_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full shrink-0">
                          {c.overall_score}% pass
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Summary */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1E4F8A] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" /> Verification Summary
                </h2>
                <div className="space-y-2">
                  {[
                    { label: 'Teacher ID issued',    done: !!teacher.teacher_uid },
                    { label: 'NIN verified',          done: false /* not exposed */ },
                    { label: 'Certificate uploaded',  done: !!(teacher.cert_type) },
                    { label: 'Certificate verified',  done: teacher.cert_verified },
                    { label: 'KYC approved',          done: teacher.kyc_status === 'approved' },
                    { label: 'Skillora badge active', done: teacher.has_badge },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      {item.done
                        ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />}
                      <span className={`text-sm ${item.done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hire CTA Banner */}
              <div className="bg-gradient-to-r from-[#1E4F8A] to-[#378ADD] rounded-2xl p-5 text-white">
                <p className="font-bold text-lg mb-1">Ready to hire {profile.full_name.split(' ')[0]}?</p>
                <p className="text-white/70 text-sm mb-4">
                  Post a job on Skillora and invite verified teachers to apply — or contact directly using the details on their profile.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/employer/post-job"
                    className="flex items-center justify-center gap-2 bg-[#F37321] hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Briefcase className="w-4 h-4" /> Post a Job
                  </Link>
                  <Link href="/employer/applicants"
                    className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    View All Applicants
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
