'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Pencil, Loader2, Check, X, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  courseId:        string
  instructorName:  string | null
  instructorEmail: string | null
}

/**
 * Links a course to its video creator (courses.instructor_id) by the creator's
 * Skillora account email. The creator then sees this course's sign-ups and
 * watch statistics on /dashboard/creator.
 */
export default function InstructorAssign({ courseId, instructorName, instructorEmail }: Props) {
  const [editing, setEditing] = useState(false)
  const [busy,    setBusy]    = useState(false)
  const [email,   setEmail]   = useState(instructorEmail ?? '')
  const router = useRouter()

  async function save() {
    setBusy(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('admin_assign_instructor', {
      p_course_id: courseId,
      p_email:     email.trim(),
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(data ? `Linked to ${data}` : 'Creator removed')
      setEditing(false)
      router.refresh()
    }
    setBusy(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="creator@email.com" autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          className="w-44 text-xs border border-[#D5D2C8] rounded-lg px-2 py-1"
        />
        <button onClick={save} disabled={busy} title="Save" className="p-1 rounded-lg hover:bg-green-100 text-green-600">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setEditing(false)} disabled={busy} title="Cancel" className="p-1 rounded-lg hover:bg-red-50 text-red-500">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return instructorName ? (
    <button onClick={() => setEditing(true)} title="Change creator"
      className="group inline-flex items-center gap-1.5 text-left">
      <span>
        <span className="block text-sm font-medium text-brand-ink">{instructorName}</span>
        {instructorEmail && <span className="block text-xs text-brand-inkLight">{instructorEmail}</span>}
      </span>
      <Pencil className="w-3 h-3 text-brand-inkLight opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  ) : (
    <button onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline">
      <UserPlus className="w-3.5 h-3.5" /> Link creator
    </button>
  )
}
