'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CPD_COURSES } from '@/lib/static-cpd-courses'
import { ArrowLeft, Download, Award, CheckCircle, Share2 } from 'lucide-react'

export default function CPDCertificatePage() {
  const params = useParams()
  const slug = params.slug as string
  const course = CPD_COURSES.find(c => c.slug === slug)

  const [fullName, setFullName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [school, setSchool] = useState('')
  const [state, setState] = useState('')
  const [generated, setGenerated] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

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

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const certId = `SBN-CPD-${slug.slice(0, 4).toUpperCase()}-${today.getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  function handleGenerate() {
    if (!fullName.trim()) return
    setGenerated(true)
  }

  function handlePrint() {
    window.print()
  }

  const NIGERIAN_STATES = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
    'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
    'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
    'Taraba','Yobe','Zamfara'
  ]

  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Link href={`/edupro/courses/${course.slug}`} className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to {course.title}
        </Link>

        {!generated ? (
          /* ─── Form ─── */
          <div className="bg-white rounded-2xl border border-[#E0DDD5] p-8 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-blueLight rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-brand-blue" />
              </div>
              <h1 className="text-2xl font-bold text-brand-ink mb-1">Claim Your CPD Certificate</h1>
              <p className="text-sm text-brand-inkMid">
                You&apos;ve completed <strong>{course.title}</strong>. Enter your details to generate your verifiable certificate.
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
                <label className="label">TRCN / Teacher ID <span className="text-brand-inkLight font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="input"
                  placeholder="e.g. TRCN/2024/12345"
                />
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
              disabled={!fullName.trim()}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" /> Generate Certificate
            </button>
          </div>
        ) : (
          /* ─── Certificate ─── */
          <div>
            {/* Action bar */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-brand-ink">Your CPD Certificate</h1>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4">
                  <Download className="w-4 h-4" /> Download / Print
                </button>
              </div>
            </div>

            {/* Certificate card */}
            <div ref={certRef} id="cpd-certificate" className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

              {/* Top brand bar */}
              <div className="h-3 bg-gradient-to-r from-[#378ADD] via-[#EF9F27] to-[#378ADD]" />

              <div className="p-10 sm:p-14">

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-[#378ADD] rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#378ADD] text-lg leading-tight">Skillora</p>
                      <p className="font-bold text-[#EF9F27] text-lg leading-tight -mt-1">Nigeria</p>
                    </div>
                  </div>
                  <h2 className="text-sm font-semibold text-[#9A9A97] uppercase tracking-[0.2em] mb-2">
                    Certificate of Completion
                  </h2>
                  <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#378ADD] to-transparent mx-auto mb-4" />
                  <p className="text-sm text-[#9A9A97]">Continuing Professional Development</p>
                </div>

                {/* This certifies */}
                <div className="text-center mb-8">
                  <p className="text-sm text-[#5A5A58] mb-3">This is to certify that</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#2C2C2A] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    {fullName}
                  </p>
                  {teacherId && (
                    <p className="text-sm text-[#9A9A97] mb-1">{teacherId}</p>
                  )}
                  {school && (
                    <p className="text-sm text-[#5A5A58]">{school}{state ? `, ${state} State` : ''}</p>
                  )}
                  {!school && state && (
                    <p className="text-sm text-[#5A5A58]">{state} State</p>
                  )}
                </div>

                {/* Course details */}
                <div className="text-center mb-8">
                  <p className="text-sm text-[#5A5A58] mb-2">has successfully completed the CPD course</p>
                  <div className="bg-[#EBF4FF] rounded-xl px-6 py-4 inline-block">
                    <p className="text-xl font-bold text-[#378ADD]">{course.title}</p>
                    <p className="text-xs text-[#5A5A58] mt-1">
                      {course.weeks} weeks · {course.total_lessons} lessons · {course.modules.length} modules
                    </p>
                  </div>
                </div>

                {/* PASS badge */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-400 rounded-full px-6 py-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700 text-lg tracking-wide">PASS</span>
                  </div>
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

                {/* Date + Certificate ID */}
                <div className="border-t border-[#E0DDD5] pt-6 grid sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-xs text-[#9A9A97] uppercase tracking-wider mb-1">Date Issued</p>
                    <p className="text-sm font-semibold text-[#2C2C2A]">{dateStr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9A9A97] uppercase tracking-wider mb-1">Certificate ID</p>
                    <p className="text-sm font-mono font-semibold text-[#378ADD]">{certId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9A9A97] uppercase tracking-wider mb-1">Issued By</p>
                    <p className="text-sm font-semibold text-[#2C2C2A]">Skillora</p>
                    <p className="text-xs text-[#9A9A97]">EduPro CPD Programme</p>
                  </div>
                </div>

                {/* Verification footer */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-[#9A9A97]">
                    Verify this certificate at skillbridge.ng/verify/{certId}
                  </p>
                </div>
              </div>

              {/* Bottom brand bar */}
              <div className="h-3 bg-gradient-to-r from-[#378ADD] via-[#EF9F27] to-[#378ADD]" />
            </div>

            {/* Post-certificate actions */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
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
                  <Share2 className="w-5 h-5 text-[#F97316]" />
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
          header, nav, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
