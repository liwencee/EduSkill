'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import {
  Loader2, Users, PlayCircle, Eye, Clock, CheckCircle, BarChart3,
  ShieldCheck, UserCheck, Video, Info, ArrowLeft, Upload,
} from 'lucide-react'

// ── Shapes returned by the creator_dashboard() SQL function (migration 022) ──
interface LessonStat {
  lesson_key: string; lesson_title: string | null
  views: number; completions: number; watch_secs: number; avg_watched_pct: number
}
interface Viewer {
  name: string; signed_in: boolean; lesson_title: string | null
  watch_secs: number; is_completed: boolean; last_seen_at: string; watched_pct: number | null
}
interface Signup {
  name: string; state: string | null; enrolled_at: string
  is_paid: boolean; progress_pct: number | null; status: string | null
}
interface CourseStat {
  id: string; slug: string; title: string; is_free: boolean; price_ngn: number; is_published: boolean
  enrolled: number; paid: number; lesson_views: number; unique_viewers: number
  watch_secs: number; completions: number; avg_watched_pct: number
  lessons: LessonStat[]; recent_viewers: Viewer[]; signups: Signup[]
}
interface DashboardData {
  is_admin: boolean
  courses: CourseStat[]
  daily: { day: string; new_views: number; signups: number }[]
  error?: string
}

function fmtDuration(secs: number) {
  if (!secs) return '0m'
  const h = Math.floor(secs / 3600)
  const m = Math.round((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function fmtDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }),
  })
}

export default function CreatorDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [data,     setData]     = useState<DashboardData | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [failed,   setFailed]   = useState(false)
  const [selected, setSelected] = useState<string>('all')

  // Must be signed in — creators only ever see their own courses.
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/creator')}`
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: res, error } = await supabase.rpc('creator_dashboard')
        if (cancelled) return
        if (error || !res || (res as DashboardData).error) setFailed(true)
        else setData(res as DashboardData)
      } catch {
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [authLoading, user])

  const courses = data?.courses ?? []
  const current = selected === 'all' ? null : courses.find(c => c.slug === selected) ?? null

  // Totals for the selected scope (one course, or all of the creator's courses)
  const totals = useMemo(() => {
    const scope = current ? [current] : courses
    const sum = (k: keyof CourseStat) => scope.reduce((a, c) => a + Number(c[k] ?? 0), 0)
    const withPct = scope.filter(c => c.lesson_views > 0)
    return {
      enrolled:       sum('enrolled'),
      paid:           sum('paid'),
      views:          sum('lesson_views'),
      viewers:        sum('unique_viewers'),
      watchSecs:      sum('watch_secs'),
      completions:    sum('completions'),
      avgWatchedPct:  withPct.length
        ? Math.round(withPct.reduce((a, c) => a + c.avg_watched_pct * c.lesson_views, 0) / withPct.reduce((a, c) => a + c.lesson_views, 0))
        : 0,
    }
  }, [courses, current])

  const signups = useMemo(() => {
    const scope = current ? [current] : courses
    return scope.flatMap(c => c.signups.map(s => ({ ...s, course: c.title })))
      .sort((a, b) => b.enrolled_at.localeCompare(a.enrolled_at)).slice(0, 50)
  }, [courses, current])

  const viewers = useMemo(() => {
    const scope = current ? [current] : courses
    return scope.flatMap(c => c.recent_viewers.map(v => ({ ...v, course: c.title })))
      .sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at)).slice(0, 50)
  }, [courses, current])

  const chartData = (data?.daily ?? []).map(d => ({
    day: new Date(d.day).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
    Views: d.new_views,
    'Sign-ups': d.signups,
  }))

  if (authLoading || (loading && !failed)) {
    return (
      <div className="min-h-screen bg-[#EBF4FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#378ADD]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EBF4FF]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#1E4F8A] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E4F8A] to-[#378ADD] rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <BarChart3 className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-white/80 text-sm font-medium mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Transparency report
            </p>
            <h1 className="text-2xl font-bold mb-1">Creator Analytics</h1>
            <p className="text-white/85 text-sm max-w-2xl">
              See exactly who signed up for your course and how learners watch your videos —
              real playback time, how far they got, and who finished.
              {data?.is_admin && ' (Admin view: showing every course.)'}
            </p>
            <Link href="/dashboard/creator/submit"
              className="inline-flex items-center gap-2 mt-4 bg-[#F37321] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
              <Upload className="w-4 h-4" /> Submit a lesson video
            </Link>
          </div>
        </div>

        {failed ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-10 text-center">
            <Info className="w-10 h-10 text-[#378ADD] mx-auto mb-3" />
            <p className="font-semibold text-[#1E4F8A] mb-1">Analytics are not available right now</p>
            <p className="text-sm text-gray-600">Please try again shortly. If this keeps happening, contact Skillora support.</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Video className="w-8 h-8 text-[#378ADD]" />
            </div>
            <p className="font-semibold text-[#1E4F8A] mb-1">No courses linked to your account yet</p>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Submit your first lesson video. Once the Skillora team approves it, your course is linked
              to <strong>{user?.email}</strong> and your sign-ups and watch statistics appear here automatically.
            </p>
            <Link href="/dashboard/creator/submit"
              className="inline-flex items-center gap-2 mt-4 bg-[#378ADD] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" /> Submit a lesson video
            </Link>
          </div>
        ) : (
          <>
            {/* Course selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[{ slug: 'all', title: 'All my courses' }, ...courses].map(c => (
                <button key={c.slug} onClick={() => setSelected(c.slug)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    selected === c.slug
                      ? 'bg-[#378ADD] text-white border-[#378ADD]'
                      : 'bg-white text-[#1E4F8A] border-blue-100 hover:border-[#378ADD]'
                  }`}>
                  {c.title}
                </button>
              ))}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                { label: 'Signed up',        value: totals.enrolled.toLocaleString(), sub: `${totals.paid} paid`, icon: UserCheck,   bg: 'bg-blue-50',   color: 'text-[#378ADD]' },
                { label: 'Video plays',      value: totals.views.toLocaleString(),    sub: 'lesson views',         icon: PlayCircle,  bg: 'bg-orange-50', color: 'text-[#F37321]' },
                { label: 'Unique viewers',   value: totals.viewers.toLocaleString(),  sub: 'people',               icon: Users,       bg: 'bg-purple-50', color: 'text-purple-600' },
                { label: 'Total watch time', value: fmtDuration(totals.watchSecs),    sub: 'real playback',        icon: Clock,       bg: 'bg-amber-50',  color: 'text-amber-600' },
                { label: 'Avg. watched',     value: `${totals.avgWatchedPct}%`,       sub: 'of each video',        icon: Eye,         bg: 'bg-pink-50',   color: 'text-pink-600' },
                { label: 'Completed',        value: totals.completions.toLocaleString(), sub: 'watched 90%+',      icon: CheckCircle, bg: 'bg-green-50',  color: 'text-green-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-[#1E4F8A]">{s.value}</p>
                  <p className="text-xs font-semibold text-gray-700">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Trend chart (all of the creator's courses) */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
              <h2 className="font-bold text-[#1E4F8A] text-lg mb-1">Last 30 days</h2>
              <p className="text-xs text-gray-500 mb-4">New video viewers and course sign-ups per day, across all your courses</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#378ADD" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#378ADD" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F37321" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#F37321" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5EEF9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="Views"    stroke="#378ADD" fill="url(#gViews)"   strokeWidth={2} />
                    <Area type="monotone" dataKey="Sign-ups" stroke="#F37321" fill="url(#gSignups)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Per-lesson breakdown (single course) or per-course breakdown (all) */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
              <h2 className="font-bold text-[#1E4F8A] text-lg mb-4">
                {current ? 'How each video is watched' : 'Your courses at a glance'}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-blue-100">
                      <th className="py-2 pr-4">{current ? 'Video lesson' : 'Course'}</th>
                      {!current && <th className="py-2 pr-4 text-center">Signed up</th>}
                      <th className="py-2 pr-4 text-center">Plays</th>
                      <th className="py-2 pr-4 text-center">Watch time</th>
                      <th className="py-2 pr-4 min-w-[160px]">Avg. watched</th>
                      <th className="py-2 text-center">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {(current
                      ? current.lessons.map(l => ({
                          key: l.lesson_key, label: l.lesson_title ?? l.lesson_key, signed: null as number | null,
                          views: l.views, watch: l.watch_secs, pct: l.avg_watched_pct, done: l.completions,
                        }))
                      : courses.map(c => ({
                          key: c.slug, label: c.title, signed: c.enrolled as number | null,
                          views: c.lesson_views, watch: c.watch_secs, pct: c.avg_watched_pct, done: c.completions,
                        }))
                    ).map(r => (
                      <tr key={r.key}>
                        <td className="py-3 pr-4 font-medium text-[#1E4F8A]">{r.label}</td>
                        {!current && <td className="py-3 pr-4 text-center text-gray-700">{r.signed}</td>}
                        <td className="py-3 pr-4 text-center text-gray-700">{r.views}</td>
                        <td className="py-3 pr-4 text-center text-gray-700">{fmtDuration(r.watch)}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                              <div className="h-full bg-[#378ADD] rounded-full" style={{ width: `${Math.min(100, r.pct)}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-[#1E4F8A] w-9 text-right">{r.pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-center text-gray-700">{r.done}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {current && current.lessons.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-6">No one has played a video in this course yet.</p>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Who signed up */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                <h2 className="font-bold text-[#1E4F8A] text-lg mb-1">Who signed up</h2>
                <p className="text-xs text-gray-500 mb-4">Latest learners enrolled in {current ? 'this course' : 'your courses'}</p>
                {signups.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No sign-ups yet.</p>
                ) : (
                  <ul className="divide-y divide-blue-50">
                    {signups.map((s, i) => (
                      <li key={i} className="py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-[#378ADD] font-bold text-sm flex items-center justify-center shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1E4F8A] truncate">{s.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {!current && <>{s.course} · </>}{s.state ? `${s.state} · ` : ''}{fmtDate(s.enrolled_at)}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          s.is_paid ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-800'
                        }`}>{s.is_paid ? 'Paid' : 'Free / pending'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recent viewers */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                <h2 className="font-bold text-[#1E4F8A] text-lg mb-1">Recent viewers</h2>
                <p className="text-xs text-gray-500 mb-4">Who watched which video, how much of it, and when</p>
                {viewers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No video plays recorded yet.</p>
                ) : (
                  <ul className="divide-y divide-blue-50">
                    {viewers.map((v, i) => (
                      <li key={i} className="py-3 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${
                          v.signed_in ? 'bg-orange-50 text-[#F37321]' : 'bg-blue-50 text-[#1E4F8A]'
                        }`}>
                          {v.signed_in ? v.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1E4F8A] truncate">{v.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {v.lesson_title ?? 'Lesson'}{!current && <> · {v.course}</>} · {fmtDate(v.last_seen_at, true)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-[#1E4F8A]">{v.watched_pct ?? 0}% watched</p>
                          <p className="text-xs text-gray-500">
                            {v.is_completed ? <span className="text-green-700 font-semibold">Completed</span> : fmtDuration(v.watch_secs)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Watch time counts only while a video is actually playing. A video counts as completed when the
              learner reaches 90% of it. Guests who are not signed in appear as “Guest viewer”. Learners’
              contact details are never shown here.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
