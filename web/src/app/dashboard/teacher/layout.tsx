'use client'
import RoleGuard from '@/components/RoleGuard'

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      {children}
    </RoleGuard>
  )
}
