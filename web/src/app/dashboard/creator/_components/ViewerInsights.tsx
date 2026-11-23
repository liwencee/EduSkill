'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Download, X, Loader2, CheckCircle, FastForward, ChevronLeft, ChevronRight } from 'lucide-react'

// One row per viewer per video, from creator_watch_log() (migration 030)
export interface WatchRow {
  viewer_id: string; name: string; signed_in: boolean
  course_slug: string; course_title: string; lesson_key: string; lesson_title: string
  watch_secs: number; duration_secs: number; watched_pct: number | null; reached_pct: number | null
  is_completed: boolean; started_at: string; last_seen_at: string; enrolled: boolean; paid: boolean
}

interface ViewerSummary {
  id: string; name: string; signed_in: boolean; status: Status
  videos: number; watchSecs: number; avgPct: number; finished: number; lastSeen: string
  rows: WatchRow[]
}
type Status = 'Paid' | 'Signed up' | 'Previewing' | 'Guest'

const STATUS_STYLE: Record<Status, string> = {
  Paid:        'bg-green-100 text-green-800',
  'Signed up': 'bg-amber-50 text-amber-800',
  Previewing:  'bg-blue-50 text-[#1E4F8A]',
  Guest:       'bg-gray-100 text-gray-700',
}
const STATUS_HELP: Record<Status, string> = {
  Paid: 'Bought the course',
  'Signed up': 'Enrolled but hasn’t paid',
  Previewing: 'Signed in, watching free previews',
  Guest: 'Not signed in',
}

const PAGE = 15
const SKIP_GAP = 15   // reached the end this many % points further than they watched → skipped ahead

export function fmtDuration(secs: number) {
  if (!secs) return '0m'
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.round(secs % 60)
  if (h) return `${h}h ${m}m`
  return m ? `${m}m ${s ? `${s}s` : ''}`.trim() : `${s}s`
}
const fmtWhen = (iso: string) => new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function statusOf(rows: WatchRow[]): Status {
  if (!rows[0].signed_in) return 'Guest'
  if (rows.some(r => r.paid)) return 'Paid'
  if (rows.some(r => r.enrolled)) return 'Signed up'
  return 'Previewing'
}

function toCsv(rows: WatchRow[], statusById: Map<string, Status>) {
  const head = ['Viewer', 'Status', 'Course', 'Video', 'Watch time (minutes)', '% actually watched',
    'Furthest point reached (%)', 'Finished (90%+ watched)', 'First watched', 'Last watched']
  const esc = (v: unknown) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const lines = rows.map(r => [
    r.name, statusById.get(r.viewer_id) ?? '', r.course_title, r.lesson_title,
    (r.watch_secs / 60).toFixed(1), r.watched_pct ?? 0, r.reached_pct ?? 0, r.is_completed ? 'Yes' : 'No',
    new Date(r.started_at).toISOString().slice(0, 16).replace('T', ' '),
    new Date(r.last_seen_at).toISOString().slice(0, 16).replace('T', ' '),
  ].map(esc).join(','))
  return '﻿' + [head.join(','), ...lines].join('\r\n')   // BOM so Excel reads the naira/accents correctly
}

export default function ViewerInsights({ scopeSlug, scopeTitle }: { scopeSlug: string | null; scopeTitle: string }) {
  const [rows, setRows]       = useState<WatchRow[] | null>(null)
  const [failed, setFailed]   = useState(false)
  const [query, setQuery]     = useState('')
  const [sort, setSort]       = useState<'recent' | 'time' | 'videos'>('recent')
  const [page, setPage]       = useState(0)
  const [open, setOpen]       = useState<ViewerSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    setRows(null); setFailed(false); setPage(0)
    ;(async () => {
      try {
        const { data, error } = await createClient().rpc('creator_watch_log', { p_course_slug: scopeSlug })
        if (cancelled) return
        if (error || !data || data.error) setFailed(true)
        else setRows(data.rows as WatchRow[])
      } catch { if (!cancelled) setFailed(true) }
    })()
    return () => { cancelled = true }
  }, [scopeSlug])

  const viewers = useMemo<ViewerSummary[]>(() => {
    const byId = new Map<string, WatchRow[]>()
    for (const r of rows ?? []) byId.set(r.viewer_id, [...(byId.get(r.viewer_id) ?? []), r])
    return [...byId.entries()].map(([id, rs]) => ({
      id, name: rs[0].name, signed_in: rs[0].signed_in, status: statusOf(rs),
      videos: rs.length,
      watchSecs: rs.reduce((a, r) => a + r.watch_secs, 0),
      avgPct: Math.round(rs.reduce((a, r) => a + (r.watched_pct ?? 0), 0) / rs.length),
      finished: rs.filter(r => r.is_completed).length,
      lastSeen: rs.reduce((a, r) => (r.last_seen_at > a ? r.last_seen_at : a), rs[0].last_seen_at),
      rows: [...rs].sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at)),
    }))
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? viewers.filter(v => v.name.toLowerCase().includes(q) || v.status.toLowerCase().includes(q)) : viewers
    return [...list].sort((a, b) =>
      sort === 'time' ? b.watchSecs - a.watchSecs : sort === 'videos' ? b.videos - a.videos : b.lastSeen.localeCompare(a.lastSeen))
  }, [viewers, query, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const shown = filtered.slice(page * PAGE, page * PAGE + PAGE)
  const guests = viewers.filter(v => !v.signed_in).length

  function downloadCsv() {
    const ids = new Set(filtered.map(v => v.id))
    const statusById = new Map(viewers.map(v => [v.id, v.status]))
    const csv = toCsv((rows ?? []).filter(r => ids.has(r.viewer_id)), statusById)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `skillora-viewers-${scopeSlug ?? 'all-courses'}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-[#1E4F8A] text-lg">Everyone who watched</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {rows ? `${viewers.length} viewer${viewers.length === 1 ? '' : 's'} of ${scopeTitle}${guests ? ` · ${guests} not signed in` : ''}. Tap a viewer to see every video they watched.` : 'Loading viewers…'}
          </p>
        </div>
        <button type="button" onClick={downloadCsv} disabled={!rows || !filtered.length}
          className="inline-flex items-center gap-2 rounded-xl border border-[#378ADD] text-[#378ADD] text-sm font-bold px-4 py-2 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <Download className="w-4 h-4" /> Download CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <label className="relative flex-1 min-w-[200px]">
          <span className="sr-only">Search viewers</span>
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input id="viewer-search" type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(0) }}
            placeholder="Search by name or status (e.g. Paid)"
            className="w-full rounded-xl border border-blue-100 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]" />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          Sort by
          <select id="viewer-sort" value={sort} onChange={e => setSort(e.target.value as typeof sort)}
            className="rounded-xl border border-blue-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#378ADD]">
            <option value="recent">Most recent</option>
            <option value="time">Most watch time</option>
            <option value="videos">Most videos</option>
          </select>
        </label>
      </div>

      {failed ? (
        <p className="text-sm text-gray-600 text-center py-8">Viewer details are not available right now. Please try again shortly.</p>
      ) : !rows ? (
        <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#378ADD]" /></div>
      ) : !filtered.length ? (
        <p className="text-sm text-gray-600 text-center py-8">{viewers.length ? 'No viewers match your search.' : 'No one has watched a video yet.'}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-blue-100">
                  <th className="py-2 pr-4">Viewer</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right hidden sm:table-cell">Videos</th>
                  <th className="py-2 pr-4 text-right whitespace-nowrap">Watch time</th>
                  <th className="py-2 pr-4 min-w-[120px] hidden sm:table-cell">Avg. watched</th>
                  <th className="py-2 pr-4 text-right hidden md:table-cell">Finished</th>
                  <th className="py-2 hidden md:table-cell whitespace-nowrap">Last watched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {shown.map(v => (
                  <tr key={v.id} onClick={() => setOpen(v)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v) } }}
                    tabIndex={0} role="button" aria-label={`Show everything ${v.name} watched`}
                    className="cursor-pointer hover:bg-blue-50/60 focus:outline-none focus-visible:bg-blue-50">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${v.signed_in ? 'bg-orange-50 text-[#F37321]' : 'bg-blue-50 text-[#1E4F8A]'}`}>
                          {v.signed_in ? v.name.charAt(0).toUpperCase() : '?'}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-[#1E4F8A] whitespace-nowrap">{v.name}</span>
                          <span className="block md:hidden text-xs text-gray-600 whitespace-nowrap">{v.avgPct}% watched · {fmtWhen(v.lastSeen)}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span title={STATUS_HELP[v.status]} className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[v.status]}`}>{v.status}</span>
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-gray-800 hidden sm:table-cell">{v.videos}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-gray-800 whitespace-nowrap">{fmtDuration(v.watchSecs)}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className="flex items-center gap-2">
                        <span className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                          <span className="block h-full bg-[#378ADD] rounded-full" style={{ width: `${v.avgPct}%` }} />
                        </span>
                        <span className="text-xs font-semibold text-[#1E4F8A] tabular-nums w-9 text-right">{v.avgPct}%</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-gray-800 hidden md:table-cell whitespace-nowrap">{v.finished} of {v.videos}</td>
                    <td className="py-3 text-gray-700 whitespace-nowrap hidden md:table-cell">{fmtWhen(v.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-600 tabular-nums">{page * PAGE + 1}–{Math.min(filtered.length, (page + 1) * PAGE)} of {filtered.length}</span>
              <span className="flex gap-2">
                <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-100 px-3 py-1.5 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /> Previous</button>
                <button type="button" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-100 px-3 py-1.5 disabled:opacity-40">Next <ChevronRight className="w-4 h-4" /></button>
              </span>
            </div>
          )}
        </>
      )}

      {open && <ViewerDetail viewer={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function ViewerDetail({ viewer, onClose }: { viewer: ViewerSummary; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0A2F47]/50 p-0 sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="viewer-title" onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 id="viewer-title" className="text-xl font-bold text-[#1E4F8A]">{viewer.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${STATUS_STYLE[viewer.status]}`}>{viewer.status}</span>
              {STATUS_HELP[viewer.status]}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" autoFocus
            className="p-2 rounded-lg hover:bg-blue-50 text-[#1E4F8A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#378ADD]"><X className="w-5 h-5" /></button>
        </div>

        <dl className="grid grid-cols-3 gap-3 mb-5">
          {[['Videos watched', String(viewer.videos)], ['Total watch time', fmtDuration(viewer.watchSecs)], ['Finished', `${viewer.finished} of ${viewer.videos}`]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[#F7FAFE] border border-blue-100 px-3 py-2.5">
              <dt className="text-xs text-[#3D5A73]">{k}</dt>
              <dd className="text-lg font-bold text-[#1E4F8A] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <ul className="space-y-3">
          {viewer.rows.map(r => {
            const skipped = (r.reached_pct ?? 0) - (r.watched_pct ?? 0) >= SKIP_GAP
            return (
              <li key={`${r.course_slug}-${r.lesson_key}`} className="rounded-xl border border-blue-100 p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E4F8A]">{r.lesson_title}</p>
                    <p className="text-xs text-gray-600">{r.course_title} · last watched {fmtWhen(r.last_seen_at)}</p>
                  </div>
                  <span className="flex gap-1.5">
                    {r.is_completed && <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Finished</span>}
                    {skipped && <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full" title={`Jumped ahead: reached ${r.reached_pct}% of the video but watched ${r.watched_pct}%`}><FastForward className="w-3 h-3" /> Skipped ahead</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                    <span className="block h-full bg-[#378ADD] rounded-full" style={{ width: `${r.watched_pct ?? 0}%` }} />
                  </span>
                  <span className="text-xs text-gray-700 tabular-nums whitespace-nowrap">
                    <strong className="text-[#1E4F8A]">{r.watched_pct ?? 0}%</strong> watched · {fmtDuration(r.watch_secs)}{r.duration_secs ? ` of ${fmtDuration(r.duration_secs)}` : ''}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
