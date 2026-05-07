import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { Briefcase, MapPin, Clock, Search } from 'lucide-react'
import Link from 'next/link'
import type { JobListing } from '@/types'

const JOB_TYPES: Record<string, string> = {
  full_time:      'Full-time',
  part_time:      'Part-time',
  apprenticeship: 'Apprenticeship',
  freelance:      'Freelance',
  internship:     'Internship',
}

// 60/30/10 badge mapping — blue for role types, amber for freelance/featured
const JOB_COLORS: Record<string, string> = {
  full_time:      'badge-blue',
  apprenticeship: 'badge-blue',
  freelance:      'badge-amber',
  part_time:      'badge-cream',
  internship:     'badge-cream',
}

const STATES = ['All States','Lagos','Abuja','Kano','Rivers','Ogun','Oyo','Enugu','Anambra','Delta','Kaduna']

interface Props { searchParams: { state?: string; type?: string; q?: string } }

export default async function JobsPage({ searchParams }: Props) {
  let jobs: any[] | null = null
  try {
    const supabase = createClient()
    let query = supabase
      .from('job_listings')
      .select('*, employer:profiles(full_name, avatar_url)')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at',  { ascending: false })
    if (searchParams.state && searchParams.state !== 'All States')
      query = query.eq('location_state', searchParams.state)
    if (searchParams.type) query = query.eq('job_type', searchParams.type)
    if (searchParams.q)    query = query.ilike('title', `%${searchParams.q}%`)
    const { data } = await query.limit(30)
    jobs = data as any[]
  } catch { /* env vars missing or DB unavailable — show empty state */ }

  return (
    <>
      <Navbar />
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-ink mb-2">OpportunityHub</h1>
            <p className="text-brand-inkMid">Jobs, apprenticeships, and freelance gigs for SkillBridge graduates.</p>
          </div>

          {/* Search + state filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form method="GET" className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-inkLight" />
              <input name="q" defaultValue={searchParams.q} type="text"
                className="input pl-9" placeholder="Search jobs, skills, companies…" />
            </form>
            <select name="state" defaultValue={searchParams.state} className="input md:w-44"
              onChange={undefined /* handled server-side via form submit */}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Job-type filter chips — 30% blue active */}
          <div className="flex gap-2 flex-wrap mb-6">
            <a href="/opportunity-hub/jobs"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                !searchParams.type
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue hover:text-brand-blue'
              }`}>
              All Types
            </a>
            {Object.entries(JOB_TYPES).map(([val, label]) => (
              <a key={val} href={`/opportunity-hub/jobs?type=${val}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  searchParams.type === val
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue hover:text-brand-blue'
                }`}>
                {label}
              </a>
            ))}
          </div>

          {/* Jobs list */}
          {jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((j) => {
                return (
                  <div key={j.id}
                    className={`card p-5 flex flex-col md:flex-row md:items-center gap-4 relative ${
                      j.is_featured ? 'border-brand-amber/30 bg-amber-50/30' : ''
                    }`}>
                    {/* 10% amber featured badge */}
                    {j.is_featured && (
                      <span className="badge badge-amber absolute top-3 right-3">Featured</span>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-brand-ink">{j.title}</h3>
                        {/* job type badge */}
                        <span className={JOB_COLORS[j.job_type] ?? 'badge-blue'}>
                          {JOB_TYPES[j.job_type]}
                        </span>
                      </div>
                      <p className="text-sm text-brand-inkMid mb-2">{j.company_name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-brand-inkLight">
                        {j.location_state && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location_state}</span>
                        )}
                        {j.is_remote && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Remote</span>}
                        {j.salary_min_ngn && (
                          <span>₦{j.salary_min_ngn.toLocaleString()}–₦{j.salary_max_ngn?.toLocaleString()}/mo</span>
                        )}
                        {j.deadline && <span>Deadline: {new Date(j.deadline).toLocaleDateString()}</span>}
                      </div>
                      {(j.required_skills ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(j.required_skills ?? []).slice(0, 4).map((s: string) => (
                            <span key={s} className="bg-brand-blueLight text-brand-blue text-xs px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* 10% amber CTA */}
                    <Link href={`/opportunity-hub/jobs/${j.id}`}
                      className="btn-primary text-sm py-2 px-4 whitespace-nowrap shrink-0">
                      Apply Now
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-brand-inkLight">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No jobs found</p>
              <a href="/opportunity-hub/jobs" className="text-brand-blue text-sm hover:underline mt-1 inline-block">
                Clear filters
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
