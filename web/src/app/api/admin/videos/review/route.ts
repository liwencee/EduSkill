import { NextRequest, NextResponse } from 'next/server'
import { deleteBunnyVideo } from '@/lib/bunny'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/videos/review  { id, approve, note }
 *
 * Approves or rejects a video submission. The admin check is enforced by the
 * admin_review_video_submission() SQL function, called as the signed-in user.
 * A rejected Bunny upload is also deleted from the Bunny library so it
 * doesn't keep costing storage.
 */
export async function POST(req: NextRequest) {
  let body: { id?: string; approve?: boolean; note?: string | null }
  try { body = await req.json() } catch { body = {} }
  if (!body.id || typeof body.approve !== 'boolean') {
    return NextResponse.json({ error: 'Missing submission or decision.' }, { status: 400 })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    const { error } = await supabase.rpc('admin_review_video_submission', {
      p_id: body.id, p_approve: body.approve, p_note: body.note?.trim() || null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 403 })

    if (!body.approve) {
      const { data: sub } = await supabase
        .from('video_submissions').select('video_provider, bunny_video_id').eq('id', body.id).single()
      if (sub?.video_provider === 'bunny' && sub.bunny_video_id) {
        const deleted = await deleteBunnyVideo(sub.bunny_video_id)
        if (!deleted) logger.warn('Rejected Bunny video could not be deleted', { videoId: sub.bunny_video_id })
      }
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not save the review. Please try again.' }, { status: 500 })
  }
}
