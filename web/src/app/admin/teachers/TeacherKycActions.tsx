'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Award, Loader2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  teacherId: string
  currentStatus: string
  currentBadge:  string | null
}

const BADGE_OPTIONS = [
  { value: 'verified', label: 'Verified',    color: 'text-blue-600'  },
  { value: 'gold',     label: 'Gold',        color: 'text-amber-500' },
  { value: 'master',   label: 'Master',      color: 'text-purple-600'},
]

export default function TeacherKycActions({ teacherId, currentStatus, currentBadge }: Props) {
  const [busy,         setBusy]         = useState(false)
  const [status,       setStatus]       = useState(currentStatus)
  const [badge,        setBadge]        = useState(currentBadge ?? 'verified')
  const [showReject,   setShowReject]   = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const router = useRouter()

  async function approve() {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('teacher_profiles').update({
      kyc_status:   'approved',
      cert_verified: true,
      has_badge:    true,
      badge_type:   badge,
    }).eq('id', teacherId)

    if (error) { toast.error(error.message) }
    else {
      toast.success(`KYC approved — ${badge} badge awarded`)
      setStatus('approved')
      router.refresh()
    }
    setBusy(false)
  }

  async function reject() {
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason'); return }
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('teacher_profiles').update({
      kyc_status:    'rejected',
      cert_verified: false,
      has_badge:     false,
    }).eq('id', teacherId)

    if (error) { toast.error(error.message) }
    else {
      toast.success('KYC rejected')
      setStatus('rejected')
      setShowReject(false)
      router.refresh()
    }
    setBusy(false)
  }

  async function updateBadge() {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('teacher_profiles').update({
      badge_type: badge,
      has_badge:  true,
    }).eq('id', teacherId)
    if (error) toast.error(error.message)
    else { toast.success(`Badge updated to ${badge}`); router.refresh() }
    setBusy(false)
  }

  if (busy) return <Loader2 className="w-4 h-4 animate-spin text-brand-inkLight" />

  return (
    <div className="flex flex-col gap-2">
      {/* Badge selector */}
      <div className="flex items-center gap-1.5">
        <Award className="w-3.5 h-3.5 text-brand-inkLight" />
        <div className="relative">
          <select
            value={badge}
            onChange={e => setBadge(e.target.value)}
            className="text-xs border border-[#D5D2C8] rounded-lg px-2 py-1 pr-6 bg-white text-brand-inkMid appearance-none focus:outline-none focus:ring-1 focus:ring-brand-blue">
            {BADGE_OPTIONS.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-inkLight pointer-events-none" />
        </div>
        {status === 'approved' && (
          <button onClick={updateBadge}
            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-200 transition-colors font-medium">
            Update
          </button>
        )}
      </div>

      {/* Action buttons */}
      {status !== 'approved' && (
        <button onClick={approve}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
          <CheckCircle className="w-3.5 h-3.5" /> Approve KYC
        </button>
      )}

      {status === 'approved' && (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5" /> Approved
        </span>
      )}

      {status !== 'rejected' && (
        <>
          {!showReject ? (
            <button onClick={() => setShowReject(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>
          ) : (
            <div className="space-y-1.5">
              <textarea
                rows={2}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Rejection reason…"
                className="w-full text-xs border border-red-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
              />
              <div className="flex gap-1">
                <button onClick={reject}
                  className="flex-1 text-xs font-bold bg-red-600 text-white px-2 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                  Confirm Reject
                </button>
                <button onClick={() => setShowReject(false)}
                  className="text-xs text-brand-inkMid border border-[#D5D2C8] px-2 py-1.5 rounded-lg hover:bg-brand-bg transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {status === 'rejected' && (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      )}
    </div>
  )
}
