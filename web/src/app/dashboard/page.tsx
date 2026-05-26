import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * /dashboard — server-side role-aware redirect.
 * Reads the user's role from the profiles table and sends them to
 * the correct dashboard. Falls back to /dashboard/youth if anything
 * is missing (unauthenticated → middleware catches first).
 */
export default async function DashboardPage() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/auth/login')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
      ?? (user.user_metadata?.role as string)
      ?? 'youth'

    redirect(`/dashboard/${role}`)
  } catch {
    redirect('/dashboard/youth')
  }
}
