'use client'
import { useEffect, type RefObject } from 'react'

/**
 * Tracks how a learner watches an embedded YouTube lesson video and sends
 * heartbeats to /api/video-watch for the creator analytics dashboard.
 *
 * Uses YouTube's iframe postMessage protocol directly (the embed must have
 * `enablejsapi=1`), so no external script is loaded — the CSP stays as is.
 * Only real playback time is counted: paused/buffering time is ignored.
 */

const YT_ORIGIN    = 'https://www.youtube.com'
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
  courseSlug:  string
  lessonKey:   string
  lessonTitle: string
  enabled:     boolean
}

export function useVideoWatchTracking(
  iframeRef: RefObject<HTMLIFrameElement>,
  { courseSlug, lessonKey, lessonTitle, enabled }: Options,
) {
  useEffect(() => {
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

    const payload = () => JSON.stringify({
      viewerKey, courseSlug, lessonKey, lessonTitle,
      deltaSecs: Math.round(pending), positionSecs: position, durationSecs: duration,
    })

    function flush(useBeacon = false) {
      // A "view" only counts once the video has actually played.
      if (!everPlayed) return
      if (pending < 1 && Math.round(position) === lastSentPos) return
      const body = payload()
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

    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || e.source !== iframe?.contentWindow) return
      let data: any
      try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data } catch { return }
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
    }

    // Ask the embed to start streaming its state to us. Retry until it answers
    // (the iframe may still be loading when this effect first runs).
    function listen() {
      iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: lessonKey, channel: 'widget' }), YT_ORIGIN)
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
  }, [iframeRef, courseSlug, lessonKey, lessonTitle, enabled])
}
