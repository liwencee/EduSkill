import Link from 'next/link'
import { FileQuestion, Home, BookOpen, Briefcase } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        {/* Large 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] font-black text-[#378ADD]/10 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-[#378ADD]" />
            </div>
          </div>
        </div>

        {/* Copy */}
        <h1 className="text-2xl font-bold text-[#2C2C2A] mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Use the links below to find your way back.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link href="/"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-4 hover:border-[#378ADD] hover:shadow-sm transition-all group">
            <Home className="w-5 h-5 text-[#378ADD]" />
            <span className="text-xs font-semibold text-[#2C2C2A] group-hover:text-[#378ADD]">Homepage</span>
          </Link>

          <Link href="/edupro"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-4 hover:border-[#378ADD] hover:shadow-sm transition-all group">
            <BookOpen className="w-5 h-5 text-[#378ADD]" />
            <span className="text-xs font-semibold text-[#2C2C2A] group-hover:text-[#378ADD]">EduPro</span>
          </Link>

          <Link href="/opportunity-hub"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-4 hover:border-[#378ADD] hover:shadow-sm transition-all group">
            <Briefcase className="w-5 h-5 text-[#378ADD]" />
            <span className="text-xs font-semibold text-[#2C2C2A] group-hover:text-[#378ADD]">Jobs</span>
          </Link>
        </div>

        {/* Brand strip */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#378ADD]" />
          <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
            EduSkill Nigeria
          </span>
          <div className="w-2 h-2 rounded-full bg-[#F37321]" />
        </div>

      </div>
    </main>
  )
}
