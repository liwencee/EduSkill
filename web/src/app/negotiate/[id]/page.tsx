import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import NegotiateClient from './NegotiateClient'

interface Props { params: { id: string } }

export default async function NegotiatePage({ params }: Props) {
  const supabase = createClient()

  let negotiation: any = null
  let messages: any[]  = []
  let currentUserId    = ''
  let currentUserRole  = ''

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')
    currentUserId = user.id

    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    currentUserRole = prof?.role ?? 'teacher'

    const { data: neg, error } = await supabase
      .from('job_negotiations')
      .select(`
        *,
        job:job_listings(id, title, company_name, salary_min_ngn, salary_max_ngn, rate_type, job_type, description),
        teacher:profiles!job_negotiations_teacher_id_fkey(id, full_name, avatar_url, email, phone),
        employer:profiles!job_negotiations_employer_id_fkey(id, full_name, avatar_url, email, phone),
        teacher_profile:teacher_profiles!job_negotiations_teacher_id_fkey(
          teacher_uid, cert_type, cert_verified, years_of_service,
          has_badge, badge_type, kyc_status, avg_rating, total_ratings,
          total_jobs_completed, subject_areas, subject_specialization
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !neg) notFound()

    // Access check — only the two parties
    if (neg.teacher_id !== user.id && neg.employer_id !== user.id) {
      redirect('/dashboard')
    }

    negotiation = neg

    const { data: msgs } = await supabase
      .from('negotiation_messages')
      .select('*, sender:profiles(id, full_name, avatar_url)')
      .eq('negotiation_id', params.id)
      .order('created_at', { ascending: true })

    messages = msgs ?? []
  } catch (e: any) {
    if (e?.digest?.startsWith('NEXT_REDIRECT') || e?.digest?.startsWith('NEXT_NOT_FOUND')) throw e
    notFound()
  }

  return (
    <>
      <Navbar />
      <NegotiateClient
        negotiation={negotiation}
        initialMessages={messages}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </>
  )
}
