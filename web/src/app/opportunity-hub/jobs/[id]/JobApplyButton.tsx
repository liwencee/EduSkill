'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Send, Loader2, CheckCircle, Lock, LogIn, RefreshCw } from 'lucide-react'

interface Props {
  jobId: string
  jobTitle: string
  companyName: string
  deadline?: string | null
  currentUserRole: string | null
  alreadyApplied: boolean
}

export default function JobApplyButton({
  jobId, jobTitle, companyName, deadline,
  currentUserRole: serverRole, alreadyApplied,
}: Props) {
  const [role,        setRole]        = useState<string | null>(serverRole)
  const [userId,      setUserId]      = useState<string | null>(null)
  const [authReady,   setAuthReady]   = useState(false)
  const [open,        setOpen]        = useState(false)
  const [coverNote,   setCoverNote]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [applied,     setApplied]     = useState(alreadyApplied)
  const [switching,   setSwitching]   = useState(false)

  const isExpired = deadline ? new Date(deadline) < new Date() : false

  // ── Always verify auth on client — server cookie reading can fail ───────────
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { setRole(null); setAuthReady(true); return }

      setUserId(user.id)

      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const freshRole = prof?.role ?? null
      setRole(freshRole)

      // Check existing application
      if (freshRole === 'teacher') {
        const { data: app } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('applicant_id', user.id)
          .maybeSingle()
        if (app) setApplied(true)
      }

      setAuthReady(true)
    }
    // Always run client-side — don't trust server-only role
    checkAuth()
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Switch existing account to teacher role ─────────────────────────────────
  async function switchToTeacher() {
    if (!userId) return
    setSwitching(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'teacher' })
      .eq('id', userId)

    if (error) {
      toast.error('Could not update your role: ' + error.message)
      setSwitching(false)
      return
    }

    // Ensure teacher_profiles row exists
    await supabase
      .from('teacher_profiles')
      .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })

    toast.success('Account switched to Teacher! You can now apply.')
    setRole('teacher')
    setSwitching(false)
  }

  // ── Apply handler ───────────────────────────────────────────────────────────
  async function handleApply() {
    if (!coverNote.trim()) { toast.error('Please write a short cover note'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please sign in first'); setSubmitting(false); return }

    const { data: tp } = await supabase
      .from('teacher_profiles')
      .select('teacher_uid, cert_type, years_of_service, has_badge')
      .eq('id', user.id)
      .single()

    const { error } = await supabase.from('job_applications').insert({
      job_id:                jobId,
      applicant_id:          user.id,
      cover_note:            coverNote.trim(),
      teacher_uid_snapshot:  tp?.teacher_uid        ?? null,
      cert_type_snapshot:    tp?.cert_type          ?? null,
      years_service_snapshot: tp?.years_of_service  ?? null,
      badge_snapshot:        tp?.has_badge          ?? false,
    })

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already applied for this job.')
        setApplied(true)
      } else {
        toast.error(error.message ?? 'Application failed')
      }
    } else {
      await supabase.rpc('increment_job_applications', { job_id: jobId })
      toast.success('Application submitted successfully!')
      setApplied(true)
      setOpen(false)
    }
    setSubmitting(false)
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!authReady) {
    return (
      <div className="card p-5 flex items-center justify-center gap-2 text-brand-inkLight">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking your account…</span>
      </div>
    )
  }

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!role || !userId) {
    return (
      <div className="card p-5 text-center">
        <LogIn className="w-8 h-8 text-brand-blue mx-auto mb-2" />
        <p className="text-sm font-semibold text-brand-ink mb-1">Sign in to apply</p>
        <p className="text-xs text-brand-inkLight mb-4">
          You must be signed in as a teacher to apply for this job.
        </p>
        <Link href="/auth/login" className="btn-primary w-full text-sm text-center block">
          Sign In
        </Link>
        <p className="text-xs text-brand-inkLight mt-3">
          No account?{' '}
          <Link href="/auth/signup?role=teacher" className="text-brand-blue underline font-medium">
            Create a teacher account
          </Link>
        </p>
      </div>
    )
  }

  // ── Logged in but not a teacher — offer role switch, not re-registration ────
  if (role !== 'teacher') {
    return (
      <div className="card p-5 text-center">
        <Lock className="w-8 h-8 text-brand-inkLight mx-auto mb-2" />
        <p className="text-sm font-semibold text-brand-ink mb-2">Teacher Account Required</p>
        <p className="text-xs text-brand-inkLight mb-4">
          Your account is currently set to <strong>{role}</strong>. Switch it to
          a Teacher account — no new sign-up needed.
        </p>
        <button
          onClick={switchToTeacher}
          disabled={switching}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
          {switching
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Switching…</>
            : <><RefreshCw className="w-4 h-4" /> Switch to Teacher Account</>}
        </button>
        <p className="text-xs text-brand-inkLight mt-3">
          You can complete your teacher KYC from your{' '}
          <Link href="/dashboard/teacher/profile" className="text-brand-blue underline">
            profile page
          </Link>{' '}
          after switching.
        </p>
      </div>
    )
  }

  // ── Deadline passed ─────────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="card p-5 text-center">
        <p className="text-sm font-semibold text-brand-ink mb-1">Application Closed</p>
        <p className="text-xs text-brand-inkLight">The deadline for this job has passed.</p>
      </div>
    )
  }

  // ── Already applied ─────────────────────────────────────────────────────────
  if (applied) {
    return (
      <div className="card p-5 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-brand-ink mb-1">Application Submitted</p>
        <p className="text-xs text-brand-inkLight">
          You have already applied for this position. The employer will be in touch.
        </p>
      </div>
    )
  }

  // ── Apply form ──────────────────────────────────────────────────────────────
  return (
    <div className="card p-5">
      <h3 className="font-bold text-brand-ink mb-1 text-sm">Apply for this Job</h3>
      <p className="text-xs text-brand-inkLight mb-4">{jobTitle} · {companyName}</p>

      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary w-full text-sm">
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
              placeholder={`Tell ${companyName} why you're the right teacher for this role. Mention your experience, certifications, and what you can bring…`}
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              maxLength={800}
            />
            <p className="text-xs text-brand-inkLight text-right mt-1">{coverNote.length}/800</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-brand-inkMid transition-colors">
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={submitting}
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
