'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { Loader2, TrendingDown, Info } from 'lucide-react'

export interface VideoOption { course_slug: string; course_title: string; lesson_key: string; lesson_title: string; views: number }

interface Retention {
  viewers: number; duration_secs: number
  blocks: { block: number; pct: number }[]
  parts: { part: number; start_secs: number; end_secs: number; pct: number }[]
  error?: string
}

const BLUE = '#378ADD', INK = '#1E4F8A', GRID = '#E5EEF9', MUTED = '#5B6B7A'
const clock = (secs: number) => { const s = Math.round(secs); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

export default function DropOffChart({ videos }: { videos: VideoOption[] }) {
  const options = useMemo(() => [...videos].sort((a, b) => b.views - a.views), [videos])
  const [key, setKey] = useState('')
  const [data, setData] = useState<Retention | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (options.length && !options.some(o => `${o.course_slug}|${o.lesson_key}` === key)) setKey(`${options[0].course_slug}|${options[0].lesson_key}`) }, [options, key])

  useEffect(() => {
    if (!key) return
    const [course, lesson] = key.split('|')
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const { data: res } = await createClient().rpc('creator_retention', { p_course_slug: course, p_lesson_key: lesson })
        if (!cancelled) setData(res && !res.error ? res as Retention : null)
      } catch { if (!cancelled) setData(null) }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [key])

  const points = useMemo(() => (data?.blocks ?? []).map(b => ({ t: b.block * 10, pct: b.pct })), [data])

  // Plain-English summary: the part that loses the most viewers, and the fastest one-minute drop
  const insight = useMemo(() => {
    if (!data || !data.parts.length) return null
    let worst = 0, worstDrop = -1
    data.parts.forEach((p, i) => { const prev = i === 0 ? 100 : data.parts[i - 1].pct; if (prev - p.pct > worstDrop) { worstDrop = prev - p.pct; worst = i } })
    const p = data.parts[worst]
    let fastAt = 0, fastDrop = 0
    for (let i = 0; i + 6 < points.length; i++) { const d = points[i].pct - points[i + 6].pct; if (d > fastDrop) { fastDrop = d; fastAt = i } }
    return {
      part: worst === 0
        ? `${100 - p.pct}% of viewers don’t finish Part 1 (${clock(p.start_secs)}–${clock(p.end_secs)}).`
        : `Part ${p.part} (${clock(p.start_secs)}–${clock(p.end_secs)}) loses the most viewers: ${p.pct}% watched it all, down from ${data.parts[worst - 1].pct}% for Part ${worst}.`,
      minute: fastDrop >= 10 && points[fastAt]
        ? `Viewers leave fastest between ${clock(points[fastAt].t)} and ${clock(points[fastAt + 6].t)} (${points[fastAt].pct}% → ${points[fastAt + 6].pct}%). Check what happens on screen there.`
        : null,
    }
  }, [data, points])

  if (!options.length) return null
  const sel = options.find(o => `${o.course_slug}|${o.lesson_key}` === key)
  const partStarts = (data?.parts ?? []).slice(1).map(p => p.start_secs)

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-[#1E4F8A] text-lg">Where viewers stop watching</h2>
          <p className="text-xs text-gray-600 mt-0.5">Share of viewers who watched each moment of the video. Skipped parts don’t count.</p>
        </div>
        <label className="text-sm text-gray-700 flex items-center gap-2 min-w-0">
          <span className="shrink-0">Video</span>
          <select id="dropoff-video" value={key} onChange={e => setKey(e.target.value)}
            className="rounded-xl border border-blue-100 px-3 py-2 text-sm max-w-[320px] focus:outline-none focus:ring-2 focus:ring-[#378ADD]">
            {options.map(o => (
              <option key={`${o.course_slug}|${o.lesson_key}`} value={`${o.course_slug}|${o.lesson_key}`}>
                {o.lesson_title} ({o.views} play{o.views === 1 ? '' : 's'})
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#378ADD]" /></div>
      ) : !data || !points.length ? (
        <p className="text-sm text-gray-600 text-center py-12">
          No detailed viewing data for this video yet. It builds up as people watch{sel ? ` “${sel.lesson_title}”` : ''}.
        </p>
      ) : (
        <>
          {insight && (
            <div className="rounded-xl bg-[#FFF4EC] border border-orange-100 px-4 py-3 mb-4 text-sm text-[#7A3410] flex gap-2.5">
              <TrendingDown className="w-4 h-4 shrink-0 mt-0.5 text-[#F37321]" />
              <span>{insight.part}{insight.minute && <><br />{insight.minute}</>}</span>
            </div>
          )}

          <div className="h-64" role="img" aria-label={`Viewer drop-off for ${sel?.lesson_title ?? 'this video'}: ${data.parts.map(p => `Part ${p.part} ${p.pct}%`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="dropFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BLUE} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="t" type="number" domain={[0, data.duration_secs]} tickFormatter={clock}
                  ticks={Array.from({ length: Math.floor(data.duration_secs / 60) + 1 }, (_, i) => i * 60).filter((_, i, a) => a.length <= 12 || i % 2 === 0)}
                  tick={{ fontSize: 11, fill: MUTED }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={v => `${v}%`}
                  tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                {partStarts.map((s, i) => (
                  <ReferenceLine key={s} x={s} stroke="#B8CCE0" strokeDasharray="4 4"
                    label={{ value: `Part ${i + 2}`, position: 'insideTopLeft', fill: MUTED, fontSize: 11 }} />
                ))}
                <Tooltip
                  cursor={{ stroke: INK, strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={({ active, payload }) => active && payload?.length ? (
                    <div className="rounded-lg bg-white border border-blue-100 shadow-md px-3 py-2 text-xs text-[#1E4F8A]">
                      At <strong>{clock(Number(payload[0].payload.t))}</strong>, <strong>{payload[0].payload.pct}%</strong> of viewers were still watching
                    </div>
                  ) : null} />
                <Area type="monotone" dataKey="pct" stroke={BLUE} strokeWidth={2} fill="url(#dropFill)"
                  activeDot={{ r: 5, fill: BLUE, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Part-by-part summary — also the table view of the chart */}
          <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {data.parts.map(p => (
              <li key={p.part} className="rounded-xl border border-blue-100 px-3.5 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-[#1E4F8A]">Part {p.part}</span>
                  <span className="text-xs text-gray-600 tabular-nums">{clock(p.start_secs)}–{clock(p.end_secs)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                    <span className="block h-full bg-[#378ADD] rounded-full" style={{ width: `${p.pct}%` }} />
                  </span>
                  <span className="text-sm font-bold text-[#1E4F8A] tabular-nums w-10 text-right">{p.pct}%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">watched all of this part</p>
              </li>
            ))}
          </ol>

          <p className="text-xs text-gray-600 mt-4 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Based on {data.viewers} viewer{data.viewers === 1 ? '' : 's'} of this video.{data.viewers < 5 ? ' With so few viewers the pattern can still change a lot.' : ''}
          </p>
        </>
      )}
    </div>
  )
}
