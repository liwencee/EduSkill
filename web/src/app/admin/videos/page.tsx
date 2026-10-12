import { createClient } from '@/lib/supabase/server'
import { Video, ExternalLink } from 'lucide-react'
import VideoReviewActions from './VideoReviewActions'

interface Props {
  searchParams: { status?: string }
}

const TABS = [
  { val: 'pending',  label: 'Pending' },
  { val: 'approved', label: 'Live' },
  { val: 'rejected', label: 'Rejected' },
  { val: 'all',      label: 'All' },
]

const STATUS_CLS: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-800',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  replaced: 'bg-blue-50 text-brand-blue',
}

const LANG: Record<string, string> = { en: 'English', pcm: 'Pidgin', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa' }

export default async function AdminVideosPage({ searchParams }: Props) {
  const status = TABS.some(t => t.val === searchParams.status) ? searchParams.status! : 'pending'
  let rows: any[] = []
  let pendingCount = 0
  let failed = false

  try {
    const supabase = createClient()
    let query = supabase
      .from('video_submissions')
      .select('id, course_slug, course_title, lesson_key, lesson_title, youtube_url, youtube_id, duration_mins, language, notes, status, admin_note, created_at, submitter:profiles!submitter_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (status !== 'all') query = query.eq('status', status)

    const [{ data, error }, { count }] = await Promise.all([
      query,
      supabase.from('video_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    if (error) failed = true
    rows = data ?? []
    pendingCount = count ?? 0
  } catch { failed = true }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
          <Video className="w-6 h-6 text-brand-blue" /> Video submissions
        </h1>
        <p className="text-sm text-brand-inkMid mt-1">
          {pendingCount} waiting for review. Approving a video makes it play on that lesson and links the creator to the course if it has none.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <a key={t.val} href={`/admin/videos?status=${t.val}`}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              status === t.val ? 'bg-brand-blue text-white border-brand-blue' : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue'
            }`}>{t.label}{t.val === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}</a>
        ))}
      </div>

      {failed ? (
        <div className="card p-12 text-center text-brand-inkMid">
          Video submissions could not be loaded. Check that database migration 023 has been applied.
        </div>
      ) : rows.length === 0 ? (
        <div className="card p-16 text-center text-brand-inkLight">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-brand-ink">No {status === 'all' ? '' : TABS.find(t => t.val === status)?.label.toLowerCase()} submissions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(r => (
            <div key={r.id} className="card p-4 flex flex-col md:flex-row gap-4">
              <a href={`https://www.youtube.com/watch?v=${r.youtube_id}`} target="_blank" rel="noopener noreferrer"
                className="shrink-0 relative group" title="Watch on YouTube">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://img.youtube.com/vi/${r.youtube_id}/mqdefault.jpg`} alt=""
                  className="w-full md:w-56 aspect-video object-cover rounded-xl bg-brand-bg" />
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  Watch <ExternalLink className="w-3 h-3" />
                </span>
              </a>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[r.status] ?? ''}`}>
                    {r.status === 'approved' ? 'Live' : r.status}
                  </span>
                  <span className="text-xs text-brand-inkLight">
                    {new Date(r.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="font-semibold text-brand-ink">{r.lesson_title}</p>
                <p className="text-sm text-brand-inkMid">
                  {r.course_title} · <span className="text-brand-inkLight">{r.lesson_key}</span>
                </p>
                <p className="text-sm text-brand-inkMid">
                  By <span className="font-medium text-brand-ink">{r.submitter?.full_name ?? 'Unknown'}</span>
                  {r.submitter?.email && <> · {r.submitter.email}</>}
                </p>
                <p className="text-xs text-brand-inkLight">
                  {r.duration_mins ? `${r.duration_mins} min · ` : ''}{LANG[r.language] ?? r.language}
                </p>
                {r.notes && <p className="text-sm text-brand-ink bg-brand-bg rounded-lg px-3 py-2">“{r.notes}”</p>}
                {r.admin_note && <p className="text-xs text-brand-inkMid">Review note: {r.admin_note}</p>}
              </div>

              {r.status === 'pending' && (
                <div className="md:w-64 shrink-0">
                  <VideoReviewActions submissionId={r.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
