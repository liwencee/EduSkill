'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Send, Loader2, CheckCircle, Lock, LogIn } from 'lucide-react'

interface Props {
  jobId: string
  jobTitle: string
  companyName: string
  deadline?: string | null
  currentUserRole: string | null
  alreadyApplied: boolean
}

export default function JobApplyButton({
  jobId, jobTitle, companyName, deadline, currentUserRole, alreadyApplied,
}: Props) {
  const [open,     setOpen]     = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [applied,   setApplied]   = useState(alreadyApplied)

  const isExpired = deadline ? new Date(deadline) < new Date() : false

  async function handleApply() {
    if (!coverNote.trim()) { toast.error('Please write a short cover note'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please sign in first'); setSubmitting(false); return }

    // Ensure teacher_profiles row + snapshot data
    const { data: tp } = await supabase
      .from('teacher_profiles')
      .select('teacher_uid, cert_type, years_of_service, has_badge')
      .eq('id', user.id)
      .single()

    const { error } = await supabase.from('job_applications').insert({
      job_id:               jobId,
      applicant_id:         user.id,
      cover_note:           coverNote.trim(),
      teacher_uid_snapshot: tp?.teacher_uid  ?? null,
      cert_type_snapshot:   tp?.cert_type    ?? null,
      years_service_snapshot: tp?.years_of_service ?? null,
      badge_snapshot:       tp?.has_badge    ?? false,
    })

    if (error) {
      if (error.code === '23505') toast.error('You have already applied for this job.')
      else toast.error(error.message ?? 'Application failed')
    } else {
      // Increment applications counter
      await supabase.rpc('increment_job_applications', { job_id: jobId })
      toast.success('Application submitted successfully!')
      setApplied(true)
      setOpen(false)
    }
    setSubmitting(false)
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!currentUserRole) {
    return (
      <div className="card p-5 text-center">
        <LogIn className="w-8 h-8 text-brand-blue mx-auto mb-2" />
        <p className="text-sm font-semibold text-brand-ink mb-1">Sign in to apply</p>
        <p className="text-xs text-brand-inkLight mb-4">You must be a registered teacher to apply for this job.</p>
        <Link href="/auth/signin"
          className="btn-primary w-full text-sm text-center block">Sign In</Link>
      </div>
    )
  }

  // ── Not a teacher ─────────────────────────────────────────────────────────
  if (currentUserRole !== 'teacher') {
    return (
      <div className="card p-5 text-center">
        <Lock className="w-8 h-8 text-brand-inkLight mx-auto mb-2" />
        <p className="text-sm font-semibold text-brand-ink mb-1">Teachers Only</p>
        <p className="text-xs text-brand-inkLight">
          Job applications on EduSkill are exclusively for verified teachers.
          {currentUserRole === 'youth' && ' Register as a teacher to apply.'}
        </p>
      </div>
    )
  }

  // ── Deadline passed ───────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="card p-5 text-center">
        <p className="text-sm font-semibold text-brand-ink mb-1">Application Closed</p>
        <p className="text-xs text-brand-inkLight">The deadline for this job has passed.</p>
      </div>
    )
  }

  // ── Already applied ───────────────────────────────────────────────────────
  if (applied) {
    return (
      <div className="card p-5 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-brand-ink mb-1">Application Submitted</p>
        <p className="text-xs text-brand-inkLight">You have already applied for this position. The employer will be in touch.</p>
      </div>
    )
  }

  // ── Apply form ────────────────────────────────────────────────────────────
  return (
    <div className="card p-5">
      <h3 className="font-bold text-brand-ink mb-1 text-sm">Apply for this Job</h3>
      <p className="text-xs text-brand-inkLight mb-4">{jobTitle} · {companyName}</p>

      {!open ? (
        <button onClick={() => setOpen(true)}
          className="btn-primary w-full text-sm">
          Apply Now
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-brand-inkMid mb-1">
              Cover Note <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              className="input resize-none text-sm"
              placeholder={`Tell ${companyName} why you're the right teacher for this role. Mention your experience, certifications, and what you can bring to the role…`}
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              maxLength={800}
            />
            <p className="text-xs text-brand-inkLight text-right mt-1">{coverNote.length}/800</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-brand-inkMid transition-colors">
              Cancel
            </button>
            <button onClick={handleApply} disabled={submitting}
              className="flex-1 btn-primary text-sm flex items-center justify-center gap-2">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                : <><Send className="w-4 h-4" /> Submit</>}
            </button>
          </div>
          <p className="text-xs text-brand-inkLight text-center">
            Your profile, badge, and certificate details will be shared with the employer.
          </p>
        </div>
      )}
    </div>
  )
}
