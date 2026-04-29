/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'customer-*.cloudflarestream.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    // Streaming for AI lesson planner
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  // Compress responses for 2G users
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
