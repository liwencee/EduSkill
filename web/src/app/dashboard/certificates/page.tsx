import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Award, Download, ExternalLink, BookOpen, ArrowLeft, Star } from 'lucide-react'

export default async function CertificatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard/certificates')

  const { data: certs } = await supabase
    .from('certificates')
    .select('*, course:courses(title, category, slug)')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles').select('full_name, role').eq('id', user.id).single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Learner'
  const fullName = profile?.full_name ?? 'SkillBridge Graduate'

  const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Business':    { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
    'Tech':        { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
    'Agriculture': { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200'  },
    'Creative':    { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200'   },
    'Trades':      { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
    'Digital':     { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  }

  function getColors(category?: string) {
    return CATEGORY_COLORS[category ?? ''] ?? { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#4F46E5] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1E1B4B]">My Certificates</h1>
              <p className="text-gray-500 text-sm mt-1">
                {certs && certs.length > 0
                  ? `${certs.length} certificate${certs.length !== 1 ? 's' : ''} earned — showcasing your verified skills`
                  : 'Complete courses to earn industry-recognised certificates'}
              </p>
            </div>
            {certs && certs.length > 0 && (
              <div className="flex items-center gap-2 bg-white border border-indigo-100 rounded-xl px-4 py-2 shadow-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                <span className="text-sm font-bold text-[#1E1B4B]">{certs.length} Verified Skills</span>
              </div>
            )}
          </div>
        </div>

        {certs && certs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certs.map((cert: any) => {
              const colors = getColors(cert.course?.category)
              const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'long', year: 'numeric'
              })
              return (
                <div key={cert.id}
                  className={`bg-white rounded-2xl border ${colors.border} shadow-sm overflow-hidden flex flex-col`}>

                  {/* Certificate top strip */}
                  <div className={`${colors.bg} px-5 py-4 border-b ${colors.border}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0`}>
                        <Award className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wide ${colors.text} bg-white px-2 py-0.5 rounded-full border ${colors.border}`}>
                        Certified
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm mt-3 ${colors.text} leading-tight`}>
                      {cert.course?.title ?? 'SkillBridge Course'}
                    </h3>
                  </div>

                  {/* Certificate body */}
                  <div className="px-5 py-4 flex-1">
                    <p className="text-xs text-gray-500 mb-1">Awarded to</p>
                    <p className="font-semibold text-[#1E1B4B] text-sm">{fullName}</p>

                    <p className="text-xs text-gray-500 mt-3 mb-1">Date Issued</p>
                    <p className="text-sm text-[#1E1B4B] font-medium">{issuedDate}</p>

                    {cert.cert_id && (
                      <>
                        <p className="text-xs text-gray-500 mt-3 mb-1">Certificate ID</p>
                        <p className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded-lg truncate">
                          {cert.cert_id}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-4 flex gap-2">
                    {cert.pdf_url ? (
                      <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer"
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl ${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80 transition-opacity`}>
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </a>
                    ) : (
                      <button disabled
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed">
                        <Download className="w-3.5 h-3.5" /> PDF Soon
                      </button>
                    )}
                    {cert.course?.slug && (
                      <Link href={`/skillup/courses/${cert.course.slug}`}
                        className="inline-flex items-center justify-center gap-1 text-xs font-bold py-2 px-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-[#4F46E5] hover:border-indigo-200 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Award className="w-10 h-10 text-[#4F46E5] opacity-40" />
            </div>
            <h2 className="text-xl font-bold text-[#1E1B4B] mb-2">No Certificates Yet</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Complete a course on SkillBridge Nigeria to earn a nationally-recognised digital certificate you can share with employers.
            </p>
            <Link href="/skillup/courses"
              className="inline-flex items-center gap-2 bg-[#4F46E5] text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              <BookOpen className="w-4 h-4" /> Browse Courses
            </Link>
          </div>
        )}

        {/* Info Banner */}
        {certs && certs.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-[#1E1B4B] to-[#4F46E5] rounded-2xl p-5 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm mb-1">Share your achievements with employers 🎯</p>
              <p className="text-white/70 text-xs">Your certificates are verified on our platform. Share your profile link with potential employers.</p>
            </div>
            <Link href="/opportunity-hub"
              className="inline-flex items-center gap-2 bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors whitespace-nowrap">
              Find Opportunities <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
