import { createClient } from '@/lib/supabase/server'
import { BookOpen, Search, Users, Star, Eye, EyeOff } from 'lucide-react'
import CourseAdminActions from './CourseAdminActions'

interface Props {
  searchParams: { q?: string; status?: string }
}

export default async function AdminCoursesPage({ searchParams }: Props) {
  let courses: any[] = []
  let totalPublished = 0
  let totalFree = 0

  try {
    const supabase = createClient()
    let query = supabase
      .from('courses')
      .select('id, title, slug, category, price_ngn, is_free, is_published, total_enrolled, avg_rating, created_at')
      .order('created_at', { ascending: false })

    if (searchParams.q)
      query = query.ilike('title', `%${searchParams.q}%`)
    if (searchParams.status === 'published')
      query = query.eq('is_published', true)
    if (searchParams.status === 'draft')
      query = query.eq('is_published', false)

    const { data } = await query.limit(200)
    courses = data ?? []
    totalPublished = courses.filter(c => c.is_published).length
    totalFree = courses.filter(c => c.is_free).length
  } catch { /* DB unavailable */ }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-blue" /> Courses
        </h1>
        <p className="text-sm text-brand-inkMid mt-1">
          {courses.length} total · {totalPublished} published · {totalFree} free
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form method="GET" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-inkLight" />
          <input name="q" defaultValue={searchParams.q} type="text"
            className="input pl-9 text-sm" placeholder="Search course title…" />
        </form>
        <div className="flex gap-2">
          {[
            { val: '',          label: 'All' },
            { val: 'published', label: 'Published' },
            { val: 'draft',     label: 'Draft' },
          ].map(({ val, label }) => (
            <a key={val} href={`/admin/courses?status=${val}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                (searchParams.status ?? '') === val
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue'
              }`}>{label}</a>
          ))}
        </div>
      </div>

      {/* Table */}
      {courses.length === 0 ? (
        <div className="card p-16 text-center text-brand-inkLight">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-brand-ink">No courses found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DDD5] bg-brand-bg">
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Course</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Price</th>
                  <th className="text-center px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Enrolled</th>
                  <th className="text-center px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden lg:table-cell">Rating</th>
                  <th className="text-center px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DDD5]">
                {courses.map((c: any) => (
                  <tr key={c.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-ink">{c.title}</p>
                      <p className="text-xs text-brand-inkLight">/{c.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue capitalize">
                        {c.category ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.is_free
                        ? <span className="text-green-600 font-semibold">Free</span>
                        : <span className="text-brand-ink font-semibold">₦{Number(c.price_ngn ?? 0).toLocaleString()}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-brand-inkMid font-medium">
                        <Users className="w-3 h-3" /> {c.total_enrolled ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      {c.avg_rating > 0 ? (
                        <span className="inline-flex items-center gap-1 text-brand-inkMid">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {Number(c.avg_rating).toFixed(1)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.is_published
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><Eye className="w-3 h-3" />Published</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><EyeOff className="w-3 h-3" />Draft</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <CourseAdminActions
                          courseId={c.id}
                          isPublished={c.is_published}
                          isFree={c.is_free}
                          priceNgn={Number(c.price_ngn ?? 0)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
