import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import TeacherBadge from '@/components/TeacherBadge'
import { STATIC_TEACHERS } from '@/lib/static-teachers'
import {
  Search, MapPin, Award, Clock, Users, BadgeCheck,
  BookOpen, Star, SlidersHorizontal, ChevronRight,
  GraduationCap, Briefcase,
} from 'lucide-react'

const CERT_TYPES = ['All', 'NCE', 'PGDE', 'B.Ed', 'M.Ed', 'PhD', 'OND', 'HND', 'Other']
const STATES_SHORT = [
  'All States', 'Lagos', 'Abuja', 'Kano', 'Rivers', 'Ogun', 'Oyo',
  'Enugu', 'Anambra', 'Delta', 'Kaduna', 'Imo', 'Katsina', 'Borno',
]
const EXPERIENCE_FILTERS = [
  { label: 'Any', value: '' },
  { label: '1–3 yrs', value: '1' },
  { label: '4–9 yrs', value: '4' },
  { label: '10+ yrs', value: '10' },
]

interface Props {
  searchParams: {
    q?: string
    cert?: string
    state?: string
    exp?: string
    verified?: string
  }
}

export default async function CandidatesPage({ searchParams }: Props) {
  let teachers: any[] = []
  let totalCount = 0

  try {
    const supabase = createClient()
    // Base query: join profiles + teacher_profiles, only display_to_employers=true
    let query = supabase
      .from('teacher_profiles')
      .select(`
        id, teacher_uid, cert_type, cert_verified, years_of_service,
        has_badge, badge_type, kyc_status, subject_areas, school_name,
        school_type, subject_specialization, portfolio_url, linkedin_url,
        avg_rating, total_ratings, total_jobs_completed,
        profile:profiles!teacher_profiles_id_fkey(
          id, full_name, avatar_url, state, bio
        )
      `, { count: 'exact' })
      .eq('display_to_employers', true)
      .not('kyc_status', 'eq', 'incomplete')   // only profiles with some KYC

    // Filter: verified only
    if (searchParams.verified === '1') {
      query = query.eq('kyc_status', 'approved')
    }

    // Filter: cert type
    if (searchParams.cert && searchParams.cert !== 'All') {
      query = query.eq('cert_type', searchParams.cert)
    }

    // Filter: experience
    if (searchParams.exp) {
      const minYrs = parseInt(searchParams.exp)
      if (minYrs === 10) query = query.gte('years_of_service', 10)
      else if (minYrs === 4) query = query.gte('years_of_service', 4).lt('years_of_service', 10)
      else if (minYrs === 1) query = query.gte('years_of_service', 1).lt('years_of_service', 4)
    }

    // Ordering: approved first, then badge holders, then by years
    query = query
      .order('kyc_status', { ascending: false })   // approved sorts last alphabetically — flip below
      .order('has_badge',  { ascending: false })
      .order('years_of_service', { ascending: false })
      .limit(40)

    const { data, count } = await query
    teachers = (data ?? []).filter(Boolean)
    totalCount = count ?? teachers.length

    // Client-side: filter by state (profile.state) and search query
    if (searchParams.state && searchParams.state !== 'All States') {
      teachers = teachers.filter(t => {
        const p = Array.isArray(t.profile) ? t.profile[0] : t.profile
        return p?.state?.toLowerCase().includes(searchParams.state!.toLowerCase())
      })
    }
    if (searchParams.q) {
      const q = searchParams.q.toLowerCase()
      teachers = teachers.filter(t => {
        const p = Array.isArray(t.profile) ? t.profile[0] : t.profile
        return (
          p?.full_name?.toLowerCase().includes(q) ||
          t.subject_specialization?.toLowerCase().includes(q) ||
          t.school_name?.toLowerCase().includes(q) ||
          (t.subject_areas ?? []).some((s: string) => s.toLowerCase().includes(q))
        )
      })
    }

    // If DB returned no results, fall back to static teachers (filtered on client)
    if (teachers.length === 0) {
      let fallback: any[] = STATIC_TEACHERS
      if (searchParams.cert && searchParams.cert !== 'All')
        fallback = fallback.filter(t => t.cert_type === searchParams.cert)
      if (searchParams.verified === '1')
        fallback = fallback.filter(t => t.kyc_status === 'approved')
      if (searchParams.state && searchParams.state !== 'All States')
        fallback = fallback.filter(t => t.profile.state.toLowerCase().includes(searchParams.state!.toLowerCase()))
      if (searchParams.q) {
        const q = searchParams.q.toLowerCase()
        fallback = fallback.filter(t =>
          t.profile.full_name.toLowerCase().includes(q) ||
          t.subject_specialization.toLowerCase().includes(q) ||
          t.school_name.toLowerCase().includes(q) ||
          t.subject_areas.some((s: string) => s.toLowerCase().includes(q))
        )
      }
      teachers = fallback
    }

    // Sort approved to top after filtering
    teachers.sort((a, b) => {
      const aScore = (a.kyc_status === 'approved' ? 100 : 0) + (a.has_badge ? 50 : 0) + (a.years_of_service ?? 0)
      const bScore = (b.kyc_status === 'approved' ? 100 : 0) + (b.has_badge ? 50 : 0) + (b.years_of_service ?? 0)
      return bScore - aScore
    })
  } catch { /* DB unavailable — show empty state */ }

  const hasFilters = !!(searchParams.q || (searchParams.cert && searchParams.cert !== 'All') ||
    (searchParams.state && searchParams.state !== 'All States') || searchParams.exp || searchParams.verified)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#EBF4FF]">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#1E4F8A] to-[#378ADD] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="w-8 h-8 text-orange-300" />
              <span className="text-white/70 text-sm font-medium">Skillora · Certified Teacher Pool</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Find Your Best-Match Teacher</h1>
            <p className="text-white/75 max-w-2xl text-sm leading-relaxed">
              Browse KYC-verified Nigerian teachers. Filter by qualification, subject, state and experience.
              Every profile shows real certifications, years of service and unique Teacher IDs.
            </p>

            {/* Search bar */}
            <form method="GET" className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input name="q" defaultValue={searchParams.q}
                  type="text" placeholder="Search by name, subject or school…"
                  className="w-full pl-10 pr-4 py-3 bg-white/15 border border-white/25 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm" />
              </div>
              {/* pass other filters through hidden inputs */}
              {searchParams.cert  && <input type="hidden" name="cert"     value={searchParams.cert} />}
              {searchParams.state && <input type="hidden" name="state"    value={searchParams.state} />}
              {searchParams.exp   && <input type="hidden" name="exp"      value={searchParams.exp} />}
              {searchParams.verified && <input type="hidden" name="verified" value={searchParams.verified} />}
              <button type="submit"
                className="bg-[#F37321] hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap">
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Filter Sidebar ─────────────────────────────────────────── */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 sticky top-6">
                <div className="flex items-center gap-2 mb-5">
                  <SlidersHorizontal className="w-4 h-4 text-[#378ADD]" />
                  <span className="font-bold text-[#1E4F8A] text-sm">Filters</span>
                  {hasFilters && (
                    <a href="/opportunity-hub/candidates"
                      className="ml-auto text-xs text-red-500 hover:underline">Clear all</a>
                  )}
                </div>

                {/* Verified only */}
                <div className="mb-5">
                  <a href={searchParams.verified === '1'
                    ? buildUrl(searchParams, { verified: '' })
                    : buildUrl(searchParams, { verified: '1' })}
                    className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      searchParams.verified === '1'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-blue-200 text-[#1E4F8A] hover:bg-blue-50'
                    }`}>
                    <BadgeCheck className="w-4 h-4" />
                    KYC Verified Only
                  </a>
                </div>

                {/* Cert type */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Qualification</p>
                  <div className="space-y-1">
                    {CERT_TYPES.map(ct => (
                      <a key={ct}
                        href={buildUrl(searchParams, { cert: ct === 'All' ? '' : ct })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          (searchParams.cert ?? 'All') === ct || (!searchParams.cert && ct === 'All')
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}>
                        {ct}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Experience</p>
                  <div className="space-y-1">
                    {EXPERIENCE_FILTERS.map(ef => (
                      <a key={ef.label}
                        href={buildUrl(searchParams, { exp: ef.value })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          (searchParams.exp ?? '') === ef.value
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}>
                        {ef.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* State */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">State</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {STATES_SHORT.map(st => (
                      <a key={st}
                        href={buildUrl(searchParams, { state: st === 'All States' ? '' : st })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          (searchParams.state ?? 'All States') === st || (!searchParams.state && st === 'All States')
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}>
                        {st}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Candidates Grid ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Result count + sort */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-[#1E4F8A]">{teachers.length}</span> teacher{teachers.length !== 1 ? 's' : ''} found
                  {hasFilters && <span className="text-blue-600 ml-1">(filtered)</span>}
                </p>
                <Link href="/employer/post-job"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#F37321] hover:bg-orange-600 px-4 py-2 rounded-xl transition-colors">
                  <Briefcase className="w-3.5 h-3.5" /> Post a Job
                </Link>
              </div>

              {teachers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-blue-100 p-16 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-[#1E4F8A] mb-2">No teachers found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {hasFilters
                      ? 'Try adjusting your filters — teachers with visible profiles will appear here.'
                      : 'Teachers will appear here once they complete their KYC profile on Skillora.'}
                  </p>
                  {hasFilters && (
                    <a href="/opportunity-hub/candidates"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      Clear all filters
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {teachers.map(t => {
                    const profile = Array.isArray(t.profile) ? t.profile[0] : t.profile
                    if (!profile) return null

                    const isVerified  = t.kyc_status === 'approved'
                    const matchScore  = calcMatchScore(t)

                    return (
                      <div key={t.id}
                        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col ${
                          isVerified ? 'border-blue-200' : 'border-blue-100'
                        }`}>
                        {/* Card Header */}
                        <div className={`px-5 pt-5 pb-4 ${isVerified ? 'bg-gradient-to-br from-blue-50 to-white rounded-t-2xl' : ''}`}>
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-100" />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#378ADD] to-[#378ADD] flex items-center justify-center text-white text-xl font-bold border-2 border-blue-100">
                                  {profile.full_name?.charAt(0)?.toUpperCase() ?? 'T'}
                                </div>
                              )}
                              {isVerified && (
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                  <BadgeCheck className="w-3 h-3 text-white" />
                                </span>
                              )}
                            </div>

                            {/* Name + match */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-[#1E4F8A] text-sm leading-tight line-clamp-1">
                                    {profile.full_name}
                                  </h3>
                                  {t.teacher_uid && (
                                    <p className="text-xs font-mono text-blue-500 mt-0.5">{t.teacher_uid}</p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-sm font-bold text-green-600">{matchScore}%</span>
                                  <p className="text-xs text-gray-400">match</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Badge */}
                          <div className="mt-2">
                            <TeacherBadge
                              hasBadge={t.has_badge}
                              kycStatus={t.kyc_status}
                              badgeType={t.badge_type}
                              certVerified={t.cert_verified}
                              size="sm"
                            />
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="px-5 pb-4 flex-1 space-y-2">
                          {/* Qualification + years */}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {t.cert_type && (
                              <span className="flex items-center gap-1 font-medium">
                                <Award className="w-3 h-3 text-blue-400" />
                                {t.cert_type}
                                {t.cert_verified && <span className="text-green-500 font-bold">✓</span>}
                              </span>
                            )}
                            {(t.years_of_service ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-400" />
                                {t.years_of_service} yr{t.years_of_service !== 1 ? 's' : ''}
                              </span>
                            )}
                            {profile.state && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {profile.state}
                              </span>
                            )}
                          </div>

                          {/* Rating */}
                          {(t.avg_rating ?? 0) > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="flex">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} className={`text-sm ${s <= Math.round(t.avg_rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                ))}
                              </div>
                              <span className="font-bold text-amber-700">{Number(t.avg_rating).toFixed(1)}</span>
                              <span className="text-gray-400">({t.total_ratings})</span>
                              {t.total_jobs_completed > 0 && (
                                <span className="text-gray-400">· {t.total_jobs_completed} jobs done</span>
                              )}
                            </div>
                          )}

                          {/* School */}
                          {t.school_name && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 shrink-0" />
                              <span className="line-clamp-1">{t.school_name}</span>
                            </p>
                          )}

                          {/* Specialization */}
                          {t.subject_specialization && (
                            <p className="text-xs text-blue-600 font-medium line-clamp-1">
                              {t.subject_specialization}
                            </p>
                          )}

                          {/* Subjects */}
                          {(t.subject_areas ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {(t.subject_areas ?? []).slice(0, 3).map((s: string) => (
                                <span key={s}
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  {s}
                                </span>
                              ))}
                              {(t.subject_areas ?? []).length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{t.subject_areas.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Bio snippet */}
                          {profile.bio && (
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pt-1">
                              {profile.bio}
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="px-5 pb-5 pt-2 border-t border-blue-50 flex gap-2">
                          <Link href={`/opportunity-hub/candidates/${t.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#378ADD] border border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors">
                            View Profile <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                          <Link href="/employer/post-job"
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#F37321] hover:bg-orange-600 px-3 py-2 rounded-xl transition-colors">
                            <Briefcase className="w-3.5 h-3.5" /> Hire
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcMatchScore(t: any): number {
  let score = 60  // base
  if (t.kyc_status === 'approved') score += 20
  if (t.cert_verified)             score += 5
  if (t.has_badge)                 score += 5
  if ((t.years_of_service ?? 0) >= 10) score += 8
  else if ((t.years_of_service ?? 0) >= 5) score += 4
  if ((t.subject_areas ?? []).length > 3) score += 2
  return Math.min(score, 99)
}

function buildUrl(
  current: Record<string, string | undefined>,
  overrides: Record<string, string>
): string {
  const params = new URLSearchParams()
  const merged = { ...current, ...overrides }
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v)
  }
  const qs = params.toString()
  return `/opportunity-hub/candidates${qs ? '?' + qs : ''}`
}
