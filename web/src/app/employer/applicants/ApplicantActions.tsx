'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, ChevronDown } from 'lucide-react'

const STATUSES = [
  { value: 'pending',     label: 'Pending',     color: 'text-gray-600'  },
  { value: 'reviewed',    label: 'Reviewed',    color: 'text-blue-700'  },
  { value: 'shortlisted', label: 'Shortlisted', color: 'text-amber-700' },
  { value: 'rejected',    label: 'Rejected',    color: 'text-red-700'   },
  { value: 'hired',       label: 'Hired ✓',     color: 'text-green-700' },
]

interface Props { applicationId: string; currentStatus: string }

export default function ApplicantActions({ applicationId, currentStatus }: Props) {
  const [status,  setStatus]  = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: string) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', applicationId)

    if (error) toast.error(error.message)
    else {
      setStatus(newStatus)
      toast.success(`Application marked as ${newStatus}`)
    }
    setLoading(false)
  }

  return (
    <div className="shrink-0">
      <div className="relative">
        <select
          value={status}
          onChange={e => updateStatus(e.target.value)}
          disabled={loading}
          className="appearance-none pr-8 pl-3 py-2 text-xs font-bold border border-blue-200 rounded-xl bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60">
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            : <ChevronDown className="w-3 h-3 text-gray-400" />}
        </div>
      </div>
    </div>
  )
}
