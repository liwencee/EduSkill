'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ROLE_HOME: Record<string, string> = {
  teacher:  '/dashboard/teacher',
  employer: '/dashboard/employer',
  youth:    '/dashboard/youth',
  admin:    '/admin',
}

function LoginForm() {
  const params  = useSearchParams()
  const next    = params.get('next') ?? ''

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email:    email.trim().toLowerCase(),
          password,
        })

      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes('email not confirmed')) {
          setError('Please verify your email first — check your inbox.')
        } else if (
          msg.includes('invalid login') ||
          msg.includes('invalid credentials') ||
          msg.includes('invalid email or password')
        ) {
          setError('Wrong email or password. Please try again.')
        } else {
          setError(authError.message || 'Login failed. Please try again.')
        }
        setLoading(false)
        return
      }

      if (!data.user || !data.session) {
        setError('Login failed — no session returned. Please try again.')
        setLoading(false)
        return
      }

      // Use metadata role (set at signup, no extra DB call needed here).
      // Server layouts will verify the real role from profiles.
      const role = (data.user.user_metadata?.role as string) ?? 'youth'
      const destination = (next && next !== '/dashboard')
        ? next
        : (ROLE_HOME[role] ?? '/dashboard/youth')

      // Hard navigation so the browser flushes the Supabase cookie BEFORE
      // the next request hits the server. router.push() (soft nav) races
      // against the async cookie write and the server sees no session.
      window.location.href = destination

    } catch (err: unknown) {
      // Log the real cause for developers (e.g. missing Supabase env vars) —
      // never show raw internal error text to a real user on the login form.
      console.error('[Skillora] Login failed:', err)
      setError('Something went wrong. Please try again in a moment.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <Link href="/" className="flex items-center justify-center mb-8">
          <Image src="/Skillora.png" alt="Skillora" width={160} height={42} className="h-10 w-auto" />
        </Link>

        <div className="bg-white rounded-2xl border border-[#E0DDD5] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-brand-ink mb-1">Welcome back</h1>
          <p className="text-brand-inkMid mb-6 text-sm">
            Log in to continue your learning journey
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email" type="email" required
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'} required
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-inkLight hover:text-brand-inkMid"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password"
                className="text-sm text-brand-blue hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in…</>
                : 'Log In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E5DC]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-brand-inkLight">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-brand-inkMid">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup"
              className="text-brand-blue font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
