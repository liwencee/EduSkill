'use client'
import { useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'

type UserRole = 'teacher' | 'employer' | 'youth' | 'admin'

const ROLE_HOME: Record<string, string> = {
  teacher:  '/dashboard/teacher',
  employer: '/dashboard/employer',
  youth:    '/dashboard/youth',
  admin:    '/admin',
}

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children:     React.ReactNode
  allowedRoles: UserRole[]
}) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`
      return
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      window.location.href = ROLE_HOME[user.role] ?? '/dashboard/youth'
    }
  }, [loading, user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return <>{children}</>
}
