'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { STATIC_COURSES } from '@/lib/static-courses'
import { COURSE_CURRICULUM } from '@/lib/course-content'
import { youTubeThumb } from '@/lib/youtube'
import {
  ArrowLeft, Loader2, Upload, CheckCircle, XCircle, Clock, Video, AlertTriangle, FileVideo, X,
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en',  label: 'English' },
  { code: 'pcm', label: 'Pidgin' },
  { code: 'yo',  label: 'Yoruba' },
  { code: 'ig',  label: 'Igbo' },
  { code: 'ha',  label: 'Hausa' },
]

const MAX_BYTES = 4 * 1024 ** 3   // 4 GB
const CDN_HOST  = process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME ?? ''

interface Submission {
  id: string; course_title: string; lesson_title: string
  video_provider: 'youtube' | 'bunny'; youtube_id: string | null; bunny_video_id: string | null
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

function fmtBytes(n: number) {
  return n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(1)} GB` : `${Math.max(1, Math.round(n / 1024 ** 2))} MB`
}

function thumbFor(s: Submission) {
  if (s.video_provider === 'bunny') return s.bunny_video_id && CDN_HOST ? `https://${CDN_HOST}/${s.bunny_video_id}/thumbnail.jpg` : null
  return s.youtube_id ? youTubeThumb(s.youtube_id) : null
}

/** Read a video file's length in the browser (works for MP4/WebM; may not for MOV). */
function readDurationMins(file: File): Promise<number | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(isFinite(v.duration) ? Math.max(1, Math.round(v.duration / 60)) : null) }
    v.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    v.src = url
  })
}

export default function SubmitVideoPage() {
  const { user, loading: authLoading } = useAuth()

  const [configured, setConfigured] = useState<boolean | null>(null)
  const [courseSlug, setCourseSlug] = useState('')
  const [lessonKey,  setLessonKey]  = useState('')
  const [file,       setFile]       = useState<File | null>(null)
  const [duration,   setDuration]   = useState('')
  const [language,   setLanguage]   = useState('en')
  const [notes,      setNotes]      = useState('')
  const [agreed,     setAgreed]     = useState(false)
  const [progress,   setProgress]   = useState<number | null>(null)   // 0–100 while uploading
  const [mine,       setMine]       = useState<Submission[] | null>(null)
  const uploadRef = useRef<{ abort: (shouldTerminate?: boolean) => Promise<void> } | null>(null)

  const modules = courseSlug ? COURSE_CURRICULUM[courseSlug] ?? [] : []
  const lesson  = modules.flatMap(m => m.lessons).find(l => l.id === lessonKey) ?? null
  const uploading = progress !== null

  // Sign-in required: submissions are tied to the creator's account.
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/creator/submit')}`
    }
  }, [authLoading, user])

  useEffect(() => {
    fetch('/api/bunny/upload').then(r => r.json()).then(d => setConfigured(!!d.configured)).catch(() => setConfigured(false))
  }, [])

  // Don't let a creator close the tab halfway through an upload by accident.
  useEffect(() => {
    if (!uploading) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [uploading])

  const loadMine = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await createClient()
        .from('video_submissions')
        .select('id, course_title, lesson_title, video_provider, youtube_id, bunny_video_id, status, admin_note, created_at')
        .eq('submitter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setMine((data as Submission[]) ?? [])
    } catch { setMine([]) }
  }, [user])

  useEffect(() => { loadMine() }, [loadMine])

  async function pickFile(f: File | null) {
    if (!f) { setFile(null); return }
    if (!f.type.startsWith('video/')) { toast.error('Choose a video file (MP4 recommended).'); return }
    if (f.size > MAX_BYTES) { toast.error('That file is larger than 4 GB. Please export a smaller version.'); return }
    setFile(f)
    const mins = await readDurationMins(f)
    if (mins) setDuration(String(mins))
  }

  const canSubmit = !!user && configured === true && !!lesson && !!file && agreed && !uploading

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !lesson || !file || !user) return

    // 1. Ask our server for a Bunny video slot + signed upload credentials
    let creds: { endpoint: string; libraryId: string; videoId: string; expire: number; signature: string }
    try {
      const res = await fetch('/api/bunny/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug, lessonKey: lesson.id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data?.error ?? 'Could not start the upload.'); return }
      creds = data
    } catch {
      toast.error('Could not start the upload. Check your connection and try again.')
      return
    }

    // 2. Upload the file straight to Bunny (resumable — survives brief drop-outs)
    setProgress(0)
    const { Upload } = await import('tus-js-client')
    const ok = await new Promise<boolean>(resolve => {
      const upload = new Upload(file, {
        endpoint:    creds.endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
        chunkSize:   50 * 1024 * 1024,
        headers: {
          AuthorizationSignature: creds.signature,
          AuthorizationExpire:    String(creds.expire),
          VideoId:                creds.videoId,
          LibraryId:              String(creds.libraryId),
        },
        metadata:   { filetype: file.type, title: `${lesson.title}` },
        onProgress: (sent, total) => setProgress(Math.floor((sent / total) * 100)),
        onSuccess:  () => resolve(true),
        onError:    () => resolve(false),
      })
      uploadRef.current = upload
      upload.start()
    })
    uploadRef.current = null

    if (!ok) {
      setProgress(null)
      toast.error('The upload didn’t finish. Check your connection and try again.')
      return
    }

    // 3. Record the submission for review
    try {
      const { error } = await createClient().from('video_submissions').insert({
        submitter_id:   user.id,
        course_slug:    courseSlug,
        course_title:   COURSES.find(c => c.slug === courseSlug)?.title ?? courseSlug,
        lesson_key:     lesson.id,
        lesson_title:   lesson.title,
        video_provider: 'bunny',
        bunny_video_id: creds.videoId,
        duration_mins:  duration ? Math.round(Number(duration)) : null,
        language,
        notes:          notes.trim() || null,
      })
      if (error) throw error
      toast.success('Video uploaded. We’ll review it once Bunny has finished processing it.')
      setLessonKey(''); setFile(null); setDuration(''); setNotes(''); setAgreed(false)
      loadMine()
    } catch {
      toast.error('The video uploaded, but we couldn’t record your submission. Please contact Skillora support.')
    } finally {
      setProgress(null)
    }
  }

  async function cancelUpload() {
    await uploadRef.current?.abort(true)
    uploadRef.current = null
    setProgress(null)
    toast('Upload cancelled')
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#EBF4FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#378ADD]" />
      </div>
    )
  }

  const label = 'block text-sm font-semibold text-[#1E4F8A] mb-1.5'
  const input = 'w-full rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#378ADD] disabled:opacity-60'

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
            Upload your video file (MP4, landscape, 720p or 1080p). It goes straight to Skillora’s secure video
            hosting. Our team reviews every video. Once approved, it plays on the lesson and its views appear in your analytics.
          </p>
        </div>

        {configured === false && (
          <div className="mb-6 bg-amber-50 text-amber-800 rounded-xl px-4 py-3 text-sm flex gap-2 max-w-3xl">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            Video uploads are being set up and will open shortly. You can prepare your videos in the meantime.
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* ── Form ── */}
          <form onSubmit={submit} className="lg:col-span-3 bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-5">
            <fieldset disabled={uploading} className="space-y-5">
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
                  <select id="lesson" className={input} value={lessonKey} required disabled={!courseSlug || uploading}
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
                <label htmlFor="file" className={label}>Video file</label>
                <label htmlFor="file"
                  className="flex items-center gap-3 rounded-xl border-2 border-dashed border-blue-200 bg-[#F7FAFE] px-4 py-5 cursor-pointer hover:border-[#378ADD] transition-colors">
                  <FileVideo className="w-8 h-8 text-[#378ADD] shrink-0" />
                  <span className="min-w-0">
                    {file ? (
                      <>
                        <span className="block text-sm font-semibold text-[#1E4F8A] truncate">{file.name}</span>
                        <span className="block text-xs text-gray-600">{fmtBytes(file.size)} · click to choose a different file</span>
                      </>
                    ) : (
                      <>
                        <span className="block text-sm font-semibold text-[#1E4F8A]">Choose a video file</span>
                        <span className="block text-xs text-gray-600">MP4 recommended · up to 4 GB</span>
                      </>
                    )}
                  </span>
                </label>
                <input id="file" type="file" accept="video/*" className="sr-only" required={!file}
                  onChange={e => pickFile(e.target.files?.[0] ?? null)} />
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
                <span>I own the rights to this video (including any music and images) and it follows the Skillora vendor video guide.</span>
              </label>
            </fieldset>

            {uploading ? (
              <div className="space-y-2" aria-live="polite">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#1E4F8A]">Uploading… {progress}%</span>
                  <button type="button" onClick={cancelUpload}
                    className="inline-flex items-center gap-1 text-red-700 hover:underline text-xs font-semibold">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
                <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#378ADD] rounded-full transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-gray-600">Keep this page open until the upload finishes. If your connection drops briefly, it resumes automatically.</p>
              </div>
            ) : (
              <button type="submit" disabled={!canSubmit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#378ADD] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload className="w-4 h-4" /> Upload and submit for review
              </button>
            )}
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
                  const thumb = thumbFor(s)
                  return (
                    <li key={s.id} className="flex gap-3">
                      {thumb
                        ? <img src={thumb} alt="" className="w-24 h-14 object-cover rounded-lg shrink-0 bg-blue-50" />
                        : <div className="w-24 h-14 rounded-lg shrink-0 bg-blue-50 flex items-center justify-center"><Video className="w-5 h-5 text-[#378ADD]" /></div>}
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
          </aside>
        </div>
      </div>
    </div>
  )
}
