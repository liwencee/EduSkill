'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Lock, Loader2, GraduationCap, LogIn, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'

/**
 * Restricts its children to registered teachers.
 *  - not signed in  → prompt to log in / register as a teacher
 *  - signed in, not a teacher → offer a one-click switch to a Teacher account
 *  - teacher → renders children
 */
export default function TeacherOnlyGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [switching, setSwitching] = useState(false)

  async function switchToTeacher() {
    if (!user) return
    setSwitching(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'teacher' })
      .eq('id', user.id)

    if (error) {
      toast.error('Could not update your role: ' + error.message)
      setSwitching(false)
      return
    }

    // Ensure a teacher_profiles row exists
    await supabase
      .from('teacher_profiles')
      .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

    toast.success('Welcome, Teacher! Loading your resources…')
    // Hard reload so AuthProvider + server components pick up the new role
    window.location.reload()
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  // ── Teacher — allow through ─────────────────────────────────────────────────
  if (user && user.role === 'teacher') {
    return <>{children}</>
  }

  // ── Gate (guest or non-teacher) ─────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] bg-brand-bg flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E0DDD5] shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-brand-blueLight rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-brand-blue" />
          </div>

          <h1 className="text-2xl font-bold text-brand-ink mb-2">For Teachers Only</h1>

          {!user ? (
            <>
              <p className="text-brand-inkMid text-sm mb-6 leading-relaxed">
                CPD courses, the teacher community, and CPD certificates are exclusive
                to registered teachers. Sign in or create a free teacher account to continue.
              </p>
              <div className="space-y-3">
                <Link href="/auth/signup?role=teacher"
                  className="btn-primary w-full inline-flex items-center justify-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Register as a Teacher
                </Link>
                <Link href="/auth/login"
                  className="w-full inline-flex items-center justify-center gap-2 border-2 border-brand-blue text-brand-blue font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-blueLight transition-colors text-sm">
                  <LogIn className="w-4 h-4" /> Log In
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-brand-inkMid text-sm mb-6 leading-relaxed">
                Your account is currently set to <strong>{user.role}</strong>. Switch to a
                Teacher account — no new sign-up needed — to access CPD courses, the
                community, and certificates.
              </p>
              <button
                onClick={switchToTeacher}
                disabled={switching}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
                {switching
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Switching…</>
                  : <><RefreshCw className="w-4 h-4" /> Switch to Teacher Account</>}
              </button>
              <p className="text-xs text-brand-inkLight mt-4">
                You can complete your teacher KYC anytime from your{' '}
                <Link href="/dashboard/teacher/profile" className="text-brand-blue underline">
                  profile page
                </Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
