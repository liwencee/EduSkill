import { createClient } from '@/lib/supabase/server'
import {
  Users, Briefcase, GraduationCap, FileText,
  Handshake, Clock, CheckCircle, AlertCircle,
  TrendingUp, DollarSign, ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

interface StatCard {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  href?: string
}

function StatCard({ label, value, sub, icon: Icon, color, href }: StatCard) {
  const inner = (
    <div className={`card p-5 flex items-start gap-4 ${href ? 'hover:border-brand-blue cursor-pointer transition-colors' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-brand-ink">{value}</p>
        <p className="text-sm font-medium text-brand-inkMid">{label}</p>
        {sub && <p className="text-xs text-brand-inkLight mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function AdminDashboard() {
  let stats: Record<string, number> = {}
  let recentJobs: any[]        = []
  let recentUsers: any[]       = []
  let pendingKyc: any[]        = []

  try {
    const supabase = createClient()

    // Parallel fetches
    const [
      { data: profiles },
      { data: jobs },
      { data: applications },
      { data: teacherProfiles },
      { data: negotiations },
      { data: latestJobs },
      { data: latestUsers },
      { data: kycPending },
    ] = await Promise.all([
      supabase.from('profiles').select('role', { count: 'exact' }),
      supabase.from('job_listings').select('is_active', { count: 'exact' }),
      supabase.from('job_applications').select('id', { count: 'exact' }),
      supabase.from('teacher_profiles').select('kyc_status'),
      supabase.from('job_negotiations').select('status, payment_status, agreed_rate_ngn'),
      supabase.from('job_listings')
        .select('id, title, company_name, job_type, is_active, is_featured, applications, created_at')
        .order('created_at', { ascending: false }).limit(5),
      supabase.from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false }).limit(5),
      supabase.from('teacher_profiles')
        .select('id, kyc_status, kyc_submitted_at, profile:profiles(full_name, email)')
        .eq('kyc_status', 'pending')
        .order('kyc_submitted_at', { ascending: true })
        .limit(5),
    ])

    const allProfiles    = profiles ?? []
    const allJobs        = jobs     ?? []
    const allTeachers    = teacherProfiles ?? []
    const allNegotiations = negotiations ?? []

    stats = {
      total_users:       allProfiles.length,
      teachers:          allProfiles.filter(p => p.role === 'teacher').length,
      employers:         allProfiles.filter(p => p.role === 'employer').length,
      total_jobs:        allJobs.length,
      active_jobs:       allJobs.filter(j => j.is_active).length,
      total_applications: (applications ?? []).length,
      pending_kyc:       allTeachers.filter(t => t.kyc_status === 'pending').length,
      approved_kyc:      allTeachers.filter(t => t.kyc_status === 'approved').length,
      active_negotiations: allNegotiations.filter(n => !['completed','cancelled'].includes(n.status)).length,
      escrow_held_ngn:   allNegotiations
        .filter(n => n.payment_status === 'held')
        .reduce((sum, n) => sum + (Number(n.agreed_rate_ngn) || 0), 0),
    }

    recentJobs  = latestJobs   ?? []
    recentUsers = latestUsers  ?? []
    pendingKyc  = kycPending   ?? []
  } catch { /* DB unavailable */ }

  const JOB_TYPE_LABELS: Record<string, string> = {
    full_time: 'Full-time', part_time: 'Part-time', freelance: 'Freelance',
  }

  const ROLE_COLORS: Record<string, string> = {
    admin:    'bg-purple-100 text-purple-700',
    employer: 'bg-blue-100 text-blue-700',
    teacher:  'bg-green-100 text-green-700',
    youth:    'bg-amber-100 text-amber-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-blue" />
          Admin Dashboard
        </h1>
        <p className="text-brand-inkMid text-sm mt-1">
          Platform overview — {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users"        value={stats.total_users        ?? 0} icon={Users}        color="bg-brand-blue"      href="/admin/users" />
        <StatCard label="Teachers"           value={stats.teachers           ?? 0} sub={`${stats.approved_kyc ?? 0} KYC approved`} icon={GraduationCap} color="bg-green-600" href="/admin/teachers" />
        <StatCard label="Employers"          value={stats.employers          ?? 0} icon={Users}        color="bg-indigo-600"      href="/admin/users" />
        <StatCard label="Pending KYC"        value={stats.pending_kyc        ?? 0} sub="Awaiting review" icon={Clock}         color="bg-amber-500"   href="/admin/teachers" />
        <StatCard label="Total Jobs"         value={stats.total_jobs         ?? 0} sub={`${stats.active_jobs ?? 0} active`} icon={Briefcase} color="bg-brand-blue" href="/admin/jobs" />
        <StatCard label="Applications"       value={stats.total_applications ?? 0} icon={FileText}     color="bg-purple-600"     href="/admin/jobs" />
        <StatCard label="Live Negotiations"  value={stats.active_negotiations ?? 0} icon={Handshake}  color="bg-teal-600"        href="/admin/negotiations" />
        <StatCard label="Escrow Held"        value={`₦${Number(stats.escrow_held_ngn ?? 0).toLocaleString()}`} icon={DollarSign} color="bg-emerald-600" href="/admin/negotiations" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Pending KYC ─────────────────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-ink flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Pending KYC ({stats.pending_kyc ?? 0})
            </h2>
            <Link href="/admin/teachers" className="text-xs text-brand-blue hover:underline">View all →</Link>
          </div>
          {pendingKyc.length === 0 ? (
            <div className="text-center py-8 text-brand-inkLight">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm">No pending KYC submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingKyc.map((t: any) => {
                const prof = Array.isArray(t.profile) ? t.profile[0] : t.profile
                return (
                  <Link key={t.id} href="/admin/teachers"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-bg transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {prof?.full_name?.charAt(0) ?? 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-ink truncate">
                        {prof?.full_name ?? 'Teacher'}
                      </p>
                      <p className="text-xs text-brand-inkLight truncate">{prof?.email}</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Pending
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Recent Jobs ──────────────────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-ink flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-blue" />
              Recent Jobs
            </h2>
            <Link href="/admin/jobs" className="text-xs text-brand-blue hover:underline">View all →</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-brand-inkLight text-center py-8">No jobs posted yet</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((j: any) => (
                <div key={j.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-brand-bg transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${j.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-ink truncate">{j.title}</p>
                    <p className="text-xs text-brand-inkLight truncate">{j.company_name}</p>
                    <p className="text-xs text-brand-inkLight mt-0.5">
                      {JOB_TYPE_LABELS[j.job_type] ?? j.job_type} · {j.applications ?? 0} applicant{j.applications !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {j.is_featured && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                      Featured
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Users ─────────────────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              New Users
            </h2>
            <Link href="/admin/users" className="text-xs text-brand-blue hover:underline">View all →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-brand-inkLight text-center py-8">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-bg transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {u.full_name?.charAt(0) ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-ink truncate">{u.full_name}</p>
                    <p className="text-xs text-brand-inkLight truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
