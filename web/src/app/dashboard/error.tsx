'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#1E1B4B] mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-2">
          The dashboard couldn&apos;t load. This is usually caused by a missing
          configuration on the server.
        </p>
        {error?.message && (
          <p className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-red-600 mb-6 text-left break-all">
            {error.message}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-[#4F46E5] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
          <Link href="/auth/login"
            className="text-sm text-[#4F46E5] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
