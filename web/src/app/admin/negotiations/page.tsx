import { createClient } from '@/lib/supabase/server'
import { Handshake, DollarSign, Video, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import NegotiationActions from './NegotiationActions'

const NEG_STATUS_COLORS: Record<string, string> = {
  negotiating:  'bg-amber-100  text-amber-700',
  agreed:       'bg-blue-100   text-blue-700',
  paid:         'bg-indigo-100 text-indigo-700',
  in_progress:  'bg-teal-100   text-teal-700',
  completed:    'bg-green-100  text-green-700',
  cancelled:    'bg-gray-100   text-gray-500',
}

const PAY_STATUS_COLORS: Record<string, string> = {
  pending:   'bg-gray-100   text-gray-500',
  held:      'bg-amber-100  text-amber-700',
  released:  'bg-green-100  text-green-700',
  refunded:  'bg-red-100    text-red-600',
}

const RATE_SUFFIX: Record<string, string> = {
  hourly: '/hr', daily: '/day', weekly: '/wk',
  monthly: '/mo', per_term: '/term', fixed: ' fixed',
}

interface Props { searchParams: { status?: string } }

export default async function AdminNegotiationsPage({ searchParams }: Props) {
  let negotiations: any[] = []
  const counts = { all: 0, active: 0, held: 0, completed: 0 }

  try {
    const supabase = createClient()

    const { data: allNegs } = await supabase
      .from('job_negotiations')
      .select('status, payment_status')
    ;(allNegs ?? []).forEach((n: any) => {
      counts.all++
      if (!['completed', 'cancelled'].includes(n.status)) counts.active++
      if (n.payment_status === 'held') counts.held++
      if (n.status === 'completed') counts.completed++
    })

    let query = supabase
      .from('job_negotiations')
      .select(`
        id, status, payment_status, agreed_rate_ngn, rate_type,
        engagement_duration, start_date, completed_at, meeting_room_url,
        created_at,
        employer:profiles!job_negotiations_employer_id_fkey(full_name, email),
        teacher:profiles!job_negotiations_teacher_id_fkey(full_name, email),
        job:job_listings(title, company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (searchParams.status && searchParams.status !== 'all') {
      if (searchParams.status === 'active')
        query = query.not('status', 'in', '("completed","cancelled")')
      else if (searchParams.status === 'held')
        query = query.eq('payment_status', 'held')
      else if (searchParams.status === 'completed')
        query = query.eq('status', 'completed')
    }

    const { data } = await query
    negotiations = data ?? []
  } catch { /* DB unavailable */ }

  const filterStatus = searchParams.status ?? ''

  // Total escrow held
  const totalHeld = negotiations
    .filter(n => n.payment_status === 'held')
    .reduce((sum, n) => sum + (Number(n.agreed_rate_ngn) || 0), 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
          <Handshake className="w-6 h-6 text-brand-blue" /> Negotiations & Escrow
        </h1>
        <p className="text-sm text-brand-inkMid mt-1">
          Monitor all negotiations and manage escrow releases
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',      value: counts.all,       color: 'bg-indigo-600', filter: 'all'       },
          { label: 'Active',     value: counts.active,    color: 'bg-teal-600',   filter: 'active'    },
          { label: 'Held',       value: counts.held,      color: 'bg-amber-500',  filter: 'held'      },
          { label: 'Completed',  value: counts.completed, color: 'bg-green-600',  filter: 'completed' },
        ].map(({ label, value, color, filter }) => (
          <a key={filter} href={`/admin/negotiations?status=${filter}`}
            className={`card p-4 flex items-center gap-3 hover:border-brand-blue transition-colors ${filterStatus === filter ? 'border-brand-blue ring-2 ring-brand-blue/20' : ''}`}>
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Handshake className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-brand-ink">{value}</p>
              <p className="text-xs text-brand-inkMid">{label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Escrow held banner */}
      {totalHeld > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold text-amber-800">₦{totalHeld.toLocaleString()} held in escrow</p>
            <p className="text-xs text-amber-600">Funds will be released when jobs are confirmed complete</p>
          </div>
        </div>
      )}

      {/* Negotiations list */}
      {negotiations.length === 0 ? (
        <div className="card p-16 text-center text-brand-inkLight">
          <Handshake className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-brand-ink">No negotiations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {negotiations.map((n: any) => {
            const employer = Array.isArray(n.employer) ? n.employer[0] : n.employer
            const teacher  = Array.isArray(n.teacher)  ? n.teacher[0]  : n.teacher
            const job      = Array.isArray(n.job)       ? n.job[0]      : n.job

            return (
              <div key={n.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">

                    {/* Job title */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-brand-ink">
                        {job?.title ?? 'Unknown Job'}
                      </h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${NEG_STATUS_COLORS[n.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {n.status?.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PAY_STATUS_COLORS[n.payment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                        💳 {n.payment_status}
                      </span>
                    </div>

                    <p className="text-xs text-brand-inkLight mb-3">{job?.company_name}</p>

                    {/* Parties */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-700 mb-0.5">Employer</p>
                        <p className="text-sm font-semibold text-brand-ink">{employer?.full_name ?? '—'}</p>
                        <p className="text-xs text-brand-inkLight">{employer?.email}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-700 mb-0.5">Teacher</p>
                        <p className="text-sm font-semibold text-brand-ink">{teacher?.full_name ?? '—'}</p>
                        <p className="text-xs text-brand-inkLight">{teacher?.email}</p>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      {n.agreed_rate_ngn && (
                        <span className="flex items-center gap-1 font-bold text-green-700">
                          <DollarSign className="w-3.5 h-3.5" />
                          ₦{Number(n.agreed_rate_ngn).toLocaleString()}
                          {RATE_SUFFIX[n.rate_type] ?? ''}
                        </span>
                      )}
                      {n.engagement_duration && (
                        <span className="flex items-center gap-1 text-brand-inkMid">
                          <Clock className="w-3.5 h-3.5" />{n.engagement_duration}
                        </span>
                      )}
                      {n.start_date && (
                        <span className="text-brand-inkLight text-xs">
                          Start: {new Date(n.start_date).toLocaleDateString('en-NG')}
                        </span>
                      )}
                      {n.completed_at && (
                        <span className="flex items-center gap-1 text-xs text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Done: {new Date(n.completed_at).toLocaleDateString('en-NG')}
                        </span>
                      )}
                    </div>

                    {/* Video room */}
                    {n.meeting_room_url && (
                      <a href={n.meeting_room_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-brand-blue hover:underline">
                        <Video className="w-3.5 h-3.5" /> View Meeting Room
                      </a>
                    )}

                    <p className="text-xs text-brand-inkLight mt-2">
                      Started {new Date(n.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}<span className="font-mono text-brand-inkLight/70">{n.id.slice(0, 8)}</span>
                    </p>
                  </div>

                  {/* Escrow actions */}
                  <div className="shrink-0">
                    <NegotiationActions
                      negotiationId={n.id}
                      paymentStatus={n.payment_status}
                      currentStatus={n.status}
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
