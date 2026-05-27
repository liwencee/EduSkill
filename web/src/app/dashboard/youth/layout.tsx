import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function YouthDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?next=/dashboard/youth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'youth'

  if (role !== 'youth') {
    redirect(`/dashboard/${role}`)
  }

  return <>{children}</>
}
