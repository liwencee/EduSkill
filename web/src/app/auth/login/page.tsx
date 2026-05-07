'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    // Guard: check env vars are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast.error('Service is temporarily unavailable. Please try again later.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('Please verify your email first — check your inbox for the confirmation link.')
        } else if (
          error.message.toLowerCase().includes('invalid login') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          toast.error('Wrong email or password. Please try again.')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success('Welcome back! 👋')

      // Read role from user_metadata (set at signup) and redirect to right dashboard
      const role = data.user?.user_metadata?.role ?? 'youth'
      const destination = next !== '/dashboard' ? next : `/dashboard/${role}`
      router.replace(destination)

    } catch (err) {
      console.error('Login error:', err)
      toast.error('Could not connect. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
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

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E0DDD5] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-brand-ink mb-1">Welcome back</h1>
          <p className="text-brand-inkMid mb-6 text-sm">Log in to continue your learning journey</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPwd ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-inkLight hover:text-brand-inkMid">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-brand-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Log In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8E5DC]" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-brand-inkLight">or</span></div>
          </div>

          <p className="text-center text-sm text-brand-inkMid">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-brand-blue font-semibold hover:underline">Sign up free</Link>
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
