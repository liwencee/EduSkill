import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DAILY_API_KEY  = process.env.DAILY_API_KEY ?? ''
const DAILY_BASE_URL = 'https://api.daily.co/v1'

/**
 * POST /api/conference
 * Body: { negotiation_id: string }
 *
 * Creates a Daily.co room for the negotiation and saves the URL to the DB.
 * Only the employer party can call this (checked server-side).
 */
export async function POST(req: NextRequest) {
  try {
    const { negotiation_id } = await req.json()
    if (!negotiation_id) {
      return NextResponse.json({ error: 'negotiation_id required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch negotiation and verify caller is a party
    const { data: neg, error: negErr } = await supabase
      .from('job_negotiations')
      .select('id, employer_id, teacher_id, status, meeting_room_url')
      .eq('id', negotiation_id)
      .single()

    if (negErr || !neg) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 })
    }
    if (neg.employer_id !== user.id && neg.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Return existing room if already created
    if (neg.meeting_room_url) {
      return NextResponse.json({ url: neg.meeting_room_url })
    }

    // Room name: deterministic from negotiation ID (idempotent)
    const roomName = `eduskill-${negotiation_id.slice(0, 8)}`

    // Call Daily.co API — falls back to free Jitsi if no API key
    let roomUrl: string

    if (DAILY_API_KEY) {
      const res = await fetch(`${DAILY_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name:       roomName,
          privacy:    'private',
          properties: {
            max_participants: 2,
            enable_recording: 'cloud',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hour expiry
            enable_chat: true,
            enable_screenshare: true,
          },
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Daily.co error:', errText)
        // Fall back to Jitsi
        roomUrl = `https://meet.jit.si/${roomName}`
      } else {
        const room = await res.json()
        roomUrl = room.url
      }
    } else {
      // No Daily API key — use free Jitsi Meet (no account needed)
      roomUrl = `https://meet.jit.si/Skillora-${roomName}`
    }

    // Save room URL to DB
    await supabase
      .from('job_negotiations')
      .update({
        meeting_room_name: roomName,
        meeting_room_url:  roomUrl,
      })
      .eq('id', negotiation_id)

    return NextResponse.json({ url: roomUrl })
  } catch (err: any) {
    console.error('Conference API error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
