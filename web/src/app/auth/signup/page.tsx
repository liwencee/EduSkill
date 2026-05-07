'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Eye, EyeOff, Loader2, GraduationCap, Users, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

const ROLES: {
  role: UserRole; label: string; desc: string; icon: React.ElementType
}[] = [
  { role: 'youth',    label: 'Youth Learner',  desc: 'Learn vocational & digital skills',  icon: GraduationCap },
  { role: 'teacher',  label: 'Teacher',         desc: 'CPD courses & AI lesson planning',   icon: Users         },
  { role: 'employer', label: 'Employer / SME',  desc: 'Find skilled, certified graduates',  icon: Briefcase     },
]

function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = (params.get('role') as UserRole) ?? 'youth'

  const [role, setRole]         = useState<UserRole>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }

    // Guard: check env vars are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast.error('Service is temporarily unavailable. Please try again later.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          toast.error('An account with this email already exists. Try logging in.')
        } else {
          toast.error(error.message)
        }
        return
      }

      if (data.session) {
        // Email confirmation disabled — user is immediately logged in
        toast.success('Account created! Welcome to SkillBridge Nigeria 🎉')
        router.replace(`/dashboard/${role}`)
      } else {
        // Email confirmation required
        toast.success('Account created! Check your email to verify your account.')
        router.replace('/auth/verify-email')
      }
    } catch (err) {
      console.error('Signup error:', err)
      toast.error('Could not connect. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

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

          {/* Role selection */}
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                className="input" placeholder="Adaeze Okonkwo" />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-inkLight hover:text-brand-inkMid">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account…' : 'Create Free Account'}
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
