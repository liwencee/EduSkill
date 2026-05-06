import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard')

  // Read role from profile, fall back to user_metadata set at signup
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'youth'

  if (role === 'teacher')  redirect('/dashboard/teacher')
  if (role === 'employer') redirect('/dashboard/employer')
  redirect('/dashboard/youth')
}
