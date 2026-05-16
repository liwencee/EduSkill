'use client'

/**
 * Global error boundary — catches unhandled errors in any route segment.
 * Shown when an error bubbles up past all nested error.tsx files.
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In production this goes to Vercel log drain / Sentry via structured logger.
    // In dev it gives a visible trace.
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4 font-sans">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#2C2C2A] mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            An unexpected error occurred. Our team has been notified. Please
            try again or return to the homepage.
          </p>

          {/* Digest (only shown in dev) */}
          {process.env.NODE_ENV !== 'production' && error?.message && (
            <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-red-600 mb-6 text-left overflow-auto max-h-32 whitespace-pre-wrap break-all">
              {error.message}
            </pre>
          )}

          {/* Error digest for production support */}
          {error?.digest && (
            <p className="text-xs text-gray-400 mb-6">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-[#378ADD] text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-[#1E4F8A] transition-colors">
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 border border-gray-200 text-[#2C2C2A] text-sm font-medium px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Home className="w-4 h-4" />
              Back to homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
