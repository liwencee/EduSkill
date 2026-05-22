import { createClient } from '@/lib/supabase/server'
import { Briefcase, Search, MapPin, Users, Star, Eye, EyeOff, Plus } from 'lucide-react'
import Link from 'next/link'
import JobAdminActions from './JobAdminActions'

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  freelance: 'Freelance',
}

const JOB_TYPE_COLORS: Record<string, string> = {
  full_time: 'bg-blue-100 text-blue-700',
  part_time: 'bg-slate-100 text-slate-600',
  freelance: 'bg-amber-100 text-amber-700',
}

interface Props {
  searchParams: { q?: string; status?: string; type?: string }
}

export default async function AdminJobsPage({ searchParams }: Props) {
  let jobs: any[] = []
  let totalActive = 0
  let totalFeatured = 0

  try {
    const supabase = createClient()
    let query = supabase
      .from('job_listings')
      .select(`
        id, title, company_name, job_type, location_state, is_remote,
        is_active, is_featured, applications, deadline, created_at,
        employer:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (searchParams.q)
      query = query.ilike('title', `%${searchParams.q}%`)
    if (searchParams.status === 'active')
      query = query.eq('is_active', true)
    if (searchParams.status === 'inactive')
      query = query.eq('is_active', false)
    if (searchParams.type && searchParams.type !== 'all')
      query = query.eq('job_type', searchParams.type)

    const { data } = await query.limit(100)
    jobs = data ?? []
    totalActive   = jobs.filter(j => j.is_active).length
    totalFeatured = jobs.filter(j => j.is_featured).length
  } catch { /* DB unavailable */ }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-blue" /> Job Listings
          </h1>
          <p className="text-sm text-brand-inkMid mt-1">
            {jobs.length} total · {totalActive} active · {totalFeatured} featured
          </p>
        </div>
        <Link href="/employer/post-job"
          className="inline-flex items-center gap-2 bg-brand-blue text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form method="GET" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-inkLight" />
          <input name="q" defaultValue={searchParams.q} type="text"
            className="input pl-9 text-sm" placeholder="Search job title or company…" />
        </form>
        <div className="flex gap-2">
          {[
            { val: '',         label: 'All Status' },
            { val: 'active',   label: 'Active' },
            { val: 'inactive', label: 'Inactive' },
          ].map(({ val, label }) => (
            <a key={val} href={`/admin/jobs?status=${val}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                (searchParams.status ?? '') === val
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue'
              }`}>{label}</a>
          ))}
        </div>
      </div>

      {/* Table */}
      {jobs.length === 0 ? (
        <div className="card p-16 text-center text-brand-inkLight">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-brand-ink">No jobs found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DDD5] bg-brand-bg">
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Job</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden lg:table-cell">Employer</th>
                  <th className="text-center px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Apps</th>
                  <th className="text-center px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DDD5]">
                {jobs.map((j: any) => {
                  const employer = Array.isArray(j.employer) ? j.employer[0] : j.employer
                  return (
                    <tr key={j.id} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {j.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          <div>
                            <p className="font-semibold text-brand-ink">{j.title}</p>
                            <p className="text-xs text-brand-inkLight">{j.company_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${JOB_TYPE_COLORS[j.job_type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {JOB_TYPE_LABELS[j.job_type] ?? j.job_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-brand-inkMid flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {j.location_state ?? (j.is_remote ? 'Remote' : '—')}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-brand-inkMid">{employer?.full_name ?? '—'}</p>
                        <p className="text-xs text-brand-inkLight">{employer?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-brand-inkMid font-medium">
                          <Users className="w-3 h-3" /> {j.applications ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {j.is_active
                          ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><Eye className="w-3 h-3" />Active</span>
                          : <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><EyeOff className="w-3 h-3" />Inactive</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <JobAdminActions
                            jobId={j.id}
                            isActive={j.is_active}
                            isFeatured={j.is_featured}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
