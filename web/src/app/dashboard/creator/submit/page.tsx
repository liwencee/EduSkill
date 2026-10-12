'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { STATIC_COURSES } from '@/lib/static-courses'
import { COURSE_CURRICULUM } from '@/lib/course-content'
import { getYouTubeId, youTubeThumb, checkYouTubeAvailable } from '@/lib/youtube'
import {
  ArrowLeft, Loader2, Upload, CheckCircle, XCircle, Clock, Video, AlertTriangle, ExternalLink,
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en',  label: 'English' },
  { code: 'pcm', label: 'Pidgin' },
  { code: 'yo',  label: 'Yoruba' },
  { code: 'ig',  label: 'Igbo' },
  { code: 'ha',  label: 'Hausa' },
]

interface Submission {
  id: string; course_title: string; lesson_title: string; youtube_id: string
  status: 'pending' | 'approved' | 'rejected' | 'replaced'; admin_note: string | null; created_at: string
}

const STATUS_STYLE: Record<Submission['status'], { label: string; cls: string; icon: typeof Clock }> = {
  pending:  { label: 'In review', cls: 'bg-amber-50 text-amber-800',  icon: Clock },
  approved: { label: 'Live',      cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Changes needed', cls: 'bg-red-50 text-red-700', icon: XCircle },
  replaced: { label: 'Replaced',  cls: 'bg-blue-50 text-[#1E4F8A]',   icon: Video },
}

// Courses that have a lesson curriculum, titled from the course catalogue
const COURSES = Object.keys(COURSE_CURRICULUM)
  .map(slug => ({ slug, title: STATIC_COURSES.find(c => c.slug === slug)?.title ?? slug.replace(/-/g, ' ') }))
  .sort((a, b) => a.title.localeCompare(b.title))

type Check = 'idle' | 'checking' | 'ok' | 'unavailable' | 'invalid'

export default function SubmitVideoPage() {
  const { user, loading: authLoading } = useAuth()

  const [courseSlug, setCourseSlug] = useState('')
  const [lessonKey,  setLessonKey]  = useState('')
  const [url,        setUrl]        = useState('')
  const [duration,   setDuration]   = useState('')
  const [language,   setLanguage]   = useState('en')
  const [notes,      setNotes]      = useState('')
  const [agreed,     setAgreed]     = useState(false)
  const [check,      setCheck]      = useState<Check>('idle')
  const [saving,     setSaving]     = useState(false)
  const [mine,       setMine]       = useState<Submission[] | null>(null)

  const videoId = useMemo(() => getYouTubeId(url), [url])
  const modules = courseSlug ? COURSE_CURRICULUM[courseSlug] ?? [] : []
  const lesson  = modules.flatMap(m => m.lessons).find(l => l.id === lessonKey) ?? null

  // Sign-in required: submissions are tied to the creator's account.
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/creator/submit')}`
    }
  }, [authLoading, user])

  const loadMine = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await createClient()
        .from('video_submissions')
        .select('id, course_title, lesson_title, youtube_id, status, admin_note, created_at')
        .eq('submitter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setMine((data as Submission[]) ?? [])
    } catch { setMine([]) }
  }, [user])

  useEffect(() => { loadMine() }, [loadMine])

  // Check the link as soon as it's pasted.
  useEffect(() => {
    if (!url.trim()) { setCheck('idle'); return }
    if (!videoId)    { setCheck('invalid'); return }
    let cancelled = false
    setCheck('checking')
    checkYouTubeAvailable(videoId).then(ok => { if (!cancelled) setCheck(ok ? 'ok' : 'unavailable') })
    return () => { cancelled = true }
  }, [url, videoId])

  const canSubmit = !!user && !!lesson && check === 'ok' && agreed && !saving

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !lesson || !videoId || !user) return
    setSaving(true)
    try {
      const { error } = await createClient().from('video_submissions').insert({
        submitter_id:  user.id,
        course_slug:   courseSlug,
        course_title:  COURSES.find(c => c.slug === courseSlug)?.title ?? courseSlug,
        lesson_key:    lesson.id,
        lesson_title:  lesson.title,
        youtube_url:   url.trim(),
        youtube_id:    videoId,
        duration_mins: duration ? Math.round(Number(duration)) : null,
        language,
        notes:         notes.trim() || null,
      })
      if (error) throw error
      toast.success('Video submitted. We’ll review it shortly.')
      setLessonKey(''); setUrl(''); setDuration(''); setNotes(''); setAgreed(false)
      loadMine()
    } catch {
      toast.error('Could not submit the video. Please check your details and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#EBF4FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#378ADD]" />
      </div>
    )
  }

  const label = 'block text-sm font-semibold text-[#1E4F8A] mb-1.5'
  const input = 'w-full rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#378ADD]'

  return (
    <div className="min-h-screen bg-[#EBF4FF]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard/creator" className="inline-flex items-center gap-1.5 text-sm text-[#1E4F8A] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Creator analytics
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1E4F8A]">Submit a lesson video</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Upload your video to YouTube as <strong>Unlisted</strong> with embedding allowed, then paste the link here.
            Our team reviews every video. Once approved, it plays on the lesson and its views appear in your analytics.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* ── Form ── */}
          <form onSubmit={submit} className="lg:col-span-3 bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="course" className={label}>Course</label>
                <select id="course" className={input} value={courseSlug} required
                  onChange={e => { setCourseSlug(e.target.value); setLessonKey('') }}>
                  <option value="">Choose a course…</option>
                  {COURSES.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="lesson" className={label}>Lesson</label>
                <select id="lesson" className={input} value={lessonKey} required disabled={!courseSlug}
                  onChange={e => setLessonKey(e.target.value)}>
                  <option value="">{courseSlug ? 'Choose a lesson…' : 'Choose a course first'}</option>
                  {modules.map((m, mi) => (
                    <optgroup key={m.id} label={m.title}>
                      {m.lessons.map((l, li) => (
                        <option key={l.id} value={l.id}>{mi + 1}.{li + 1} {l.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            {lesson?.youtube_url && (
              <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This lesson already has a video. If yours is approved, it will replace the current one.
              </p>
            )}

            <div>
              <label htmlFor="url" className={label}>YouTube link</label>
              <input id="url" type="url" inputMode="url" className={input} value={url} required
                placeholder="https://youtu.be/…" onChange={e => setUrl(e.target.value)} />
              <div className="mt-2 text-xs min-h-[1.25rem]" aria-live="polite">
                {check === 'checking'    && <span className="text-gray-500 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking the video…</span>}
                {check === 'invalid'     && <span className="text-red-700">That doesn’t look like a YouTube video link.</span>}
                {check === 'unavailable' && <span className="text-red-700">We can’t open this video. Make sure it is Unlisted or Public, not Private, and hasn’t been removed.</span>}
                {check === 'ok'          && <span className="text-green-700 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Video found</span>}
              </div>
              {check === 'ok' && videoId && (
                <img src={youTubeThumb(videoId)} alt="Video thumbnail"
                  className="mt-2 w-full max-w-xs rounded-xl border border-blue-100" />
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className={label}>Video length (minutes)</label>
                <input id="duration" type="number" min={1} max={600} className={input} value={duration}
                  placeholder={lesson ? String(lesson.duration_mins) : 'e.g. 12'} onChange={e => setDuration(e.target.value)} />
              </div>
              <div>
                <label htmlFor="language" className={label}>Language</label>
                <select id="language" className={input} value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className={label}>Notes for the reviewer <span className="font-normal text-gray-500">(optional)</span></label>
              <textarea id="notes" rows={3} maxLength={1000} className={input} value={notes}
                placeholder="Anything we should know, e.g. captions language or a replacement for an older video"
                onChange={e => setNotes(e.target.value)} />
            </div>

            <label htmlFor="agree" className="flex items-start gap-2.5 text-sm text-gray-700">
              <input id="agree" type="checkbox" className="mt-1" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <span>I own the rights to this video (including any music and images), it follows the Skillora vendor video guide, and I won’t delete or make it private after it goes live.</span>
            </label>

            <button type="submit" disabled={!canSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#378ADD] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Submit for review
            </button>
          </form>

          {/* ── My submissions ── */}
          <aside className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E4F8A] text-lg mb-4">My submissions</h2>
            {mine === null ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#378ADD]" />
            ) : mine.length === 0 ? (
              <p className="text-sm text-gray-500">Videos you submit will appear here with their review status.</p>
            ) : (
              <ul className="space-y-3">
                {mine.map(s => {
                  const st = STATUS_STYLE[s.status]
                  return (
                    <li key={s.id} className="flex gap-3">
                      <img src={youTubeThumb(s.youtube_id)} alt="" className="w-24 h-14 object-cover rounded-lg shrink-0 bg-blue-50" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1E4F8A] truncate">{s.lesson_title}</p>
                        <p className="text-xs text-gray-500 truncate">{s.course_title}</p>
                        <span className={`mt-1 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${st.cls}`}>
                          <st.icon className="w-3 h-3" /> {st.label}
                        </span>
                        {s.admin_note && <p className="text-xs text-gray-700 mt-1">“{s.admin_note}”</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <a href="https://support.google.com/youtube/answer/157177" target="_blank" rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1 text-xs text-[#378ADD] hover:underline">
              How to make a YouTube video Unlisted <ExternalLink className="w-3 h-3" />
            </a>
          </aside>
        </div>
      </div>
    </div>
  )
}
