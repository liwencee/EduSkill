import { createHash } from 'crypto'

/**
 * Bunny Stream helpers — SERVER ONLY (uses the library API key and the
 * token-authentication key). Never import this from a client component.
 *
 * Env (see .env.example):
 *   BUNNY_STREAM_LIBRARY_ID                Video library id (number shown in Bunny → Stream → API)
 *   BUNNY_STREAM_API_KEY                   Library API key (secret)
 *   BUNNY_STREAM_TOKEN_KEY                 Embed "Token authentication key" (secret; optional but
 *                                          required to protect paid lessons)
 *   NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME  e.g. vz-1234abcd-567.b-cdn.net (thumbnails)
 */

const API = 'https://video.bunnycdn.com'
export const BUNNY_EMBED_ORIGIN = 'https://iframe.mediadelivery.net'

function env() {
  return {
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID ?? '',
    apiKey:    process.env.BUNNY_STREAM_API_KEY ?? '',
    tokenKey:  process.env.BUNNY_STREAM_TOKEN_KEY ?? '',
    cdnHost:   process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME ?? '',
  }
}

/** Uploads need the library id + API key; playback works with just the library id. */
export function bunnyConfigured() {
  const e = env()
  return !!(e.libraryId && e.apiKey)
}

/** Playing a video only needs the library id (plus the token key, if signing is on in Bunny). */
export function bunnyPlaybackConfigured() {
  return !!env().libraryId
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

/** Create an empty video in the library; returns its GUID. */
export async function createBunnyVideo(title: string): Promise<string> {
  const { libraryId, apiKey } = env()
  const res = await fetch(`${API}/library/${libraryId}/videos`, {
    method:  'POST',
    headers: { AccessKey: apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ title: title.slice(0, 200) }),
  })
  if (!res.ok) throw new Error(`Bunny create video failed: HTTP ${res.status}`)
  const data = await res.json() as { guid?: string }
  if (!data.guid) throw new Error('Bunny create video returned no guid')
  return data.guid
}

/**
 * Credentials for a direct browser → Bunny TUS upload of one video.
 * Signature = SHA256(library_id + api_key + expiration_time + video_id).
 */
export function bunnyUploadSignature(videoId: string, ttlSeconds = 6 * 3600) {
  const { libraryId, apiKey } = env()
  const expire = Math.floor(Date.now() / 1000) + ttlSeconds
  return {
    endpoint:  `${API}/tusupload`,
    libraryId,
    videoId,
    expire,
    signature: sha256(libraryId + apiKey + expire + videoId),
  }
}

/**
 * Player URL for a video. With a token key configured, the URL is signed
 * and expires — copying it elsewhere stops working after `ttlSeconds`.
 * Token = SHA256(token_key + video_id + expiration).
 */
export function bunnyEmbedUrl(videoId: string, ttlSeconds = 4 * 3600) {
  const { libraryId, tokenKey } = env()
  const params = new URLSearchParams({ autoplay: 'false', preload: 'false', responsive: 'true' })
  if (tokenKey) {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds
    params.set('token', sha256(tokenKey + videoId + expires))
    params.set('expires', String(expires))
  }
  return `${BUNNY_EMBED_ORIGIN}/embed/${libraryId}/${videoId}?${params}`
}

export function bunnyThumbnailUrl(videoId: string) {
  const { cdnHost } = env()
  return cdnHost ? `https://${cdnHost}/${videoId}/thumbnail.jpg` : null
}

/** Bunny's processing states (GET /library/{id}/videos/{guid} → status). */
export const BUNNY_STATUS: Record<number, string> = {
  0: 'Waiting for upload', 1: 'Uploaded', 2: 'Processing', 3: 'Encoding',
  4: 'Ready', 5: 'Encoding failed', 6: 'Upload failed',
}

export async function getBunnyVideo(videoId: string): Promise<{ status: number; lengthSecs: number } | null> {
  const { libraryId, apiKey } = env()
  if (!libraryId || !apiKey) return null
  try {
    const res = await fetch(`${API}/library/${libraryId}/videos/${videoId}`, {
      headers: { AccessKey: apiKey, Accept: 'application/json' },
      cache:   'no-store',
    })
    if (!res.ok) return null
    const v = await res.json() as { status?: number; length?: number }
    return { status: v.status ?? -1, lengthSecs: v.length ?? 0 }
  } catch {
    return null
  }
}

export async function deleteBunnyVideo(videoId: string): Promise<boolean> {
  const { libraryId, apiKey } = env()
  if (!libraryId || !apiKey) return false
  try {
    const res = await fetch(`${API}/library/${libraryId}/videos/${videoId}`, {
      method: 'DELETE', headers: { AccessKey: apiKey },
    })
    return res.ok
  } catch {
    return false
  }
}
