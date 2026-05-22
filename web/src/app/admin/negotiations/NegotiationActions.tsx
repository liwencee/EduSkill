'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { DollarSign, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  negotiationId:  string
  paymentStatus:  string
  currentStatus:  string
}

export default function NegotiationActions({ negotiationId, paymentStatus, currentStatus }: Props) {
  const [busy,   setBusy]   = useState(false)
  const [pStatus, setPStatus] = useState(paymentStatus)
  const [nStatus, setNStatus] = useState(currentStatus)
  const router = useRouter()

  async function releaseEscrow() {
    if (!confirm('Release escrow to the teacher? This marks the job as completed.')) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('job_negotiations')
      .update({ payment_status: 'released', status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', negotiationId)
    if (error) toast.error(error.message)
    else {
      toast.success('Escrow released — job marked completed')
      setPStatus('released'); setNStatus('completed')
      router.refresh()
    }
    setBusy(false)
  }

  async function refundEscrow() {
    if (!confirm('Refund escrow to the employer?')) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('job_negotiations')
      .update({ payment_status: 'refunded', status: 'cancelled' })
      .eq('id', negotiationId)
    if (error) toast.error(error.message)
    else {
      toast.success('Escrow refunded to employer')
      setPStatus('refunded'); setNStatus('cancelled')
      router.refresh()
    }
    setBusy(false)
  }

  if (busy) return <Loader2 className="w-4 h-4 animate-spin text-brand-inkLight" />

  if (pStatus === 'released' || nStatus === 'completed')
    return <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Released</span>

  if (pStatus === 'refunded')
    return <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Refunded</span>

  if (pStatus !== 'held') return null

  return (
    <div className="flex flex-col gap-1.5">
      <button onClick={releaseEscrow}
        className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
        <DollarSign className="w-3.5 h-3.5" /> Release to Teacher
      </button>
      <button onClick={refundEscrow}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
        Refund to Employer
      </button>
    </div>
  )
}
