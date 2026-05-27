'use client'
import RoleGuard from '@/components/RoleGuard'

export default function YouthDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['youth']}>{children}</RoleGuard>
}
