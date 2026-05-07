import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Award, BookOpen, ArrowLeft } from 'lucide-react'

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
          <p className="text-gray-500 text-sm mt-1">Complete courses to earn industry-recognised certificates</p>
        </div>

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
      </div>
    </div>
  )
}
