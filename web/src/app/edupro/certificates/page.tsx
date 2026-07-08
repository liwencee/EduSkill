'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'
import TeacherOnlyGate from '@/components/TeacherOnlyGate'

// CPD certificates live on the shared certificates dashboard, but the entry
// point is teacher-only. Non-teachers get the gate; teachers are forwarded.
export default function EduProCertificatesPage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      window.location.replace('/dashboard/certificates')
    }
  }, [loading, user])

  return (
    <TeacherOnlyGate>
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    </TeacherOnlyGate>
  )
}
