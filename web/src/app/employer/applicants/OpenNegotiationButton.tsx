'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { MessageSquare, Loader2 } from 'lucide-react'

interface Props {
  applicationId: string
  jobId: string
  teacherId: string
  employerId: string
  existingNegotiationId?: string | null
}

export default function OpenNegotiationButton({
  applicationId, jobId, teacherId, employerId, existingNegotiationId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function openNegotiation() {
    // If negotiation already exists, go straight to it
    if (existingNegotiationId) {
      router.push(`/negotiate/${existingNegotiationId}`)
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Create negotiation
    const { data, error } = await supabase
      .from('job_negotiations')
      .insert({
        application_id: applicationId,
        job_id:         jobId,
        teacher_id:     teacherId,
        employer_id:    employerId,
        status:         'open',
      })
      .select('id')
      .single()

    if (error) {
      // Already exists — fetch it
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('job_negotiations')
          .select('id')
          .eq('application_id', applicationId)
          .single()
        if (existing) {
          router.push(`/negotiate/${existing.id}`)
          setLoading(false)
          return
        }
      }
      toast.error(error.message)
      setLoading(false)
      return
    }

    router.push(`/negotiate/${data.id}`)
    setLoading(false)
  }

  return (
    <button
      onClick={openNegotiation}
      disabled={loading}
      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap">
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <MessageSquare className="w-3.5 h-3.5" />}
      {existingNegotiationId ? 'Continue Negotiation' : 'Negotiate & Hire'}
    </button>
  )
}
