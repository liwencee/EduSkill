import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, Star, Download, Globe } from 'lucide-react'
import type { Course } from '@/types'

interface Props {
  course: Course
  showEnroll?: boolean
}

const LANG_LABELS: Record<string, string> = { en: 'English', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa', pcm: 'Pidgin' }
const CATEGORY_COLORS: Record<string, string> = {
  digital_marketing: 'badge-blue',
  coding: 'badge-blue',
  fashion_design: 'badge-amber',
  solar_tech: 'badge-green',
  agribusiness: 'badge-green',
  financial_literacy: 'badge-amber',
  digital_classroom: 'badge-blue',
  vocational_teaching: 'badge-blue',
  inclusive_education: 'badge-blue',
  entrepreneurship: 'badge-amber',
}

export default function CourseCard({ course, showEnroll = true }: Props) {
  const langs = course.available_langs ?? []
  const enrolled = course.total_enrolled ?? 0
  const rating = course.avg_rating ?? 0
  const price = course.price_ngn ?? 0

  return (
    <Link href={`/skillup/courses/${course.slug}`} className="card block group overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-50 to-indigo-100 overflow-hidden">
        {course.thumbnail_url ? (
          <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🎓</span>
          </div>
        )}
        {course.is_free && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">FREE</span>
        )}
        {course.is_offline_ready && (
          <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
            <Download className="w-3 h-3" /> Offline
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`${CATEGORY_COLORS[course.category] ?? 'badge-blue'} badge`}>
            {(course.category ?? '').replace(/_/g, ' ')}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-[#4F46E5] transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration_weeks ?? 0}w</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {enrolled.toLocaleString()}</span>
          {langs.length > 0 && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {langs.slice(0, 2).map((l: string) => LANG_LABELS[l] ?? l).join(', ')}
            </span>
          )}
        </div>

        {showEnroll && (
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1E1B4B] text-sm">
              {course.is_free ? 'Free' : `₦${price.toLocaleString()}`}
            </span>
            <span className="text-xs text-[#4F46E5] font-semibold group-hover:underline">
              Enrol Now →
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
