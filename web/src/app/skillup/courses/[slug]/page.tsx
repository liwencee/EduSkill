import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { Clock, Users, Download, Globe, Star, PlayCircle, Lock } from 'lucide-react'
import Link from 'next/link'
import type { Course } from '@/types'
import { STATIC_COURSES } from '@/lib/static-courses'
import { COURSE_CURRICULUM } from '@/lib/course-content'
import CourseEnrollCard from './_components/CourseEnrollCard'

interface Props { params: { slug: string } }

const LANG_LABELS: Record<string, string> = { en: 'English', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa', pcm: 'Pidgin' }

export default async function CourseDetailPage({ params }: Props) {
  let course: any = null
  let dbModules: any[] | null = null

  try {
    const supabase = createClient()

    const { data } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url, bio)')
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single()

    course = data

    if (course) {
      const { data: mods } = await supabase
        .from('course_modules')
        .select('*, lessons(*)')
        .eq('course_id', course.id)
        .order('order_index')
      if (mods && mods.length > 0) dbModules = mods
    }
  } catch { /* env vars missing — fall through to static */ }

  // Fall back to static course data when DB is unavailable
  if (!course) {
    course = STATIC_COURSES.find(c => c.slug === params.slug) ?? null
  }

  if (!course) notFound()

  // Use static curriculum when DB has no modules
  const staticCurriculum = COURSE_CURRICULUM[params.slug] ?? []

  const c = course as Course & { instructor?: { full_name: string; bio?: string } }

  // First lesson in curriculum for the "Start Learning" CTA
  const firstLesson = staticCurriculum[0]?.lessons[0] ?? null

  return (
    <>
      <Navbar />

      {/* Hero — brand blue */}
      <div className="bg-brand-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <div className="flex gap-2 mb-3">
                <span className="badge badge-blue">{c.category.replace(/_/g, ' ')}</span>
                {c.is_offline_ready && <span className="badge badge-amber">Offline Available</span>}
              </div>
              <h1 className="text-3xl font-bold mb-3">{c.title}</h1>
              <p className="text-white/80 leading-relaxed mb-4">{c.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {c.duration_weeks} weeks</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {(c.total_enrolled ?? 0).toLocaleString()} enrolled</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-brand-amber text-brand-amber" /> {c.avg_rating || '4.8'}/5</span>
                <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {(c.available_langs ?? []).map((l: string) => LANG_LABELS[l] ?? l).join(', ')}</span>
                {c.is_offline_ready && <span className="flex items-center gap-1"><Download className="w-4 h-4" /> Offline download</span>}
              </div>
              {c.instructor && (
                <p className="text-sm text-white/60 mt-3">
                  Instructor: <span className="text-white">{c.instructor.full_name}</span>
                </p>
              )}
            </div>

            {/* Enrol / Buy card — client component handles payment state */}
            <CourseEnrollCard
              courseId={c.id}
              slug={params.slug}
              price={c.price_ngn ?? 8000}
              isFree={!!c.is_free}
              firstLessonId={firstLesson?.id ?? null}
              totalLessons={c.total_lessons ?? staticCurriculum.reduce((acc, m) => acc + m.lessons.length, 0)}
              availableLangs={(c.available_langs ?? []) as string[]}
              isOfflineReady={!!c.is_offline_ready}
            />
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div id="lessons" className="bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-brand-ink mb-6">Course Curriculum</h2>

          {/* DB modules take priority; otherwise show static curriculum */}
          {dbModules && dbModules.length > 0 ? (
            <div className="space-y-4">
              {dbModules.map((mod: any) => (
                <div key={mod.id} className="card overflow-hidden">
                  <div className="bg-brand-blueLight px-5 py-3 border-b border-[#D5D2C8]">
                    <h3 className="font-semibold text-brand-ink">{mod.title}</h3>
                  </div>
                  <div className="divide-y divide-[#F1EFE8]">
                    {mod.lessons.map((lesson: any) => (
                      <div key={lesson.id} className="px-5 py-3 flex items-center gap-3">
                        {lesson.is_free_preview
                          ? <PlayCircle className="w-4 h-4 text-brand-blue shrink-0" />
                          : <Lock className="w-4 h-4 text-brand-inkLight shrink-0" />
                        }
                        <span className={`text-sm flex-1 ${lesson.is_free_preview ? 'text-brand-ink' : 'text-brand-inkLight'}`}>
                          {lesson.title}
                        </span>
                        {lesson.video_duration_secs > 0 && (
                          <span className="text-xs text-brand-inkLight">{Math.round(lesson.video_duration_secs / 60)}m</span>
                        )}
                        {lesson.is_free_preview && <span className="badge badge-amber">Preview</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : staticCurriculum.length > 0 ? (
            <div className="space-y-4">
              {staticCurriculum.map((mod, mi) => (
                <div key={mod.id} className="card overflow-hidden">
                  <div className="bg-brand-blueLight px-5 py-3 border-b border-[#D5D2C8] flex items-center justify-between">
                    <h3 className="font-semibold text-brand-ink">{mod.title}</h3>
                    <span className="text-xs text-brand-inkLight">{mod.lessons.length} lessons</span>
                  </div>
                  <div className="divide-y divide-[#F1EFE8]">
                    {mod.lessons.map((lesson, li) => (
                      <Link
                        key={lesson.id}
                        href={`/skillup/courses/${params.slug}/lesson/${lesson.id}`}
                        className="px-5 py-3 flex items-center gap-3 hover:bg-brand-blueLight transition-colors group">
                        <PlayCircle className="w-4 h-4 text-brand-blue shrink-0 group-hover:text-brand-blue" />
                        <span className="text-sm flex-1 text-brand-ink group-hover:text-brand-blue">
                          <span className="text-brand-inkLight text-xs mr-2">
                            {mi + 1}.{li + 1}
                          </span>
                          {lesson.title}
                        </span>
                        <span className="text-xs text-brand-inkLight">{lesson.duration_mins}m</span>
                        {lesson.is_free_preview && <span className="badge badge-amber">Preview</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-inkLight text-sm">Course content coming soon.</p>
          )}
        </div>
      </div>
    </>
  )
}
