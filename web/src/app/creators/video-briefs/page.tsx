import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { STATIC_COURSES } from '@/lib/static-courses'
import { COURSE_CURRICULUM } from '@/lib/course-content'
import {
  courseBriefs, COURSE_VIDEO_MINUTES, LESSON_VIDEO_MIN, LESSON_VIDEO_MAX,
} from '@/lib/video-briefs'
import { Clock, Film, Video, Upload, ArrowRight, Star } from 'lucide-react'

export const metadata = {
  title: 'Lesson Video Briefs — Skillora Creators',
  description: 'What each Skillora lesson video should cover, how long it should be and how to film it.',
}

interface Props { searchParams: { course?: string } }

const COURSES = Object.keys(COURSE_CURRICULUM)
  .map(slug => ({ slug, title: STATIC_COURSES.find(c => c.slug === slug)?.title ?? slug.replace(/-/g, ' ') }))
  .sort((a, b) => a.title.localeCompare(b.title))

function hm(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`
}

export default function VideoBriefsPage({ searchParams }: Props) {
  const slug   = COURSES.some(c => c.slug === searchParams.course) ? searchParams.course! : COURSES[0].slug
  const course = COURSES.find(c => c.slug === slug)!
  const briefs = courseBriefs(slug)
  const total  = briefs.reduce((a, b) => a + b.targetMins, 0)

  // Group by module for display
  const modules = briefs.reduce<{ title: string; number: number; items: typeof briefs }[]>((acc, b) => {
    const last = acc[acc.length - 1]
    if (last && last.number === b.moduleNumber) last.items.push(b)
    else acc.push({ title: b.moduleTitle, number: b.moduleNumber, items: [b] })
    return acc
  }, [])

  return (
    <div className="min-h-screen bg-[#EBF4FF]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-semibold text-[#F37321] mb-1">For Skillora video creators</p>
          <h1 className="text-2xl font-bold text-[#1E4F8A]">Lesson video briefs</h1>
          <p className="text-sm text-gray-700 mt-2">
            Every course has about <strong>{COURSE_VIDEO_MINUTES / 60} hours</strong> of video in total, made of one video per
            lesson. Each lesson video must be <strong>{LESSON_VIDEO_MIN}–{LESSON_VIDEO_MAX} minutes</strong> long. Below is what
            each video should cover, its target length and how to film it.
          </p>
        </div>

        {/* Course picker */}
        <form method="GET" className="mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="course" className="block text-sm font-semibold text-[#1E4F8A] mb-1.5">Course</label>
            <select id="course" name="course" defaultValue={slug}
              className="rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm text-[#2C2C2A] min-w-[260px]">
              {COURSES.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
            </select>
          </div>
          <button type="submit" className="rounded-xl bg-[#378ADD] text-white text-sm font-bold px-5 py-2.5 hover:bg-blue-700">
            Show briefs
          </button>
          <Link href="/dashboard/creator/submit"
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#F37321] text-white text-sm font-bold px-5 py-2.5 hover:bg-orange-600">
            <Upload className="w-4 h-4" /> Upload a video
          </Link>
        </form>

        {/* Course summary */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-6 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Course</p>
            <p className="font-bold text-[#1E4F8A]">{course.title}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Lesson videos</p>
            <p className="font-bold text-[#1E4F8A]">{briefs.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total video time</p>
            <p className="font-bold text-[#1E4F8A]">{hm(total)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Each video</p>
            <p className="font-bold text-[#1E4F8A]">{LESSON_VIDEO_MIN}–{LESSON_VIDEO_MAX} min</p>
          </div>
        </div>

        <div className="space-y-6">
          {modules.map(mod => (
            <section key={mod.number}>
              <h2 className="font-bold text-[#1E4F8A] mb-3">Module {mod.number}: {mod.title}</h2>
              <div className="space-y-3">
                {mod.items.map(b => (
                  <details key={b.lessonId} className="group bg-white rounded-2xl border border-blue-100 shadow-sm">
                    <summary className="cursor-pointer list-none px-5 py-4 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-[#378ADD] tabular-nums w-10">{b.moduleNumber}.{b.lessonNumber}</span>
                      <span className="flex-1 min-w-[200px] font-semibold text-[#1E4F8A]">{b.lessonTitle}</span>
                      {b.isFreePreview && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Free preview
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-[#1E4F8A] px-2 py-0.5 rounded-full">
                        <Film className="w-3 h-3" /> {b.style.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-800 px-2 py-0.5 rounded-full tabular-nums">
                        <Clock className="w-3 h-3" /> {b.targetMins} min
                      </span>
                    </summary>
                    <div className="px-5 pb-5 grid md:grid-cols-2 gap-5 border-t border-blue-50 pt-4 text-sm">
                      <div>
                        <h3 className="font-semibold text-[#1E4F8A] mb-2">What the video should cover</h3>
                        <ol className="space-y-1.5">
                          {b.outline.map(o => (
                            <li key={o.at} className="flex gap-3">
                              <span className="text-xs font-bold text-[#378ADD] tabular-nums w-10 shrink-0 pt-0.5">{o.at}</span>
                              <span className="text-gray-700">{o.what}</span>
                            </li>
                          ))}
                        </ol>
                        {b.next && (
                          <p className="mt-3 text-xs text-gray-600">
                            <strong>Leave for the next video:</strong> “{b.next}”.
                          </p>
                        )}
                        {b.previous && (
                          <p className="mt-1 text-xs text-gray-600">
                            <strong>Learners have just watched:</strong> “{b.previous}”, so you don’t need to repeat it.
                          </p>
                        )}
                        {b.isFreePreview && (
                          <p className="mt-3 text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
                            This is a free preview anyone can watch. Make it one of your strongest videos, because it convinces learners to buy the course.
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1E4F8A] mb-2">How to film it: {b.style.label.toLowerCase()}</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                          {b.style.how.map(h => <li key={h}>{h}</li>)}
                        </ul>
                        <p className="mt-3 text-xs text-gray-600">
                          Target length: <strong>{b.targetMins} minutes</strong> (allowed {LESSON_VIDEO_MIN}–{LESSON_VIDEO_MAX}).
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-wrap items-center gap-4">
          <Video className="w-8 h-8 text-[#378ADD]" />
          <p className="flex-1 min-w-[220px] text-sm text-gray-700">
            Ready to film? Upload each video on the submission page. We review every video before it goes live.
          </p>
          <Link href="/dashboard/creator/submit" className="inline-flex items-center gap-1 text-sm font-bold text-[#378ADD] hover:underline">
            Go to the submission page <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
