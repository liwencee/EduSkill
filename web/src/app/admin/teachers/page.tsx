import { createClient } from '@/lib/supabase/server'
import { GraduationCap, Search, Clock, CheckCircle, XCircle, Award, ExternalLink } from 'lucide-react'
import TeacherKycActions from './TeacherKycActions'

const KYC_COLORS: Record<string, string> = {
  approved:   'bg-green-100 text-green-700',
  pending:    'bg-amber-100 text-amber-700',
  rejected:   'bg-red-100 text-red-700',
  incomplete: 'bg-gray-100 text-gray-600',
}

const KYC_ICONS: Record<string, React.ElementType> = {
  approved:   CheckCircle,
  pending:    Clock,
  rejected:   XCircle,
  incomplete: Clock,
}

const BADGE_COLORS: Record<string, string> = {
  master:   'bg-purple-100 text-purple-700',
  gold:     'bg-amber-100 text-amber-700',
  verified: 'bg-blue-100 text-blue-700',
}

interface Props { searchParams: { q?: string; status?: string } }

export default async function AdminTeachersPage({ searchParams }: Props) {
  let teachers: any[] = []
  const counts = { pending: 0, approved: 0, rejected: 0, incomplete: 0 }

  try {
    const supabase = createClient()

    // Get all counts first
    const { data: allTp } = await supabase
      .from('teacher_profiles')
      .select('kyc_status')
    ;(allTp ?? []).forEach((t: any) => {
      const s = t.kyc_status as keyof typeof counts
      if (s in counts) counts[s]++
    })

    // Then paginated list
    let query = supabase
      .from('teacher_profiles')
      .select(`
        id, teacher_uid, cert_type, cert_url, cert_verified,
        years_of_service, has_badge, badge_type, kyc_status,
        kyc_submitted_at, subject_areas, school_name,
        nin,
        profile:profiles(id, full_name, email, avatar_url, state, phone, created_at)
      `)
      .order('kyc_submitted_at', { ascending: true, nullsFirst: false })

    if (searchParams.status && searchParams.status !== 'all')
      query = query.eq('kyc_status', searchParams.status)
    else if (!searchParams.status)
      query = query.in('kyc_status', ['pending', 'approved', 'rejected', 'incomplete'])

    const { data } = await query.limit(100)
    let rows = data ?? []

    if (searchParams.q) {
      const q = searchParams.q.toLowerCase()
      rows = rows.filter((t: any) => {
        const prof = Array.isArray(t.profile) ? t.profile[0] : t.profile
        return (
          prof?.full_name?.toLowerCase().includes(q) ||
          prof?.email?.toLowerCase().includes(q) ||
          t.teacher_uid?.toLowerCase().includes(q) ||
          t.school_name?.toLowerCase().includes(q)
        )
      })
    }

    teachers = rows
  } catch { /* DB unavailable */ }

  const filterStatus = searchParams.status ?? ''

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-brand-blue" /> Teacher KYC
        </h1>
        <p className="text-sm text-brand-inkMid mt-1">
          Review and approve teacher verifications
        </p>
      </div>

      {/* Count chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'pending',    label: 'Pending',    icon: Clock,        color: 'border-amber-200  bg-amber-50  text-amber-700'  },
          { key: 'approved',   label: 'Approved',   icon: CheckCircle,  color: 'border-green-200  bg-green-50  text-green-700'  },
          { key: 'rejected',   label: 'Rejected',   icon: XCircle,      color: 'border-red-200    bg-red-50    text-red-700'    },
          { key: 'incomplete', label: 'Incomplete', icon: Clock,        color: 'border-gray-200   bg-gray-50   text-gray-600'   },
        ].map(({ key, label, icon: Icon, color }) => (
          <a key={key} href={`/admin/teachers?status=${key}`}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${color} ${filterStatus === key ? 'ring-2 ring-brand-blue' : 'hover:opacity-80'}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-xl font-bold leading-tight">{counts[key as keyof typeof counts]}</p>
              <p className="text-xs font-medium">{label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form method="GET" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-inkLight" />
          <input name="q" type="text" defaultValue={searchParams.q}
            className="input pl-9 text-sm" placeholder="Search by name, email, Teacher ID…" />
          {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        </form>
        <a href="/admin/teachers"
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            !filterStatus ? 'bg-brand-blue text-white border-brand-blue' : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue'
          }`}>
          All
        </a>
      </div>

      {/* Teacher cards */}
      {teachers.length === 0 ? (
        <div className="card p-16 text-center text-brand-inkLight">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-brand-ink">No teachers found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teachers.map((t: any) => {
            const prof    = Array.isArray(t.profile) ? t.profile[0] : t.profile
            const KycIcon = KYC_ICONS[t.kyc_status] ?? Clock

            return (
              <div key={t.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">

                  {/* Avatar + identity */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      {prof?.avatar_url ? (
                        <img src={prof.avatar_url} alt={prof.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#E0DDD5]" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {prof?.full_name?.charAt(0) ?? 'T'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + status */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-brand-ink">{prof?.full_name ?? 'Unknown'}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${KYC_COLORS[t.kyc_status] ?? 'bg-gray-100 text-gray-600'}`}>
                          <KycIcon className="w-3 h-3" />{t.kyc_status}
                        </span>
                        {t.has_badge && t.badge_type && (
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[t.badge_type] ?? 'bg-gray-100 text-gray-600'}`}>
                            <Award className="w-3 h-3" />{t.badge_type}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-inkMid">
                        {t.teacher_uid && (
                          <span className="font-mono font-bold text-brand-blue">{t.teacher_uid}</span>
                        )}
                        <span>{prof?.email}</span>
                        {prof?.phone && <span>{prof.phone}</span>}
                        {prof?.state && <span>{prof.state}</span>}
                      </div>

                      {/* KYC data */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-inkLight mt-1.5">
                        {t.cert_type && <span>📄 {t.cert_type}</span>}
                        {t.years_of_service > 0 && <span>⏱ {t.years_of_service} yrs service</span>}
                        {t.school_name && <span>🏫 {t.school_name}</span>}
                        {t.nin && <span>🪪 NIN: ••••••{t.nin?.slice(-5)}</span>}
                        {t.kyc_submitted_at && (
                          <span>Submitted {new Date(t.kyc_submitted_at).toLocaleDateString('en-NG')}</span>
                        )}
                      </div>

                      {/* Subject areas */}
                      {(t.subject_areas ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(t.subject_areas ?? []).slice(0, 5).map((s: string) => (
                            <span key={s} className="text-xs bg-brand-blueLight text-brand-blue px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}

                      {/* Certificate link */}
                      {t.cert_url && (
                        <a href={t.cert_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline mt-2">
                          View Certificate <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 lg:w-52">
                    <TeacherKycActions
                      teacherId={t.id}
                      currentStatus={t.kyc_status}
                      currentBadge={t.badge_type}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
