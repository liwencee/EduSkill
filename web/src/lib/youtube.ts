/** Extract the 11-character YouTube video ID from any YouTube URL format */
export function getYouTubeId(url: string): string | null {
  const m = url.trim().match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export function youTubeThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}

/**
 * Check in the browser whether a YouTube video can be played by the public.
 * YouTube serves a tiny 120×90 placeholder thumbnail for deleted or private
 * videos; real (public or unlisted) videos have a 320×180 mqdefault.jpg.
 */
export function checkYouTubeAvailable(id: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload  = () => resolve(img.naturalWidth > 120)
    img.onerror = () => resolve(false)
    img.src = youTubeThumb(id)
  })
}
