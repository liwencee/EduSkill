'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, BookOpen, LayoutDashboard, LogOut, ChevronDown, User } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { href: '/edupro',          label: 'For Teachers' },
  { href: '/skillup',         label: 'For Youth' },
  { href: '/opportunity-hub', label: 'Jobs' },
  { href: '/employer',        label: 'Employers' },
]

const ROLE_LABELS: Record<string, string> = {
  employer: 'Employer',
  teacher:  'Teacher',
  youth:    'Youth',
  admin:    'Admin',
}

const DASHBOARD_PATHS: Record<string, string> = {
  employer: '/dashboard/employer',
  teacher:  '/dashboard/teacher',
  youth:    '/dashboard/youth',
  admin:    '/admin',
}

export default function Navbar() {
  const [open,        setOpen]        = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const dashboardHref = user ? (DASHBOARD_PATHS[user.role] ?? '/dashboard/youth') : '/dashboard'
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 bg-[#4F46E5] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-white text-xl">SkillBridge</span>
            <span className="font-heading font-bold text-[#F97316] text-xl">Nigeria</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA — changes based on auth state */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              // Skeleton while auth resolves
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
            ) : user ? (
              // ── Logged-in user menu ───────────────────────────────────────
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white rounded-xl px-3 py-2 transition-colors text-sm font-medium">
                  {/* Avatar or initials */}
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName}
                      className="w-7 h-7 rounded-full object-cover border-2 border-white/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white/30">
                      {initials}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full text-white/90">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <p className="text-sm font-semibold text-[#1E1B4B] truncate">{user.fullName}</p>
                      </div>
                      <div className="py-1">
                        <Link href={dashboardHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                          Dashboard
                        </Link>
                        <Link href={user.role === 'teacher' ? '/dashboard/teacher/profile' : (user.role === 'employer' ? '/employer/post-job' : '/skillup/courses')}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                          <User className="w-4 h-4 text-indigo-500" />
                          {user.role === 'teacher' ? 'My Profile & KYC' : user.role === 'employer' ? 'Post a Job' : 'My Courses'}
                        </Link>
                      </div>
                      <div className="py-1 border-t border-gray-100">
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // ── Guest buttons ─────────────────────────────────────────────
              <>
                <Link href="/auth/login"
                  className="text-white/80 hover:text-white font-medium text-sm transition-colors cursor-pointer">
                  Log in
                </Link>
                <Link href="/auth/signup"
                  className="bg-[#F97316] text-white font-bold text-sm px-5 py-2.5 rounded-xl
                             border-[2px] border-orange-700/30 shadow-[0_4px_0_rgba(180,80,0,0.4)]
                             hover:shadow-[0_2px_0_rgba(180,80,0,0.4)] hover:translate-y-0.5
                             transition-all duration-150 cursor-pointer">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu"
            className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/20 bg-[#4338CA] px-4 py-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium transition-colors cursor-pointer">
              {l.label}
            </Link>
          ))}
          <hr className="border-white/20 my-3" />

          {!loading && user ? (
            // ── Logged-in mobile section ───────────────────────────────
            <>
              <div className="flex items-center gap-3 px-4 py-2">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white text-sm font-bold border-2 border-white/30">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white truncate">{user.fullName || user.email}</p>
                  <p className="text-xs text-white/60">{ROLE_LABELS[user.role] ?? user.role} account</p>
                </div>
              </div>
              <Link href={dashboardHref} onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium transition-colors cursor-pointer">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/20 font-medium transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            // ── Guest mobile section ───────────────────────────────────
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="block py-2.5 px-4 rounded-xl text-white/80 hover:text-white font-medium cursor-pointer">
                Log in
              </Link>
              <Link href="/auth/signup" onClick={() => setOpen(false)}
                className="block text-center bg-[#F97316] text-white font-bold py-3 px-4 rounded-xl
                           border-[2px] border-orange-700/30 shadow-[0_4px_0_rgba(180,80,0,0.4)] cursor-pointer">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
