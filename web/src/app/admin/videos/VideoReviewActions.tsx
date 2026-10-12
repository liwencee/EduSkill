'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function VideoReviewActions({ submissionId }: { submissionId: string }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  async function review(approve: boolean) {
    if (!approve && !note.trim()) {
      toast.error('Add a note so the creator knows what to change')
      return
    }
    setBusy(approve ? 'approve' : 'reject')
    const { error } = await createClient().rpc('admin_review_video_submission', {
      p_id: submissionId, p_approve: approve, p_note: note.trim() || null,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(approve ? 'Approved. The video is now live on the lesson.' : 'Rejected. The creator will see your note.')
      router.refresh()
    }
    setBusy(null)
  }

  return (
    <div className="space-y-2">
      <textarea
        id={`note-${submissionId}`}
        rows={2} maxLength={1000} value={note} onChange={e => setNote(e.target.value)}
        placeholder="Note to the creator (required to reject)"
        className="w-full text-sm border border-[#D5D2C8] rounded-xl px-3 py-2"
      />
      <div className="flex gap-2">
        <button onClick={() => review(true)} disabled={!!busy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50">
          {busy === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
        </button>
        <button onClick={() => review(false)} disabled={!!busy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-red-200 text-red-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-red-50 disabled:opacity-50">
          {busy === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Reject
        </button>
      </div>
    </div>
  )
}
