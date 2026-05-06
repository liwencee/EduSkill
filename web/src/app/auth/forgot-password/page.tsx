'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-brand-ink text-xl">SkillBridge</span>
          <span className="font-bold text-brand-amber text-xl">Nigeria</span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#E0DDD5] shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-brand-ink mb-2">Check your inbox</h1>
              <p className="text-brand-inkMid text-sm mb-6">
                We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/auth/login"
                className="btn-primary w-full flex items-center justify-center gap-2">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login"
                className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-5">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
              <h1 className="text-2xl font-bold text-brand-ink mb-1">Reset your password</h1>
              <p className="text-brand-inkMid mb-6 text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">Email address</label>
                  <input id="email" type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input" placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
