'use client'
import { CheckCircle, PlayCircle } from 'lucide-react'
import { WATCH_BLOCK_SECS } from '@/lib/use-video-watch-tracking'

/**
 * Splits a lesson video into 5-minute parts the learner can jump between.
 * The video stays one file; parts are worked out from its length. A part is
 * ticked once the learner has actually played 90% of it — skipping ahead
 * doesn't count. The played blocks come from the watch tracker, which saves
 * them in the database (by account for signed-in learners).
 */

const PART_SECS    = 5 * 60
const MIN_LAST_SECS = 60   // a final stub shorter than this joins the previous part
const DONE_SHARE    = 0.9

export function splitIntoParts(duration: number): { start: number; end: number }[] {
  if (duration <= 0) return []
  const parts: { start: number; end: number }[] = []
  for (let start = 0; start < duration; start += PART_SECS) {
    parts.push({ start, end: Math.min(start + PART_SECS, duration) })
  }
  const last = parts[parts.length - 1]
  if (parts.length > 1 && last.end - last.start < MIN_LAST_SECS) {
    parts.pop()
    parts[parts.length - 1].end = duration
  }
  return parts
}

function clock(secs: number) {
  const s = Math.round(secs)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`
}

interface Props {
  position: number               // seconds
  duration: number               // seconds
  watched:  Set<number>          // played 10-second blocks
  onSeek:   (seconds: number) => void
}

export default function VideoChapters({ position, duration, watched, onSeek }: Props) {
  const parts = splitIntoParts(duration)
  if (parts.length < 2) return null     // a video of 5 minutes or less needs no parts

  const isDone = (p: { start: number; end: number }) => {
    const first = Math.floor(p.start / WATCH_BLOCK_SECS), last = Math.ceil(p.end / WATCH_BLOCK_SECS) - 1
    let seen = 0
    for (let b = first; b <= last; b++) if (watched.has(b)) seen++
    return seen >= (last - first + 1) * DONE_SHARE
  }
  const current = parts.findIndex(p => position >= p.start && position < p.end)
  const doneCount = parts.filter(isDone).length

  return (
    <div className="px-4 py-3 border-t border-blue-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[#1E4F8A] uppercase tracking-wide">Video parts</p>
        <p className="text-xs text-gray-600 tabular-nums">{doneCount} of {parts.length} watched</p>
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {parts.map((p, i) => {
          const done   = isDone(p)
          const active = i === current
          return (
            <li key={p.start}>
              <button type="button" onClick={() => onSeek(p.start)}
                aria-current={active ? 'true' : undefined}
                className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#378ADD] ${
                  active ? 'border-[#378ADD] bg-blue-50' : 'border-blue-100 hover:border-[#378ADD] hover:bg-blue-50/50'
                }`}>
                {done
                  ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  : <PlayCircle className={`w-4 h-4 shrink-0 ${active ? 'text-[#378ADD]' : 'text-gray-400'}`} />}
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[#1E4F8A]">Part {i + 1}</span>
                  <span className="block text-[11px] text-gray-600 tabular-nums">{clock(p.start)}–{clock(p.end)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
