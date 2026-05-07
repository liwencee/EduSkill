'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function UpdatePasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  // Supabase puts the access token in the URL hash when the reset link is clicked.
  // We need to wait for the client-side session to be established from that hash.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
      } else {
        setDone(true)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-brand-ink text-xl">SkillBridge</span>
          <span className="font-bold text-brand-amber text-xl">Nigeria</span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#E0DDD5] shadow-sm p-8">

          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-brand-ink mb-2">Password updated!</h1>
              <p className="text-brand-inkMid text-sm mb-6">
                Your password has been changed. You can now log in with your new password.
              </p>
              <Link href="/auth/login"
                className="btn-primary w-full flex items-center justify-center gap-2">
                Go to Login
              </Link>
            </div>

          ) : hasSession === false ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-brand-ink mb-2">Link expired</h1>
              <p className="text-brand-inkMid text-sm mb-6">
                This password reset link has expired or already been used. Please request a new one.
              </p>
              <Link href="/auth/forgot-password"
                className="btn-primary w-full flex items-center justify-center gap-2">
                Request New Link
              </Link>
            </div>

          ) : (
            <>
              <h1 className="text-2xl font-bold text-brand-ink mb-1">Set new password</h1>
              <p className="text-brand-inkMid mb-6 text-sm">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="label" htmlFor="password">New Password</label>
                  <div className="relative">
                    <input id="password" type={showPwd ? 'text' : 'password'} required
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="input pr-10" placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-inkLight hover:text-brand-inkMid">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="confirm">Confirm New Password</label>
                  <input id="confirm" type={showPwd ? 'text' : 'password'} required
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    className="input" placeholder="Re-enter password" />
                </div>
                <button type="submit" disabled={loading || hasSession === null}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
