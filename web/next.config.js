/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'customer-*.cloudflarestream.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Compress responses for 2G/3G users in Nigeria
  compress: true,
  poweredByHeader: false,

  // ── HTTP Cache-Control + Security Headers ──────────────────────
  async headers() {
    // Derive the Supabase API origin from the env var so the CSP always
    // matches wherever Supabase actually lives (self-hosted Kong on Railway,
    // a custom domain like api.skillora.ng, or Supabase Cloud). Without this,
    // the browser blocks every auth/data fetch as a connect-src violation.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    // Keep the configured scheme: production is https/wss, while a local
    // `supabase start` stack is plain http/ws on 127.0.0.1:54321.
    let supabaseHttp = ''
    let supabaseWs   = ''
    try {
      const u = new URL(supabaseUrl)
      supabaseHttp = `${u.protocol}//${u.host}`
      supabaseWs   = `${u.protocol === 'http:' ? 'ws:' : 'wss:'}//${u.host}`
    } catch { /* unset or malformed — middleware logs this */ }

    const connectSrc = [
      "'self'",
      supabaseHttp,
      supabaseWs,
      'https://*.supabase.co',       // legacy Supabase Cloud (harmless fallback)
      'wss://*.supabase.co',
      'https://api.openai.com',
      'https://paystack.com',
      'https://cloudflareinsights.com', // Cloudflare Web Analytics beacon
      'https://video.bunnycdn.com',     // Bunny Stream: creators' direct (TUS) video uploads
    ].filter(Boolean).join(' ')

    /** Security headers applied to every route */
    const securityHeaders = [
      { key: 'X-Content-Type-Options',    value: 'nosniff' },
      { key: 'X-Frame-Options',           value: 'DENY' },
      { key: 'X-XSS-Protection',          value: '1; mode=block' },
      { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",   // Next.js needs unsafe-inline
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          // Allow Bunny Stream + YouTube players and Paystack iframes
          "frame-src 'self' https://iframe.mediadelivery.net https://www.youtube.com https://www.youtube-nocookie.com https://paystack.com",
          `connect-src ${connectSrc}`,
          "frame-ancestors 'none'",
        ].join('; '),
      },
    ]

    return [
      // ── Apply security headers to all pages ──────────────────
      {
        source: '/(.*)',
        headers: securityHeaders,
      },

      // ── Next.js static chunks — immutable, 1 year ────────────
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // ── Public image assets — 7 days ─────────────────────────
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },

      // ── Course & CPD listing pages — 5 min + SWR ─────────────
      {
        source: '/(edupro|skillup)/courses',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=600' },
        ],
      },

      // ── Static marketing pages — 1 hour ──────────────────────
      {
        source: '/(about|faq|terms|privacy|partnerships|impact|employer)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=7200' },
        ],
      },

      // ── API routes — never cache ──────────────────────────────
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma',        value: 'no-cache' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
