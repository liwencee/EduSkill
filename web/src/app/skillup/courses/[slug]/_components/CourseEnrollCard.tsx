'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlayCircle, CheckCircle, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

const LANG_LABELS: Record<string, string> = {
  en: 'English', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa', pcm: 'Pidgin',
}

interface Props {
  courseId: string
  slug:     string
  price:    number
  isFree:   boolean
  firstLessonId:   string | null
  totalLessons:    number
  availableLangs:  string[]
  isOfflineReady:  boolean
}

export default function CourseEnrollCard({
  courseId,
  slug,
  price,
  isFree,
  firstLessonId,
  totalLessons,
  availableLangs,
  isOfflineReady,
}: Props) {
  const [status,  setStatus]  = useState<'loading' | 'unenrolled' | 'enrolled'>('loading')
  const [payUrl,  setPayUrl]  = useState('')

  useEffect(() => {
    if (isFree) { setStatus('unenrolled'); return }

    async function check() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setStatus('unenrolled')
          buildPayUrl()
          return
        }

        // Check if user has a paid enrollment for this course
        const { data: enr } = await supabase
          .from('enrollments')
          .select('is_paid')
          .eq('user_id',   user.id)
          .eq('course_id', courseId)
          .single()

        if (enr?.is_paid) {
          setStatus('enrolled')
        } else {
          setStatus('unenrolled')
          buildPayUrl()
        }
      } catch {
        setStatus('unenrolled')
      }
    }

    check()
  }, [courseId, isFree, price])

  function buildPayUrl() {
    setPayUrl('https://paystack.shop/pay/g2wgifbf3r')
  }

  return (
    <div className="card bg-white text-brand-ink p-6">
      {/* Thumbnail placeholder */}
      <div className="aspect-video bg-brand-blueLight rounded-xl mb-4 flex items-center justify-center">
        <PlayCircle className="w-16 h-16 text-brand-blue" />
      </div>

      {/* ── Free course ── */}
      {isFree && (
        <>
          <div className="text-2xl font-bold text-brand-ink mb-1">Free</div>
          {firstLessonId && (
            <Link
              href={`/skillup/courses/${slug}/lesson/${firstLessonId}`}
              className="btn-primary w-full mt-3 text-base text-center block">
              Start Learning Free
            </Link>
          )}
        </>
      )}

      {/* ── Paid course — loading ── */}
      {!isFree && status === 'loading' && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        </div>
      )}

      {/* ── Paid course — enrolled / access granted ── */}
      {!isFree && status === 'enrolled' && (
        <>
          <div className="text-2xl font-bold text-green-600 mb-1 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" /> Enrolled
          </div>
          <p className="text-sm text-brand-inkLight mb-3">You have lifetime access to this course</p>
          {firstLessonId && (
            <Link
              href={`/skillup/courses/${slug}/lesson/${firstLessonId}`}
              className="btn-primary w-full mt-3 text-base text-center block">
              Continue Learning
            </Link>
          )}
        </>
      )}

      {/* ── Paid course — not enrolled ── */}
      {!isFree && status === 'unenrolled' && (
        <>
          <div className="text-2xl font-bold text-brand-ink mb-1">
            ₦{price.toLocaleString()}
          </div>
          <p className="text-sm text-brand-inkLight mb-3">
            Lifetime access · One-time payment
          </p>
          <a
            href={payUrl || `/auth/login?next=/skillup/courses/${slug}`}
            className="btn-primary w-full mt-3 text-base text-center block">
            Buy Course — ₦{price.toLocaleString()}
          </a>
          {firstLessonId && (
            <Link
              href={`/skillup/courses/${slug}/lesson/${firstLessonId}`}
              className="block text-center text-sm text-brand-blue hover:underline mt-2 py-1">
              Preview first lesson free →
            </Link>
          )}
        </>
      )}

      {/* ── Features list ── */}
      <ul className="mt-4 space-y-2 text-sm text-brand-inkMid">
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
          {totalLessons} lessons
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
          AI-powered personalised lessons
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
          Verifiable certificate on completion
        </li>
        {isOfflineReady && (
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
            Works offline — download on WiFi
          </li>
        )}
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
          {availableLangs.map(l => LANG_LABELS[l] ?? l).join(', ')} subtitles
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
          Profile on OpportunityHub after cert
        </li>
        {!isFree && (
          <li className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-blue shrink-0" />
            Lifetime access after one-time purchase
          </li>
        )}
      </ul>
    </div>
  )
}
