import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import CourseCard from '@/components/CourseCard'
import { Search } from 'lucide-react'
import type { Course } from '@/types'

const CATEGORIES = [
  { value: '', label: 'All Courses' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'coding',            label: 'Coding & Tech' },
  { value: 'fashion_design',    label: 'Fashion Design' },
  { value: 'solar_tech',        label: 'Solar Technology' },
  { value: 'agribusiness',      label: 'Agribusiness' },
  { value: 'financial_literacy',label: 'Financial Literacy' },
  { value: 'entrepreneurship',  label: 'Entrepreneurship' },
]

interface Props {
  searchParams: { category?: string; q?: string }
}

export default async function CoursesPage({ searchParams }: Props) {
  const supabase = createClient()

  let query = supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .eq('target_role', 'youth')
    .order('total_enrolled', { ascending: false })

  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)

  const { data: courses } = await query

  return (
    <>
      <Navbar />
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-ink mb-2">SkillUp Courses</h1>
            <p className="text-brand-inkMid">Practical skills for Nigeria&apos;s job market. All courses work offline.</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form method="GET" className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-inkLight" />
              <input name="q" defaultValue={searchParams.q} type="text"
                className="input pl-9" placeholder="Search courses…" />
            </form>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <a key={c.value}
                  href={c.value ? `/skillup/courses?category=${c.value}` : '/skillup/courses'}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    searchParams.category === c.value || (!searchParams.category && !c.value)
                      ? 'bg-brand-blue text-white border-brand-blue'          /* 30% active */
                      : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue hover:text-brand-blue'
                  }`}>
                  {c.label}
                </a>
              ))}
            </div>
          </div>

          {/* Grid */}
          {courses && courses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map(course => <CourseCard key={course.id} course={course as Course} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-brand-inkLight">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No courses found</p>
              <a href="/skillup/courses" className="text-brand-blue text-sm hover:underline mt-1 inline-block">
                Clear filters
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
