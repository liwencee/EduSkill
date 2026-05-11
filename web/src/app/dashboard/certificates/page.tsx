import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Award, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react'
import { CPD_COURSES } from '@/lib/static-cpd-courses'

export default function CertificatesPage() {
  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <Link href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#4F46E5] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#1E1B4B]">My Certificates</h1>
          <p className="text-gray-500 text-sm mt-1">Complete CPD courses to earn industry-recognised certificates</p>
        </div>

        {/* Empty state with course links */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-12 text-center mb-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Award className="w-10 h-10 text-[#4F46E5] opacity-40" />
          </div>
          <h2 className="text-xl font-bold text-[#1E1B4B] mb-2">No Certificates Yet</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Complete a CPD course on SkillBridge Nigeria to earn a verifiable digital certificate you can share with employers and add to your TRCN portfolio.
          </p>
          <Link href="/edupro/courses"
            className="inline-flex items-center gap-2 bg-[#4F46E5] text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
            <BookOpen className="w-4 h-4" /> Browse CPD Courses
          </Link>
        </div>

        {/* Available courses to earn certificates */}
        <div>
          <h2 className="font-bold text-[#1E1B4B] text-lg mb-4">Courses with CPD Certificates</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CPD_COURSES.map(c => (
              <Link
                key={c.slug}
                href={`/edupro/courses/${c.slug}`}
                className="bg-white rounded-2xl border border-indigo-100 p-5 hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-[#EEF2FF] rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E1B4B] text-sm group-hover:text-[#4F46E5] transition-colors">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.weeks} weeks · {c.total_lessons} lessons · Pass mark: {c.pass_mark}%</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#4F46E5] transition-colors shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
