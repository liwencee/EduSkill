import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { Clock, Users, Download, Globe, CheckCircle, Star, PlayCircle, Lock } from 'lucide-react'
import Link from 'next/link'
import type { Course, Lesson } from '@/types'

interface Props { params: { slug: string } }

const LANG_LABELS: Record<string, string> = { en: 'English', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa', pcm: 'Pidgin' }

export default async function CourseDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: course } = await supabase
    .from('courses')
    .select('*, instructor:profiles(full_name, avatar_url, bio)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  const { data: modules } = await supabase
    .from('course_modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index')

  const { data: enrollment } = user
    ? await supabase.from('enrollments').select('*').eq('user_id', user.id).eq('course_id', course.id).single()
    : { data: null }

  const isEnrolled = !!enrollment

  async function handleEnroll() {
    'use server'
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) redirect('/auth/login?next=/skillup/courses/' + params.slug)
    await sb.from('enrollments').upsert({ user_id: user.id, course_id: course!.id })
    redirect('/skillup/courses/' + params.slug + '?enrolled=1')
  }

  const c = course as Course & { instructor: { full_name: string; bio?: string } }

  return (
    <>
      <Navbar />

      {/* Hero — 30% blue */}
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
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {c.total_enrolled.toLocaleString()} enrolled</span>
                {/* 10% amber star */}
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-brand-amber text-brand-amber" /> {c.avg_rating || '4.8'}/5</span>
                <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {c.available_langs.map((l: string) => LANG_LABELS[l]).join(', ')}</span>
                {c.is_offline_ready && <span className="flex items-center gap-1"><Download className="w-4 h-4" /> Offline download</span>}
              </div>
              {c.instructor && (
                <p className="text-sm text-white/60 mt-3">
                  Instructor: <span className="text-white">{c.instructor.full_name}</span>
                </p>
              )}
            </div>

            {/* Enrol card — white card on blue bg */}
            <div className="card bg-white text-brand-ink p-6">
              {/* blueLight thumbnail */}
              <div className="aspect-video bg-brand-blueLight rounded-xl mb-4 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-brand-blue" />
              </div>
              <div className="text-2xl font-bold text-brand-ink mb-1">
                {c.is_free ? 'Free' : `₦${c.price_ngn.toLocaleString()}/month`}
              </div>
              {!isEnrolled ? (
                <form action={handleEnroll}>
                  {/* 10% amber enrol button */}
                  <button type="submit" className="btn-primary w-full mt-3 text-base">
                    {c.is_free ? 'Enrol Free' : 'Enrol Now'}
                  </button>
                </form>
              ) : (
                <Link href="#lessons" className="btn-primary w-full text-center mt-3 block text-base">
                  Continue Learning
                </Link>
              )}
              <ul className="mt-4 space-y-2 text-sm text-brand-inkMid">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-blue shrink-0" /> {c.total_lessons} lessons</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-blue shrink-0" /> Verifiable certificate on completion</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-blue shrink-0" /> Works offline — download on WiFi</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-blue shrink-0" /> {c.available_langs.map((l: string) => LANG_LABELS[l]).join(', ')} subtitles</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-blue shrink-0" /> Profile on OpportunityHub after cert</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum — 60% cream */}
      <div id="lessons" className="bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-brand-ink mb-6">Course Curriculum</h2>
          {modules && modules.length > 0 ? (
            <div className="space-y-4">
              {modules.map((mod: any) => (
                <div key={mod.id} className="card overflow-hidden">
                  <div className="bg-brand-blueLight px-5 py-3 border-b border-[#D5D2C8]">
                    <h3 className="font-semibold text-brand-ink">{mod.title}</h3>
                  </div>
                  <div className="divide-y divide-[#F1EFE8]">
                    {(mod.lessons as Lesson[]).map(lesson => (
                      <div key={lesson.id} className="px-5 py-3 flex items-center gap-3">
                        {lesson.is_free_preview || isEnrolled
                          ? <PlayCircle className="w-4 h-4 text-brand-blue shrink-0" />
                          : <Lock className="w-4 h-4 text-brand-inkLight shrink-0" />
                        }
                        <span className={`text-sm flex-1 ${lesson.is_free_preview || isEnrolled ? 'text-brand-ink' : 'text-brand-inkLight'}`}>
                          {lesson.title}
                        </span>
                        {lesson.video_duration_secs > 0 && (
                          <span className="text-xs text-brand-inkLight">{Math.round(lesson.video_duration_secs / 60)}m</span>
                        )}
                        {/* 10% amber preview badge */}
                        {lesson.is_free_preview && <span className="badge badge-amber">Preview</span>}
                      </div>
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
