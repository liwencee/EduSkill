'use client'
/**
 * RoleGuard — role-based route protection for Next.js App Router.
 *
 * States:
 *  loading=true          → spinner (never redirect while auth is resolving)
 *  user=null             → redirect /auth/login?next=<path>
 *  user.role not allowed → redirect to user's own dashboard (no re-login)
 *  user.role allowed     → render children
 */
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'

type UserRole = 'teacher' | 'employer' | 'youth' | 'admin'

const ROLE_HOME: Record<string, string> = {
  teacher:  '/dashboard/teacher',
  employer: '/dashboard/employer',
  youth:    '/dashboard/youth',
  admin:    '/admin',
}

interface Props {
  children:     React.ReactNode
  allowedRoles: UserRole[]
}

export default function RoleGuard({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return   // still reading session — never redirect yet

    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      // Logged in but wrong role → own dashboard, no re-login
      router.replace(ROLE_HOME[user.role] ?? '/dashboard')
    }
  }, [loading, user, allowedRoles, pathname, router])

  // ── Still loading → spinner (prevents any flash of login/wrong content) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // ── Not authed or wrong role → blank while redirect fires ────────────────
  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return <>{children}</>
}
