'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useFormState, useFormStatus } from 'react-dom'
import { loginAction } from './actions'
import toast from 'react-hot-toast'

/** Submit button reads pending state from the parent <form> automatically */
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full flex items-center justify-center gap-2"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? 'Signing in…' : 'Log In'}
    </button>
  )
}

function LoginForm() {
  const params = useSearchParams()
  const next   = params.get('next') ?? '/dashboard'

  const [showPwd, setShowPwd] = useState(false)
  const [state, formAction]   = useFormState(loginAction, null)

  // Show toast whenever the server action returns an error
  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

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
          <h1 className="text-2xl font-bold text-brand-ink mb-1">Welcome back</h1>
          <p className="text-brand-inkMid mb-6 text-sm">Log in to continue your learning journey</p>

          {/* Hidden next param so the server action knows where to redirect */}
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />

            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email" name="email" type="email" required
                className="input" placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPwd ? 'text' : 'password'} required
                  className="input pr-10" placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-inkLight hover:text-brand-inkMid"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-brand-blue hover:underline">
                Forgot password?
              </Link>
            </div>

            <SubmitButton />
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
            <Link href="/auth/signup" className="text-brand-blue font-semibold hover:underline">
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
