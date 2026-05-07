'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Eye, EyeOff, AlertCircle, GraduationCap, Users, Briefcase } from 'lucide-react'
import { signupAction } from './actions'
import type { UserRole } from '@/types'

const ROLES: { role: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
  { role: 'youth',    label: 'Youth Learner',  desc: 'Learn vocational & digital skills',  icon: GraduationCap },
  { role: 'teacher',  label: 'Teacher',         desc: 'CPD courses & AI lesson planning',   icon: Users         },
  { role: 'employer', label: 'Employer / SME',  desc: 'Find skilled, certified graduates',  icon: Briefcase     },
]

function SignupForm() {
  const params      = useSearchParams()
  const defaultRole = (params.get('role') as UserRole) ?? 'youth'
  const errorMsg    = params.get('error') ?? ''

  const [role,    setRole]    = useState<UserRole>(defaultRole)
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-brand-ink text-xl">SkillBridge</span>
          <span className="font-bold text-brand-amber text-xl">Nigeria</span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#E0DDD5] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-brand-ink mb-1">Create your account</h1>
          <p className="text-brand-inkMid mb-6 text-sm">Free to start. No credit card needed.</p>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Role picker — updates the hidden field in the form */}
          <div className="mb-6">
            <p className="label mb-3">I am joining as…</p>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map(r => (
                <button key={r.role} type="button" onClick={() => setRole(r.role)}
                  className={`border-2 rounded-xl p-3 text-center transition-all ${
                    role === r.role
                      ? 'border-brand-blue bg-brand-blueLight'
                      : 'border-[#E0DDD5] bg-white hover:border-brand-blue/30'
                  }`}>
                  <r.icon className={`w-6 h-6 mx-auto mb-1 ${role === r.role ? 'text-brand-blue' : 'text-brand-inkLight'}`} />
                  <p className="text-xs font-semibold text-brand-ink">{r.label}</p>
                  <p className="text-xs text-brand-inkLight hidden sm:block">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form action={signupAction} className="space-y-4">
            <input type="hidden" name="role" value={role} />

            <div>
              <label className="label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName" name="fullName" type="text" required
                className="input" placeholder="Adaeze Okonkwo"
                autoComplete="name"
              />
            </div>
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
                  className="input pr-10" placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-inkLight hover:text-brand-inkMid">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Create Free Account
            </button>
          </form>

          <p className="text-center text-xs text-brand-inkLight mt-4">
            By signing up you agree to our{' '}
            <Link href="/terms" className="text-brand-blue hover:underline">Terms</Link> and{' '}
            <Link href="/privacy" className="text-brand-blue hover:underline">Privacy Policy</Link>
          </p>
          <p className="text-center text-sm text-brand-inkMid mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-blue font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
