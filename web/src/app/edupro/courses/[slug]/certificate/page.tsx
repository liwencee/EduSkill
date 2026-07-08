'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CPD_COURSES } from '@/lib/static-cpd-courses'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Download, Award, CheckCircle, Share2, Loader2,
  Lock, AlertTriangle, RefreshCw, LogIn, ShieldCheck,
} from 'lucide-react'

interface LessonResult {
  lesson_id: string
  best_score: number
}

interface CertRecord {
  overall_score:  number
  certificate_id: string
  full_name:      string
  teacher_id:     string | null
  school:         string | null
  state:          string | null
  issued_at:      string
}

export default function CPDCertificatePage() {
  const params = useParams()
  const slug = params.slug as string
  const course = CPD_COURSES.find(c => c.slug === slug)

  const [loading,   setLoading]   = useState(true)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [results,   setResults]   = useState<LessonResult[]>([])
  const [existingCert, setExistingCert] = useState<CertRecord | null>(null)

  const [fullName, setFullName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [school, setSchool] = useState('')
  const [state, setState] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  const allLessons = course ? course.modules.flatMap(m => m.lessons) : []

  useEffect(() => {
    if (!course) { setLoading(false); return }

    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const [{ data: resData }, { data: certData }] = await Promise.all([
        supabase
          .from('cpd_lesson_results')
          .select('lesson_id, best_score')
          .eq('user_id', user.id)
          .eq('course_slug', course!.slug),
        supabase
          .from('cpd_certificates')
          .select('overall_score, certificate_id, full_name, teacher_id, school, state, issued_at')
          .eq('user_id', user.id)
          .eq('course_slug', course!.slug)
          .maybeSingle(),
      ])

      setResults(resData ?? [])
      if (certData) setExistingCert(certData as CertRecord)
      setLoading(false)
    }
    load()
  }, [course])

  if (!course) {
    return (
      <div className="bg-brand-bg min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="font-bold text-brand-ink text-xl mb-2">Course Not Found</p>
          <Link href="/edupro/courses" className="btn-primary mt-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  // ── Compute aggregate score across every lesson in the course ──────────────
  const scoreByLesson = new Map(results.map(r => [r.lesson_id, r.best_score]))
  const lessonBreakdown = allLessons.map(l => ({
    id: l.id,
    title: l.title,
    score: scoreByLesson.get(l.id) ?? 0,
    attempted: scoreByLesson.has(l.id),
  }))
  const overallScore = allLessons.length > 0
    ? Math.round(lessonBreakdown.reduce((sum, l) => sum + l.score, 0) / allLessons.length)
    : 0
  const hasPassed = overallScore >= course.pass_mark && lessonBreakdown.every(l => l.attempted)
  const incompleteLessons = lessonBreakdown.filter(l => !l.attempted || l.score < course!.pass_mark)

  const NIGERIAN_STATES = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
    'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
    'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
    'Taraba','Yobe','Zamfara'
  ]

  async function handleGenerate() {
    if (!fullName.trim() || !teacherId.trim() || !userId) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const certificateId = `SBN-CPD-${slug.slice(0, 4).toUpperCase()}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

      const { error } = await supabase.from('cpd_certificates').insert({
        user_id:        userId,
        course_slug:    course!.slug,
        course_title:   course!.title,
        overall_score:  overallScore,
        certificate_id: certificateId,
        full_name:      fullName.trim(),
        teacher_id:     teacherId.trim() || null,
        school:         school.trim() || null,
        state:          state || null,
      })

      if (error) {
        toast.error(error.message.includes('duplicate')
          ? 'You already have a certificate for this course.'
          : 'Could not issue certificate — please try again.')
        // Reload in case it already exists (e.g. race / already claimed)
        const { data: certData } = await supabase
          .from('cpd_certificates')
          .select('overall_score, certificate_id, full_name, teacher_id, school, state, issued_at')
          .eq('user_id', userId)
          .eq('course_slug', course!.slug)
          .maybeSingle()
        if (certData) setExistingCert(certData as CertRecord)
      } else {
        setExistingCert({
          overall_score:  overallScore,
          certificate_id: certificateId,
          full_name:      fullName.trim(),
          teacher_id:     teacherId.trim() || null,
          school:         school.trim() || null,
          state:          state || null,
          issued_at:      new Date().toISOString(),
        })
        toast.success('Certificate issued!')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  // ── Not signed in ────────────────────────────────────────────────────────
  if (!userId) {
    return (
      <div className="bg-brand-bg min-h-screen">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-brand-blueLight rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-brand-blue" />
          </div>
          <h1 className="text-xl font-bold text-brand-ink mb-2">Sign In to Claim Your Certificate</h1>
          <p className="text-sm text-brand-inkMid mb-6">
            We need to verify your quiz scores for <strong>{course.title}</strong> before issuing a certificate.
          </p>
          <Link href={`/auth/login?next=/edupro/courses/${slug}/certificate`} className="btn-primary inline-flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Log In
          </Link>
        </div>
      </div>
    )
  }

  const dateStr = existingCert
    ? new Date(existingCert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Link href={`/edupro/courses/${course.slug}`} className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-6 no-print">
          <ArrowLeft className="w-4 h-4" /> Back to {course.title}
        </Link>

        {/* ─── Not yet passed: blocking screen ─── */}
        {!existingCert && !hasPassed && (
          <div className="bg-white rounded-2xl border border-[#E0DDD5] p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-brand-ink mb-1">Not Yet Eligible</h1>
              <p className="text-sm text-brand-inkMid">
                You need an average score of <strong>{course.pass_mark}%</strong> across all {allLessons.length} lessons to earn this certificate.
                Your current average is <strong>{overallScore}%</strong>.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Lessons still needed
              </p>
              <ul className="space-y-2">
                {incompleteLessons.map(l => (
                  <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-brand-ink">{l.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold ${l.attempted ? 'text-amber-700' : 'text-brand-inkLight'}`}>
                        {l.attempted ? `${l.score}%` : 'Not attempted'}
                      </span>
                      <Link href={`/edupro/courses/${course.slug}/lesson/${l.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline">
                        <RefreshCw className="w-3 h-3" /> {l.attempted ? 'Retake' : 'Start'}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-brand-inkLight text-center">
              Retaking a lesson&apos;s knowledge check has no penalty — only your best score is kept.
            </p>
          </div>
        )}

        {/* ─── Passed, no certificate yet: claim form ─── */}
        {!existingCert && hasPassed && (
          <div className="bg-white rounded-2xl border border-[#E0DDD5] p-8 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-brand-ink mb-1">Claim Your CPD Certificate</h1>
              <p className="text-sm text-brand-inkMid">
                You&apos;ve completed <strong>{course.title}</strong> with a verified average score of <strong className="text-green-600">{overallScore}%</strong>.
                Enter your details to generate your certificate.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Full Name (as it appears on certificate)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="input"
                  placeholder="e.g. Adeyemi Folashade Oluwabunmi"
                />
              </div>
              <div>
                <label className="label">TRCN / Teacher ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="input"
                  placeholder="e.g. TRCN/2024/12345"
                />
                <p className="text-xs text-brand-inkLight mt-1">
                  Required — this certificate is evidence toward your TRCN professional record.
                </p>
              </div>
              <div>
                <label className="label">School / Institution <span className="text-brand-inkLight font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  className="input"
                  placeholder="e.g. Federal Government College, Lagos"
                />
              </div>
              <div>
                <label className="label">State</label>
                <select value={state} onChange={e => setState(e.target.value)} className="input">
                  <option value="">Select your state…</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!fullName.trim() || !teacherId.trim() || submitting}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Issuing…</>
                : <><Award className="w-4 h-4" /> Generate Certificate</>}
            </button>
          </div>
        )}

        {/* ─── Certificate (existing or just issued) ─── */}
        {existingCert && (
          <div>
            {/* Action bar */}
            <div className="flex items-center justify-between mb-6 no-print">
              <h1 className="text-xl font-bold text-brand-ink">Your CPD Certificate</h1>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4">
                  <Download className="w-4 h-4" /> Download / Print
                </button>
              </div>
            </div>

            {/* Certificate card */}
            <div ref={certRef} id="cpd-certificate" className="relative bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

              {/* Top brand bar */}
              <div className="h-3 bg-gradient-to-r from-[#378ADD] via-[#F37321] to-[#378ADD]" />

              {/* Ornate double border frame */}
              <div className="absolute inset-x-3 inset-y-6 border-[3px] border-[#378ADD]/15 rounded-xl pointer-events-none print:inset-x-2 print:inset-y-4" />
              <div className="absolute inset-x-5 inset-y-8 border border-[#F37321]/25 rounded-lg pointer-events-none print:inset-x-4 print:inset-y-6" />

              {/* Faint dot-grid texture */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(55,138,221,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

              {/* Ghost watermark — Skillora logo, large + faint, behind all content */}
              <img
                src="/Skillora.png"
                alt=""
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] max-w-none opacity-[0.045] select-none pointer-events-none"
              />
              {/* Ghost watermark — repeated diagonal wordmark, extra anti-forgery texture */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.035] select-none" aria-hidden="true">
                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-x-10 gap-y-6 -rotate-[28deg] scale-125">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} className="text-2xl font-black text-[#1E4F8A] whitespace-nowrap tracking-widest">SKILLORA</span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 p-10 sm:p-16">

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#378ADD] to-[#1E4F8A] rounded-xl flex items-center justify-center shadow-[0_3px_0_rgba(30,79,138,0.4)]">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#378ADD] text-xl leading-tight tracking-tight">Skillora</p>
                    </div>
                  </div>
                  <h2 className="text-sm font-semibold text-[#9A9A97] uppercase tracking-[0.25em] mb-2">
                    Certificate of Completion
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F37321]" />
                    <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#378ADD] to-transparent" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F37321]" />
                  </div>
                  <p className="text-sm text-[#9A9A97]">Continuing Professional Development</p>
                </div>

                {/* This certifies */}
                <div className="text-center mb-8">
                  <p className="text-sm text-[#5A5A58] mb-3">This is to certify that</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#2C2C2A] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    {existingCert.full_name}
                  </p>
                  {existingCert.teacher_id && (
                    <p className="text-sm text-[#9A9A97] mb-1">{existingCert.teacher_id}</p>
                  )}
                  {existingCert.school && (
                    <p className="text-sm text-[#5A5A58]">{existingCert.school}{existingCert.state ? `, ${existingCert.state} State` : ''}</p>
                  )}
                  {!existingCert.school && existingCert.state && (
                    <p className="text-sm text-[#5A5A58]">{existingCert.state} State</p>
                  )}
                </div>

                {/* Course details */}
                <div className="text-center mb-8">
                  <p className="text-sm text-[#5A5A58] mb-2">has successfully completed the CPD course</p>
                  <div className="bg-[#EBF4FF] border border-[#378ADD]/20 rounded-xl px-6 py-4 inline-block shadow-sm">
                    <p className="text-xl font-bold text-[#378ADD]">{course.title}</p>
                    <p className="text-xs text-[#5A5A58] mt-1">
                      {course.weeks} weeks · {course.total_lessons} lessons · {course.modules.length} modules · all lessons completed
                    </p>
                  </div>
                </div>

                {/* Score + PASS badge */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-400 rounded-full px-6 py-2 shadow-[0_2px_0_rgba(34,197,94,0.25)]">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700 text-lg tracking-wide">PASS — {existingCert.overall_score}%</span>
                  </div>
                  <p className="text-xs text-[#9A9A97] mt-2">
                    Verified average score across {allLessons.length} knowledge checks · pass mark {course.pass_mark}%
                  </p>
                </div>

                {/* Aligned to */}
                <div className="text-center mb-8">
                  <p className="text-xs text-[#9A9A97] uppercase tracking-wider mb-2">Aligned to</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {course.nerdc_alignment.slice(0, 3).map((item, i) => (
                      <span key={i} className="text-xs bg-[#F1EFE8] text-[#5A5A58] px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Seal + Date + Certificate ID */}
                <div className="border-t border-[#E0DDD5] pt-6 grid sm:grid-cols-3 gap-6 items-center text-center">
                  <div>
                    <p className="text-xs text-[#9A9A97] uppercase tracking-wider mb-1">Date Issued</p>
                    <p className="text-sm font-semibold text-[#2C2C2A]">{dateStr}</p>
                  </div>

                  {/* Official seal */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#F37321] to-[#c2570f] flex items-center justify-center shadow-[0_3px_0_rgba(154,52,18,0.5)] ring-4 ring-[#F37321]/15">
                      <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-[#9A9A97] uppercase tracking-widest mt-1.5">Verified Certificate</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#9A9A97] uppercase tracking-wider mb-1">Certificate ID</p>
                    <p className="text-sm font-mono font-semibold text-[#378ADD]">{existingCert.certificate_id}</p>
                  </div>
                </div>

                {/* Issuer + signature line */}
                <div className="mt-6 pt-6 border-t border-dashed border-[#E0DDD5] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-lg text-[#378ADD]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Skillora Certification Authority</p>
                    <div className="w-40 h-px bg-[#D5D2C8] my-1 mx-auto sm:mx-0" />
                    <p className="text-xs text-[#9A9A97]">Issued by Skillora · EduPro CPD Programme</p>
                  </div>
                  <p className="text-xs text-[#9A9A97] text-center sm:text-right">
                    Verify this certificate at<br className="hidden sm:block" /> skillora.ng/verify/{existingCert.certificate_id}
                  </p>
                </div>
              </div>

              {/* Bottom brand bar */}
              <div className="h-3 bg-gradient-to-r from-[#378ADD] via-[#F37321] to-[#378ADD]" />
            </div>

            {/* Post-certificate actions */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4 no-print">
              <Link href="/edupro/courses" className="card p-5 flex items-center gap-3 hover:border-brand-blue/40">
                <div className="w-10 h-10 bg-brand-blueLight rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <p className="font-semibold text-brand-ink text-sm">Explore More Courses</p>
                  <p className="text-xs text-brand-inkMid">Continue your CPD journey</p>
                </div>
              </Link>
              <Link href="/dashboard/certificates" className="card p-5 flex items-center gap-3 hover:border-brand-blue/40">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5 text-[#F37321]" />
                </div>
                <div>
                  <p className="font-semibold text-brand-ink text-sm">My Certificates</p>
                  <p className="text-xs text-brand-inkMid">View your full portfolio</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #cpd-certificate, #cpd-certificate * { visibility: visible; }
          #cpd-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          header, nav, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
