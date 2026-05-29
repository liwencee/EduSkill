import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TeacherChatClient from './TeacherChatClient'

interface Props { params: { applicationId: string } }

export default async function TeacherChatPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Verify this application belongs to the current teacher
  const { data: app } = await supabase
    .from('job_applications')
    .select(`
      id, status,
      job:job_listings(id, title, company_name)
    `)
    .eq('id', params.applicationId)
    .eq('applicant_id', user.id)
    .single()

  if (!app) notFound()

  // Load initial messages
  const { data: msgs } = await supabase
    .from('application_chats')
    .select('*, sender:profiles(full_name, avatar_url)')
    .eq('application_id', params.applicationId)
    .order('created_at', { ascending: true })

  const job = Array.isArray(app.job) ? app.job[0] : app.job

  return (
    <>
      <Navbar />
      <TeacherChatClient
        applicationId={params.applicationId}
        jobTitle={job?.title ?? 'Job Application'}
        companyName={job?.company_name ?? 'Employer'}
        currentUserId={user.id}
        initialMessages={(msgs ?? []) as any[]}
      />
    </>
  )
}
