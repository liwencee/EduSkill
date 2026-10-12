'use client'
import { useCallback, useEffect, useState, type RefObject } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Tracks how a learner watches an embedded lesson video and sends
 * heartbeats to /api/video-watch for the creator analytics dashboard.
 *
 * Talks to the player over postMessage directly, so no external script is
 * loaded and the CSP stays as is:
 *   - YouTube: the iframe API protocol (the embed must have `enablejsapi=1`)
 *   - Bunny Stream: the player.js protocol its embed player implements
 * Only real playback time is counted: paused/buffering time is ignored.
 */

const YT_ORIGIN    = 'https://www.youtube.com'
const BUNNY_ORIGIN = 'https://iframe.mediadelivery.net'
const PLAYERJS     = { context: 'player.js', version: '0.0.11' }
/** Played time is recorded in blocks of this many seconds (ticks on video parts). */
export const WATCH_BLOCK_SECS = 10
const FLUSH_EVERY  = 15_000   // ms between heartbeats while playing
const VIEWER_KEY   = 'skillora_viewer_id'

function getViewerKey(): string {
  try {
    let id = localStorage.getItem(VIEWER_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VIEWER_KEY, id)
    }
    return id
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`
  }
}

interface Options {
  provider:    'youtube' | 'bunny'
  courseSlug:  string
  lessonKey:   string
  lessonTitle: string
  enabled:     boolean
}

export function useVideoWatchTracking(
  iframeRef: RefObject<HTMLIFrameElement>,
  { provider, courseSlug, lessonKey, lessonTitle, enabled }: Options,
) {
  // Whole-second playback position and length, for the parts list under the player
  const [time, setTime] = useState({ position: 0, duration: 0 })
  // 10-second blocks this learner has actually played (saved in the database:
  // by account when signed in, so ticks follow them across devices)
  const [watched, setWatched] = useState<Set<number>>(new Set())

  useEffect(() => {
    setTime({ position: 0, duration: 0 })
    setWatched(new Set())
    const iframe = iframeRef.current
    if (!enabled || !iframe) return

    const viewerKey = getViewerKey()
    let playing   = false
    let position  = 0
    let duration  = 0
    let pending   = 0          // seconds of playback not yet reported
    let lastTick  = Date.now()
    let heardBack = false
    let lastSentPos = -1
    let everPlayed  = false
    let blockPos: number | null = null      // last position seen, for continuous-play detection
    const newBlocks = new Set<number>()     // played since the last heartbeat
    let cancelled = false

    // What this learner already watched (any device, if signed in)
    ;(async () => {
      try {
        const { data } = await createClient().rpc('my_watched_blocks', {
          p_viewer_key: viewerKey, p_course_slug: courseSlug, p_lesson_key: lessonKey,
        })
        if (!cancelled && Array.isArray(data) && data.length) {
          setWatched(w => new Set([...w, ...data.filter((b: unknown) => Number.isInteger(b))]))
        }
      } catch { /* offline or DB unavailable — ticks start fresh */ }
    })()

    function report() {
      // Only continuous playback counts: a jump (seek) doesn't mark what was skipped
      const prev = blockPos
      blockPos = position
      if (prev !== null && position > prev && position - prev <= 5) {
        const added: number[] = []
        for (let b = Math.floor(prev / WATCH_BLOCK_SECS); b <= Math.floor((position - 0.5) / WATCH_BLOCK_SECS); b++) {
          if (!newBlocks.has(b)) { newBlocks.add(b); added.push(b) }
        }
        if (added.length) setWatched(w => (added.every(b => w.has(b)) ? w : new Set([...w, ...added])))
      }
      const p = Math.floor(position), d = Math.floor(duration)
      setTime(t => (t.position === p && t.duration === d ? t : { position: p, duration: d }))
    }

    const payload = () => JSON.stringify({
      viewerKey, courseSlug, lessonKey, lessonTitle,
      deltaSecs: Math.round(pending), positionSecs: position, durationSecs: duration,
      blocks: [...newBlocks].slice(0, 12),
    })

    function flush(useBeacon = false) {
      // A "view" only counts once the video has actually played.
      if (!everPlayed) return
      if (pending < 1 && Math.round(position) === lastSentPos && newBlocks.size === 0) return
      const body = payload()
      ;[...newBlocks].slice(0, 12).forEach(b => newBlocks.delete(b))
      pending = 0
      lastSentPos = Math.round(position)
      try {
        if (useBeacon && navigator.sendBeacon) {
          navigator.sendBeacon('/api/video-watch', new Blob([body], { type: 'text/plain' }))
        } else {
          fetch('/api/video-watch', { method: 'POST', body, keepalive: true }).catch(() => {})
        }
      } catch { /* never break playback */ }
    }

    // Accumulate wall-clock time only while the player reports "playing".
    function tick() {
      const now = Date.now()
      if (playing) { everPlayed = true; pending += Math.min((now - lastTick) / 1000, 5) }
      lastTick = now
    }

    const origin = provider === 'bunny' ? BUNNY_ORIGIN : YT_ORIGIN

    function onMessage(e: MessageEvent) {
      if (e.origin !== origin || e.source !== iframe?.contentWindow) return
      let data: any
      try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data } catch { return }

      if (provider === 'bunny') {
        if (data?.context !== 'player.js') return
        heardBack = true
        switch (data.event) {
          case 'ready':      subscribe(); break
          case 'play':       tick(); playing = true; break
          case 'pause':      tick(); playing = false; flush(); break
          case 'ended':      tick(); playing = false; position = duration || position; flush(); break
          case 'timeupdate':
            if (typeof data.value?.seconds === 'number') position = data.value.seconds
            if (typeof data.value?.duration === 'number' && data.value.duration > 0) duration = data.value.duration
            break
        }
        report()
        return
      }

      heardBack = true
      const info = data?.info
      if (data?.event === 'onStateChange' && typeof info === 'number') {
        tick()
        playing = info === 1
        if (info === 0 || info === 2) flush()     // ended or paused → report promptly
      } else if (info && typeof info === 'object') {
        if (typeof info.currentTime === 'number') position = info.currentTime
        if (typeof info.duration === 'number' && info.duration > 0) duration = info.duration
        if (typeof info.playerState === 'number') {
          tick()
          playing = info.playerState === 1
        }
      }
      report()
    }

    // Bunny (player.js): once the player says "ready", subscribe to its events.
    function subscribe() {
      for (const ev of ['play', 'pause', 'ended', 'timeupdate']) {
        iframe?.contentWindow?.postMessage(
          JSON.stringify({ ...PLAYERJS, method: 'addEventListener', value: ev, listener: `skillora-${ev}` }),
          BUNNY_ORIGIN,
        )
      }
    }

    // Ask the embed to start streaming its state to us. Retry until it answers
    // (the iframe may still be loading when this effect first runs).
    function listen() {
      if (provider === 'bunny') {
        // A player that was ready before we listened won't repeat "ready" —
        // subscribing directly covers that case too.
        subscribe()
      } else {
        iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: lessonKey, channel: 'widget' }), YT_ORIGIN)
      }
    }
    let tries = 0
    const handshake = setInterval(() => {
      if (heardBack || ++tries > 20) { clearInterval(handshake); return }
      listen()
    }, 1000)
    iframe.addEventListener('load', listen)

    const ticker  = setInterval(tick, 1000)
    const flusher = setInterval(() => { tick(); flush() }, FLUSH_EVERY)

    function onHide() { tick(); flush(true) }
    const onVisibility = () => { if (document.visibilityState === 'hidden') onHide() }

    window.addEventListener('message', onMessage)
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      tick()
      flush(true)
      clearInterval(handshake)
      clearInterval(ticker)
      clearInterval(flusher)
      iframe.removeEventListener('load', listen)
      window.removeEventListener('message', onMessage)
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [iframeRef, provider, courseSlug, lessonKey, lessonTitle, enabled])

  /** Jump to a point in the video and play from there. */
  const seekTo = useCallback((seconds: number) => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    if (provider === 'bunny') {
      win.postMessage(JSON.stringify({ ...PLAYERJS, method: 'setCurrentTime', value: seconds }), BUNNY_ORIGIN)
      win.postMessage(JSON.stringify({ ...PLAYERJS, method: 'play' }), BUNNY_ORIGIN)
    } else {
      win.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }), YT_ORIGIN)
      win.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), YT_ORIGIN)
    }
  }, [iframeRef, provider])

  return { position: time.position, duration: time.duration, watched, seekTo }
}
