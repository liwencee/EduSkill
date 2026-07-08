import { createClient } from '@/lib/supabase/server'
import { redirect }      from 'next/navigation'
import Navbar            from '@/components/Navbar'
import Link              from 'next/link'
import { ArrowLeft, MessageSquare, Briefcase } from 'lucide-react'

export default async function TeacherMessagesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch all applications for this teacher that have at least one chat message
  const { data: apps } = await supabase
    .from('job_applications')
    .select(`
      id, status, applied_at,
      job:job_listings(id, title, company_name, employer_id),
      chats:application_chats(id, body, created_at, sender_id)
    `)
    .eq('applicant_id', user.id)
    .order('applied_at', { ascending: false })

  // Only show applications that have chats, sorted by latest message
  const withChats = (apps ?? [])
    .filter((a: any) => Array.isArray(a.chats) && a.chats.length > 0)
    .sort((a: any, b: any) => {
      const aLast = a.chats[a.chats.length - 1]?.created_at ?? ''
      const bLast = b.chats[b.chats.length - 1]?.created_at ?? ''
      return bLast.localeCompare(aLast)
    })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#EBF4FF]">
        <div className="max-w-2xl mx-auto px-4 py-8">

          <Link href="/dashboard/teacher"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" /> Teacher Dashboard
          </Link>

          <h1 className="text-2xl font-bold text-[#1E4F8A] mb-1">Messages</h1>
          <p className="text-sm text-gray-500 mb-6">
            Conversations with employers about your job applications.
          </p>

          {withChats.length === 0 ? (
            <div className="bg-white rounded-2xl border border-blue-100 p-14 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-blue-300" />
              </div>
              <p className="font-semibold text-[#1E4F8A] mb-1">No messages yet</p>
              <p className="text-sm text-gray-400">
                Employers will appear here once they message you about an application.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {withChats.map((app: any) => {
                const job     = Array.isArray(app.job) ? app.job[0] : app.job
                const chats   = app.chats as any[]
                const last    = chats[chats.length - 1]
                const unread  = chats.filter((c: any) => c.sender_id !== user.id).length

                return (
                  <Link
                    key={app.id}
                    href={`/dashboard/teacher/messages/${app.id}`}
                    className="flex items-start gap-4 bg-white rounded-2xl border border-blue-100 shadow-sm px-5 py-4 hover:bg-blue-50 transition-colors group">

                    <div className="w-11 h-11 bg-[#378ADD] rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="font-bold text-[#1E4F8A] text-sm truncate group-hover:text-[#378ADD]">
                          {job?.title ?? 'Job Application'}
                        </p>
                        {last?.created_at && (
                          <span className="text-xs text-gray-400 shrink-0">
                            {new Date(last.created_at).toLocaleDateString('en-NG', {
                              day: 'numeric', month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1 truncate">
                        {job?.company_name ?? 'Employer'}
                      </p>
                      {last?.body && (
                        <p className="text-sm text-gray-600 truncate">
                          {last.sender_id === user.id ? 'You: ' : ''}
                          {last.body}
                        </p>
                      )}
                    </div>

                    {unread > 0 && (
                      <span className="w-5 h-5 bg-[#378ADD] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
