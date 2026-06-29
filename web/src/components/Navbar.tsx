'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Menu, X, LayoutDashboard, LogOut, ChevronDown, User, Bell } from 'lucide-react'
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

interface Notification {
  id: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export default function Navbar() {
  const [open,           setOpen]           = useState(false)
  const [userMenuOpen,   setUserMenuOpen]   = useState(false)
  const [bellOpen,       setBellOpen]       = useState(false)
  const [notifications,  setNotifications]  = useState<Notification[]>([])
  const bellRef = useRef<HTMLDivElement>(null)

  const { user, loading } = useAuth()
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.is_read).length

  // ── Load & subscribe to notifications (employer only) ──────────────────────
  useEffect(() => {
    if (!user || user.role !== 'employer') return

    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('id, title, body, link, is_read, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setNotifications(data as Notification[])
    }
    load()

    const channel = supabase
      .channel('navbar-notifications')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // ── Mark all as read when bell opens ───────────────────────────────────────
  async function openBell() {
    setBellOpen(v => !v)
    if (unreadCount === 0) return
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user!.id)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

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
            <Image src="/Skillora.png" alt="Skillora" width={140} height={36} className="h-9 w-auto" priority />
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
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
            ) : user ? (
              <>
                {/* ── Notification Bell (employer only) ── */}
                {user.role === 'employer' && (
                  <div className="relative" ref={bellRef}>
                    <button
                      onClick={openBell}
                      className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors">
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {bellOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden z-20">
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="font-bold text-sm text-[#1E1B4B]">Notifications</p>
                            {notifications.length > 0 && (
                              <Link href="/employer/applicants" onClick={() => setBellOpen(false)}
                                className="text-xs text-indigo-500 hover:underline">
                                View all applicants →
                              </Link>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-center">
                                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No notifications yet</p>
                              </div>
                            ) : (
                              notifications.map(n => (
                                <Link
                                  key={n.id}
                                  href={n.link ?? '/employer/applicants'}
                                  onClick={() => setBellOpen(false)}
                                  className={`flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-indigo-50/60' : ''}`}>
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#1E1B4B] leading-tight">{n.title}</p>
                                    {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      {new Date(n.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── User menu ── */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white rounded-xl px-3 py-2 transition-colors text-sm font-medium">
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
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
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
              </>
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
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile bell (employer) */}
            {!loading && user?.role === 'employer' && (
              <button onClick={openBell}
                className="relative p-2 rounded-xl hover:bg-white/10 text-white transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu"
              className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile notification dropdown */}
      {bellOpen && user?.role === 'employer' && (
        <div className="md:hidden border-t border-white/20 bg-white px-4 py-3 max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No notifications yet</p>
          ) : (
            notifications.map(n => (
              <Link key={n.id} href={n.link ?? '/employer/applicants'}
                onClick={() => setBellOpen(false)}
                className={`flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 ${!n.is_read ? 'opacity-100' : 'opacity-70'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-sm font-semibold text-[#1E1B4B]">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

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
