import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export const metadata = { title: 'Admin — Skillora CMS' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hard gate: must be signed in AND have role = 'admin'
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) redirect('/auth/login?next=/admin')

    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!prof || prof.role !== 'admin') redirect('/dashboard')
  } catch (e: any) {
    if (e?.digest?.startsWith('NEXT_REDIRECT') || e?.digest?.startsWith('NEXT_NOT_FOUND')) throw e
    redirect('/auth/login?next=/admin')
  }

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
