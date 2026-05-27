import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?next=/dashboard/teacher')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'youth'

  if (role !== 'teacher') {
    redirect(`/dashboard/${role}`)
  }

  return <>{children}</>
}
