'use client'
/**
 * RoleGuard — Next.js equivalent of the React Router `RoleRoute` pattern.
 *
 * Wraps a page (or layout) so that:
 *  1. While auth is loading → show a full-screen spinner (no flash of content)
 *  2. Not logged in         → redirect to /auth/login?next=<current path>
 *  3. Wrong role            → redirect silently to the user's OWN dashboard
 *  4. Correct role          → render children normally
 *
 * Usage (in a layout.tsx):
 *   <RoleGuard allowedRoles={['teacher']}>
 *     {children}
 *   </RoleGuard>
 */
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'

type UserRole = 'teacher' | 'employer' | 'youth' | 'admin'

/** Where each role lives — matches dashboard/page.tsx and Navbar */
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
    if (loading) return                // still reading context — wait

    if (!user) {
      // Not logged in → send to login, remember where they were going
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      // Logged in but wrong role → send to their own dashboard (no re-login)
      router.replace(ROLE_HOME[user.role] ?? '/dashboard')
    }
  }, [loading, user, allowedRoles, pathname, router])

  // ── Render states ────────────────────────────────────────────────────────

  // 1. Auth not resolved yet — show spinner (prevents "flash of wrong content")
  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // 2. Not logged in — redirect running in useEffect, render nothing
  if (!user) return null

  // 3. Wrong role — redirect running in useEffect, render nothing
  if (!allowedRoles.includes(user.role as UserRole)) return null

  // 4. Correct role — show the page
  return <>{children}</>
}
