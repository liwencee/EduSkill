'use client'

import { useState, useCallback, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import {
  PlusCircle, Trash2, ArrowRight, ArrowLeft,
  ClipboardList, FileSpreadsheet, RotateCcw, Loader2,
  Trophy, TrendingUp, Star, ChevronDown, ChevronUp,
  Lock, CreditCard, Zap, X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────
interface Subject {
  id: string
  name: string
  maxScore: number
}

interface Student {
  id: string
  name: string
}

interface ClassInfo {
  schoolName: string
  className: string
  term: '1st' | '2nd' | '3rd'
  session: string
  passmark: number
}

interface SubjectResult {
  subjectName: string
  score: number
  maxScore: number
  percentage: number
  grade: string
  remark: string
}

interface StudentResult {
  studentId: string
  studentName: string
  subjectResults: SubjectResult[]
  totalScore: number
  totalMax: number
  percentage: number
  average: number
  position: number
  positionLabel: string
  overallGrade: string
  passed: boolean
  // AI fields
  recommendation?: string
  strengths?: string[]
  careerSuggestions?: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }

function getGrade(pct: number): { grade: string; remark: string } {
  if (pct >= 75) return { grade: 'A',  remark: 'Excellent'  }
  if (pct >= 65) return { grade: 'B',  remark: 'Very Good'  }
  if (pct >= 55) return { grade: 'C',  remark: 'Good'       }
  if (pct >= 45) return { grade: 'D',  remark: 'Pass'       }
  if (pct >= 40) return { grade: 'E',  remark: 'Fair'       }
  return              { grade: 'F',  remark: 'Fail'       }
}

function ordinal(n: number) {
  const s = ['th','st','nd','rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function gradeColor(grade: string) {
  if (grade === 'A') return 'text-green-700 bg-green-100'
  if (grade === 'B') return 'text-blue-700 bg-blue-100'
  if (grade === 'C') return 'text-amber-700 bg-amber-100'
  if (grade === 'D') return 'text-orange-700 bg-orange-100'
  if (grade === 'E') return 'text-purple-700 bg-purple-100'
  return 'text-red-700 bg-red-100'
}

function positionColor(pos: number) {
  if (pos === 1) return 'text-yellow-700 bg-yellow-100 border-yellow-300'
  if (pos === 2) return 'text-slate-600 bg-slate-100 border-slate-300'
  if (pos === 3) return 'text-amber-700 bg-amber-100 border-amber-300'
  return 'text-brand-inkMid bg-white border-brand-bg'
}

// ─── Quota types ─────────────────────────────────────────────────
interface UsageInfo {
  count:     number
  limit:     number
  remaining: number | null  // null = unlimited (premium / unlocked)
  unlocked:  boolean
  isPremium: boolean
  period:    string
}

// ─── Upgrade Modal ────────────────────────────────────────────────
function UpgradeModal({
  usageInfo,
  userEmail,
  userId,
  onClose,
}: {
  usageInfo: UsageInfo
  userEmail: string
  userId:   string
  onClose:  () => void
}) {
  const paystackUrl = 'https://paystack.shop/pay/2b2b77ixz-'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-4 right-4 text-brand-inkLight hover:text-brand-ink transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>

        <h2 className="text-2xl font-bold text-brand-ink text-center mb-2">Monthly Limit Reached</h2>
        <p className="text-brand-inkMid text-center text-sm mb-6">
          You&apos;ve used all <strong>{usageInfo.limit} free generations</strong> for{' '}
          {new Date(period + '-01').toLocaleString('en-NG', { month: 'long', year: 'numeric' })}.
          Unlock unlimited result generation for the rest of this month.
        </p>

        {/* Price card */}
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-5 mb-6 text-center">
          <p className="text-brand-inkMid text-sm mb-1">Monthly Add-On</p>
          <p className="text-4xl font-bold text-brand-blue">₦5,000</p>
          <p className="text-brand-inkMid text-sm mt-1">Unlimited result generation this month</p>
          <ul className="mt-4 space-y-2 text-sm text-left text-brand-inkMid">
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-blue flex-shrink-0" /> Unlimited classes & student results</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-blue flex-shrink-0" /> AI-powered recommendations included</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-blue flex-shrink-0" /> Excel export with AI career guidance</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-blue flex-shrink-0" /> Auto-resets next month (pay again to renew)</li>
          </ul>
        </div>

        <a href={paystackUrl} target="_blank" rel="noopener noreferrer"
          className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3 mb-3">
          <CreditCard className="w-5 h-5" /> Pay ₦5,000 with Paystack
        </a>

        <p className="text-xs text-center text-brand-inkLight">
          Secure payment via Paystack · Your quota resets automatically after payment
        </p>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────
export default function ResultGeneratorPage() {
  // ── Step ──
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // ── Step 1 state ──
  const [classInfo, setClassInfo] = useState<ClassInfo>({
    schoolName: '',
    className: '',
    term: '1st',
    session: '2024/2025',
    passmark: 50,
  })
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: uid(), name: 'Mathematics', maxScore: 100 },
    { id: uid(), name: 'English Language', maxScore: 100 },
    { id: uid(), name: 'Basic Science', maxScore: 100 },
  ])
  const [students, setStudents] = useState<Student[]>([
    { id: uid(), name: '' },
    { id: uid(), name: '' },
    { id: uid(), name: '' },
  ])

  // ── Step 2 state ──
  // scores[studentId][subjectId] = number
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({})

  // ── Step 3 state ──
  const [results, setResults] = useState<StudentResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // ── Quota / upgrade state ──
  const { user } = useAuth()
  const [usageInfo, setUsageInfo]         = useState<UsageInfo | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    fetch('/api/result-usage')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUsageInfo(data) })
      .catch(() => {})
  }, [])

  // ─── Derived score helpers ───────────────────────────────────────
  const getScore = (studentId: string, subjectId: string) =>
    scores[studentId]?.[subjectId] ?? 0

  const setScore = useCallback((studentId: string, subjectId: string, val: number) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [subjectId]: val },
    }))
  }, [])

  const rowTotal = (studentId: string) =>
    subjects.reduce((sum, sub) => sum + getScore(studentId, sub.id), 0)

  const rowMax = () =>
    subjects.reduce((sum, sub) => sum + sub.maxScore, 0)

  // ─── Step 1: add/remove subjects & students ──────────────────────
  const addSubject = () =>
    setSubjects(prev => [...prev, { id: uid(), name: '', maxScore: 100 }])

  const removeSubject = (id: string) =>
    setSubjects(prev => prev.filter(s => s.id !== id))

  const updateSubject = (id: string, field: keyof Subject, value: string | number) =>
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))

  const addStudent = () =>
    setStudents(prev => [...prev, { id: uid(), name: '' }])

  const removeStudent = (id: string) =>
    setStudents(prev => prev.filter(s => s.id !== id))

  const updateStudent = (id: string, name: string) =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name } : s))

  // ─── Step 1 → 2 validation ──────────────────────────────────────
  const canProceedToScores = () => {
    if (!classInfo.className.trim()) return false
    if (subjects.length === 0 || subjects.some(s => !s.name.trim())) return false
    if (students.length === 0 || students.some(s => !s.name.trim())) return false
    return true
  }

  // ─── Step 2 → 3: calculate + call AI ────────────────────────────
  const generateResults = async () => {
    setLoading(true)
    setError('')

    // 1. Calculate per-student results
    const computed: StudentResult[] = students.map(student => {
      const subjectResults: SubjectResult[] = subjects.map(sub => {
        const score = getScore(student.id, sub.id)
        const pct = Math.round((score / sub.maxScore) * 100)
        const { grade, remark } = getGrade(pct)
        return { subjectName: sub.name, score, maxScore: sub.maxScore, percentage: pct, grade, remark }
      })
      const totalScore = subjectResults.reduce((s, r) => s + r.score, 0)
      const totalMax   = subjectResults.reduce((s, r) => s + r.maxScore, 0)
      const percentage = Math.round((totalScore / totalMax) * 100)
      const average    = Math.round((totalScore / subjects.length) * 10) / 10
      const { grade: overallGrade } = getGrade(percentage)
      const passed = percentage >= classInfo.passmark
      return {
        studentId: student.id, studentName: student.name,
        subjectResults, totalScore, totalMax, percentage, average,
        position: 0, positionLabel: '', overallGrade, passed,
      }
    })

    // 2. Assign positions (by percentage, desc)
    computed.sort((a, b) => b.percentage - a.percentage)
    computed.forEach((r, i) => {
      r.position     = i + 1
      r.positionLabel = ordinal(i + 1)
    })

    // 3. Call AI for recommendations (quota-checked on server)
    try {
      const res = await fetch('/api/generate-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classInfo,
          students: computed.map(r => ({
            name:          r.studentName,
            position:      r.position,
            percentage:    r.percentage,
            overallGrade:  r.overallGrade,
            passed:        r.passed,
            subjectResults: r.subjectResults,
          })),
        }),
      })

      // ── Quota exceeded → show upgrade modal ──────────────────────
      if (res.status === 402) {
        const data = await res.json()
        setUsageInfo(prev => prev
          ? { ...prev, count: data.count ?? prev.count, remaining: 0 }
          : null
        )
        setShowUpgradeModal(true)
        setLoading(false)
        return   // do NOT advance to step 3
      }

      if (res.ok) {
        const data: { recommendations: { name: string; recommendation: string; strengths: string[]; careerSuggestions: string[] }[] } = await res.json()
        data.recommendations.forEach(aiRec => {
          const match = computed.find(r => r.studentName === aiRec.name)
          if (match) {
            match.recommendation    = aiRec.recommendation
            match.strengths         = aiRec.strengths
            match.careerSuggestions = aiRec.careerSuggestions
          }
        })
        // Refresh quota count after a successful generation
        fetch('/api/result-usage')
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d) setUsageInfo(d) })
          .catch(() => {})
      }
    } catch {
      // AI failed — results still shown without recommendations
    }

    setResults(computed)
    setStep(3)
    setLoading(false)
  }

  // ─── Reset ───────────────────────────────────────────────────────
  const reset = () => {
    setStep(1)
    setResults(null)
    setScores({})
    setError('')
    setExpanded({})
  }

  // ─── Excel export (3 sheets) ─────────────────────────────────────
  const downloadExcel = useCallback(async () => {
    if (!results) return

    const XLSX = await import('xlsx')

    const wb = XLSX.utils.book_new()
    const totalMax = subjects.reduce((s, sub) => s + sub.maxScore, 0)

    // ── Sheet 1: Class Results ──────────────────────────────────────
    type Row = (string | number)[]
    const s1: Row[] = []

    s1.push(['EDUSKILL — STUDENT RESULT SHEET'])
    if (classInfo.schoolName) s1.push([classInfo.schoolName])
    s1.push([`Class: ${classInfo.className}`, '', `Term: ${classInfo.term} Term`, '', `Session: ${classInfo.session}`])
    s1.push([`Pass Mark: ${classInfo.passmark}%`, '', `Total Students: ${results.length}`, '', `Generated: ${new Date().toLocaleDateString('en-NG')}`])
    s1.push([])
    s1.push([
      'Position', 'Student Name',
      ...subjects.map(sub => `${sub.name} (/${sub.maxScore})`),
      `Total (/${totalMax})`, 'Average', 'Percentage (%)', 'Grade', 'Status',
    ])

    results.forEach(r => {
      s1.push([
        r.positionLabel,
        r.studentName,
        ...r.subjectResults.map(sr => sr.score),
        r.totalScore,
        r.average,
        r.percentage,
        r.overallGrade,
        r.passed ? 'PASS' : 'FAIL',
      ])
    })

    s1.push([])
    s1.push(['GRADE KEY'])
    s1.push(['A: 75–100% — Excellent', 'B: 65–74% — Very Good', 'C: 55–64% — Good', 'D: 45–54% — Pass', 'E: 40–44% — Fair', 'F: 0–39% — Fail'])

    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    const allCols = 2 + subjects.length + 5
    ws1['!cols'] = [
      { wch: 12 }, { wch: 28 },
      ...subjects.map(() => ({ wch: 14 })),
      { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 8 },
    ]
    ws1['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: allCols - 1 } },
    ]
    XLSX.utils.book_append_sheet(wb, ws1, 'Class Results')

    // ── Sheet 2: Subject Analysis ───────────────────────────────────
    const s2: Row[] = []
    s2.push(['SUBJECT PERFORMANCE ANALYSIS'])
    s2.push([`${classInfo.className} — ${classInfo.term} Term ${classInfo.session}`])
    s2.push([])
    s2.push(['Subject', 'Max Score', 'Class Average', 'Highest Score', 'Lowest Score', 'Pass Rate (%)', 'A', 'B', 'C', 'D', 'E', 'F'])

    subjects.forEach(sub => {
      const subScores = results.map(r => r.subjectResults.find(sr => sr.subjectName === sub.name)?.score ?? 0)
      const subPcts   = results.map(r => r.subjectResults.find(sr => sr.subjectName === sub.name)?.percentage ?? 0)
      const avg       = Math.round((subScores.reduce((a, b) => a + b, 0) / subScores.length) * 10) / 10
      const passRate  = Math.round((subPcts.filter(p => p >= classInfo.passmark).length / results.length) * 100)
      const gc        = (g: string) => results.filter(r => r.subjectResults.find(sr => sr.subjectName === sub.name)?.grade === g).length

      s2.push([
        sub.name, sub.maxScore, avg,
        Math.max(...subScores), Math.min(...subScores),
        passRate,
        gc('A'), gc('B'), gc('C'), gc('D'), gc('E'), gc('F'),
      ])
    })

    const ws2 = XLSX.utils.aoa_to_sheet(s2)
    ws2['!cols'] = [
      { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 },
    ]
    ws2['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
    ]
    XLSX.utils.book_append_sheet(wb, ws2, 'Subject Analysis')

    // ── Sheet 3: AI Recommendations ─────────────────────────────────
    const s3: Row[] = []
    s3.push(['AI RECOMMENDATIONS & CAREER GUIDANCE'])
    s3.push([`${classInfo.className} — ${classInfo.term} Term ${classInfo.session}`])
    s3.push([])
    s3.push(['Position', 'Student Name', 'Grade (%)', 'Performance Summary', 'Strengths & Improvement Tips', 'Recommended Career Paths'])

    results.forEach(r => {
      s3.push([
        r.positionLabel,
        r.studentName,
        `${r.overallGrade} (${r.percentage}%)`,
        r.recommendation ?? 'N/A',
        r.strengths?.join(' | ') ?? '',
        r.careerSuggestions?.join(', ') ?? '',
      ])
    })

    const ws3 = XLSX.utils.aoa_to_sheet(s3)
    ws3['!cols'] = [
      { wch: 12 }, { wch: 28 }, { wch: 12 }, { wch: 55 }, { wch: 65 }, { wch: 45 },
    ]
    ws3['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ]
    XLSX.utils.book_append_sheet(wb, ws3, 'Recommendations')

    // Write file
    const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `${safe(classInfo.className)}_${classInfo.term}_Term_${safe(classInfo.session)}_Results.xlsx`
    XLSX.writeFile(wb, filename)
  }, [results, classInfo, subjects])

  // ─── Step indicator ──────────────────────────────────────────────
  const STEPS = ['Class Setup', 'Enter Scores', 'View Results']

  return (
    <>
      <Navbar />

      {/* ── Upgrade modal ───────────────────────────────────────── */}
      {showUpgradeModal && usageInfo && user && (
        <UpgradeModal
          usageInfo={usageInfo}
          userEmail={user.email}
          userId={user.id}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Hero */}
      <section className="bg-brand-blue text-white py-14 no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/80 px-4 py-2 rounded-full text-sm mb-5">
            <ClipboardList className="w-4 h-4" /> Student Result Generator
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Generate Class Results</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Enter scores for any number of pupils and subjects — get ranked results,
            letter grades, AI-powered improvement tips and career guidance instantly.
          </p>
        </div>
      </section>

      {/* Step indicator */}
      <div className="no-print bg-white border-b border-[#E0DDD5] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${step === i + 1 ? 'bg-brand-blue text-white' : step > i + 1 ? 'bg-green-500 text-white' : 'bg-[#E0DDD5] text-brand-inkMid'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${step === i + 1 ? 'text-brand-blue' : 'text-brand-inkMid'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-[#E0DDD5] mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Monthly quota banner ────────────────────────────────── */}
      {usageInfo && !usageInfo.isPremium && (
        <div className={`no-print border-b ${
          usageInfo.remaining === 0
            ? 'bg-red-50 border-red-200'
            : usageInfo.remaining === 1
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {usageInfo.remaining === 0
                ? <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />
                : <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              }
              <p className={`text-sm font-medium ${
                usageInfo.remaining === 0 ? 'text-red-700' : usageInfo.remaining === 1 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {usageInfo.unlocked
                  ? 'Unlimited access unlocked this month 🎉'
                  : usageInfo.remaining === 0
                    ? 'Monthly limit reached — upgrade to continue generating results'
                    : `${usageInfo.remaining} of ${usageInfo.limit} free generation${usageInfo.remaining === 1 ? '' : 's'} remaining this month`
                }
              </p>
            </div>
            {!usageInfo.unlocked && usageInfo.remaining === 0 && (
              <button onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
                <CreditCard className="w-4 h-4" /> Upgrade — ₦5,000/month
              </button>
            )}
            {!usageInfo.unlocked && usageInfo.remaining !== null && usageInfo.remaining > 0 && (
              <button onClick={() => setShowUpgradeModal(true)}
                className="text-sm text-brand-inkLight hover:text-brand-blue underline transition-colors flex-shrink-0">
                Upgrade for unlimited access
              </button>
            )}
          </div>
          {/* Usage dots */}
          {!usageInfo.unlocked && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 flex items-center gap-1.5">
              {Array.from({ length: usageInfo.limit }).map((_, i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${
                  i < usageInfo.count
                    ? usageInfo.remaining === 0 ? 'bg-red-400' : 'bg-amber-400'
                    : 'bg-gray-200'
                }`} />
              ))}
              <span className="text-xs text-brand-inkLight ml-1">
                {usageInfo.count}/{usageInfo.limit} used
              </span>
            </div>
          )}
        </div>
      )}

      <div className="min-h-screen bg-brand-bg py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ══════════════════════════════════════════════════════
              STEP 1 — CLASS SETUP
          ══════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-8">

              {/* Class Info */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-brand-ink mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-bold">1</span>
                  Class Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">School Name <span className="text-brand-inkLight text-xs">(optional)</span></label>
                    <input className="input" placeholder="e.g. Government Secondary School, Lagos"
                      value={classInfo.schoolName}
                      onChange={e => setClassInfo(p => ({ ...p, schoolName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Class / Grade Level <span className="text-red-500">*</span></label>
                    <input className="input" placeholder="e.g. JSS 2A, Primary 5B, SS1"
                      value={classInfo.className}
                      onChange={e => setClassInfo(p => ({ ...p, className: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Term <span className="text-red-500">*</span></label>
                    <select className="input" value={classInfo.term}
                      onChange={e => setClassInfo(p => ({ ...p, term: e.target.value as ClassInfo['term'] }))}>
                      <option value="1st">1st Term</option>
                      <option value="2nd">2nd Term</option>
                      <option value="3rd">3rd Term</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Academic Session <span className="text-red-500">*</span></label>
                    <input className="input" placeholder="e.g. 2024/2025"
                      value={classInfo.session}
                      onChange={e => setClassInfo(p => ({ ...p, session: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Pass Mark (%)</label>
                    <input className="input" type="number" min={1} max={100}
                      value={classInfo.passmark}
                      onChange={e => setClassInfo(p => ({ ...p, passmark: Number(e.target.value) }))} />
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-bold">2</span>
                    Subjects
                  </h2>
                  <button onClick={addSubject}
                    className="inline-flex items-center gap-1.5 text-brand-blue text-sm font-semibold hover:text-brand-blueDark transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Subject
                  </button>
                </div>
                <div className="space-y-3">
                  {subjects.map((sub, i) => (
                    <div key={sub.id} className="flex gap-3 items-center">
                      <span className="text-brand-inkLight text-sm w-5 text-right shrink-0">{i + 1}.</span>
                      <input className="input flex-1" placeholder="Subject name (e.g. Mathematics)"
                        value={sub.name}
                        onChange={e => updateSubject(sub.id, 'name', e.target.value)} />
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-brand-inkMid whitespace-nowrap">Max:</span>
                        <input className="input w-20 text-center" type="number" min={1} max={200}
                          value={sub.maxScore}
                          onChange={e => updateSubject(sub.id, 'maxScore', Number(e.target.value))} />
                      </div>
                      {subjects.length > 1 && (
                        <button onClick={() => removeSubject(sub.id)}
                          className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Students */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-bold">3</span>
                    Pupils / Students
                  </h2>
                  <button onClick={addStudent}
                    className="inline-flex items-center gap-1.5 text-brand-blue text-sm font-semibold hover:text-brand-blueDark transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Student
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {students.map((st, i) => (
                    <div key={st.id} className="flex gap-2 items-center">
                      <span className="text-brand-inkLight text-sm w-5 text-right shrink-0">{i + 1}.</span>
                      <input className="input flex-1" placeholder={`Student ${i + 1} full name`}
                        value={st.name}
                        onChange={e => updateStudent(st.id, e.target.value)} />
                      {students.length > 1 && (
                        <button onClick={() => removeStudent(st.id)}
                          className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Next */}
              <div className="flex justify-end">
                <button onClick={() => setStep(2)} disabled={!canProceedToScores()}
                  className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40">
                  Enter Scores <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              STEP 2 — SCORE ENTRY
          ══════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="card p-4 bg-brand-blueLight border-brand-blue/30">
                <p className="text-brand-blue text-sm font-medium">
                  📝 Enter each pupil&apos;s score per subject. Scores are automatically totalled.
                  Class: <strong>{classInfo.className}</strong> · {classInfo.term} Term · {classInfo.session}
                </p>
              </div>

              {/* Score table */}
              <div className="card p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-blue text-white">
                      <th className="text-left px-4 py-3 font-semibold sticky left-0 bg-brand-blue min-w-[160px]">
                        Student Name
                      </th>
                      {subjects.map(sub => (
                        <th key={sub.id} className="px-3 py-3 font-semibold text-center min-w-[100px]">
                          {sub.name}
                          <div className="text-white/60 text-xs font-normal">/{sub.maxScore}</div>
                        </th>
                      ))}
                      <th className="px-4 py-3 font-semibold text-center min-w-[90px] bg-brand-blueDark">
                        Total<div className="text-white/60 text-xs font-normal">/{rowMax()}</div>
                      </th>
                      <th className="px-4 py-3 font-semibold text-center min-w-[70px] bg-brand-blueDark">
                        Avg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st, si) => {
                      const total = rowTotal(st.id)
                      const avg = subjects.length > 0 ? Math.round((total / subjects.length) * 10) / 10 : 0
                      return (
                        <tr key={st.id} className={si % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F2]'}>
                          <td className={`px-4 py-2 font-medium text-brand-ink sticky left-0 ${si % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F2]'}`}>
                            {st.name}
                          </td>
                          {subjects.map(sub => (
                            <td key={sub.id} className="px-2 py-2 text-center">
                              <input
                                type="number" min={0} max={sub.maxScore}
                                value={getScore(st.id, sub.id) || ''}
                                placeholder="0"
                                onChange={e => {
                                  const v = Math.min(sub.maxScore, Math.max(0, Number(e.target.value) || 0))
                                  setScore(st.id, sub.id, v)
                                }}
                                className="w-16 text-center border border-[#D5D2C8] rounded-lg py-1.5 px-2
                                           focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent
                                           bg-white text-brand-ink"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-2 text-center font-bold text-brand-blue">
                            {total}
                          </td>
                          <td className="px-4 py-2 text-center font-semibold text-brand-inkMid">
                            {avg}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-brand-inkMid font-semibold hover:text-brand-ink transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Setup
                </button>
                {usageInfo?.remaining === 0 && !usageInfo?.unlocked && !usageInfo?.isPremium ? (
                  <button onClick={() => setShowUpgradeModal(true)}
                    className="btn-primary inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600">
                    <Lock className="w-4 h-4" /> Upgrade to Generate
                  </button>
                ) : (
                  <button onClick={generateResults} disabled={loading}
                    className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating Results…</>
                    ) : (
                      <>Generate Results <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              STEP 3 — RESULTS OUTPUT
          ══════════════════════════════════════════════════════ */}
          {step === 3 && results && (
            <div id="result-output">

              {/* Action bar */}
              <div className="no-print flex items-center justify-between mb-6 gap-3 flex-wrap">
                <button onClick={reset}
                  className="inline-flex items-center gap-2 text-brand-inkMid font-semibold hover:text-brand-ink transition-colors">
                  <RotateCcw className="w-4 h-4" /> New Result
                </button>
                <button onClick={downloadExcel}
                  className="btn-primary inline-flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)
                </button>
              </div>

              {/* Report header */}
              <div className="card p-6 mb-6 text-center border-t-4 border-brand-blue">
                {classInfo.schoolName && (
                  <p className="text-brand-inkMid font-semibold text-lg mb-1">{classInfo.schoolName}</p>
                )}
                <h2 className="text-2xl font-bold text-brand-ink mb-1">
                  {classInfo.term} Term Result — {classInfo.className}
                </h2>
                <p className="text-brand-inkMid">Academic Session: {classInfo.session}</p>
                <div className="flex justify-center gap-6 mt-4 text-sm text-brand-inkMid flex-wrap">
                  <span>Total Students: <strong className="text-brand-ink">{results.length}</strong></span>
                  <span>Subjects: <strong className="text-brand-ink">{subjects.length}</strong></span>
                  <span>Pass Mark: <strong className="text-brand-ink">{classInfo.passmark}%</strong></span>
                  <span>Passed: <strong className="text-green-700">{results.filter(r => r.passed).length}</strong></span>
                  <span>Failed: <strong className="text-red-600">{results.filter(r => !r.passed).length}</strong></span>
                </div>
              </div>

              {/* Top 3 podium */}
              <div className="no-print grid grid-cols-3 gap-4 mb-6">
                {results.slice(0, 3).map((r, i) => (
                  <div key={r.studentId}
                    className={`card p-4 text-center border-2 ${i === 0 ? 'border-yellow-300 bg-yellow-50' : i === 1 ? 'border-slate-300 bg-slate-50' : 'border-amber-300 bg-amber-50'}`}>
                    <div className="text-2xl mb-1">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                    <p className="font-bold text-brand-ink text-sm leading-tight">{r.studentName}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: i === 0 ? '#CA8A04' : i === 1 ? '#475569' : '#C97E0A' }}>
                      {r.percentage}%
                    </p>
                    <span className={`badge mt-1 ${gradeColor(r.overallGrade)}`}>{r.overallGrade}</span>
                  </div>
                ))}
              </div>

              {/* Full results table */}
              <div className="card mb-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-blue text-white">
                      <th className="px-3 py-3 text-center font-semibold w-12">Pos.</th>
                      <th className="px-4 py-3 text-left font-semibold min-w-[150px]">Student Name</th>
                      {subjects.map(sub => (
                        <th key={sub.id} className="px-2 py-3 text-center font-semibold min-w-[80px]">
                          {sub.name.length > 8 ? sub.name.slice(0, 7) + '…' : sub.name}
                          <div className="text-white/60 text-xs font-normal">/{sub.maxScore}</div>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center font-semibold bg-brand-blueDark min-w-[70px]">Total</th>
                      <th className="px-3 py-3 text-center font-semibold bg-brand-blueDark min-w-[60px]">Avg</th>
                      <th className="px-3 py-3 text-center font-semibold bg-brand-blueDark min-w-[60px]">%</th>
                      <th className="px-3 py-3 text-center font-semibold bg-brand-blueDark min-w-[50px]">Grade</th>
                      <th className="px-3 py-3 text-center font-semibold bg-brand-blueDark min-w-[60px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.studentId} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F2]'}>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${positionColor(r.position)}`}>
                            {r.position <= 3
                              ? (r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉')
                              : r.position}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium text-brand-ink">{r.studentName}</td>
                        {r.subjectResults.map(sr => (
                          <td key={sr.subjectName} className="px-2 py-2.5 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${gradeColor(sr.grade)}`}>
                              {sr.score}
                            </span>
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-center font-bold text-brand-blue">{r.totalScore}</td>
                        <td className="px-3 py-2.5 text-center text-brand-inkMid">{r.average}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-brand-ink">{r.percentage}%</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`badge text-xs ${gradeColor(r.overallGrade)}`}>{r.overallGrade}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`badge text-xs ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {r.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grade key */}
              <div className="card p-4 mb-8">
                <p className="text-xs font-semibold text-brand-inkMid mb-2 uppercase tracking-wide">Grade Key</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {[
                    { g:'A', r:'Excellent',  p:'75–100%' },
                    { g:'B', r:'Very Good',  p:'65–74%'  },
                    { g:'C', r:'Good',       p:'55–64%'  },
                    { g:'D', r:'Pass',       p:'45–54%'  },
                    { g:'E', r:'Fair',       p:'40–44%'  },
                    { g:'F', r:'Fail',       p:'0–39%'   },
                  ].map(k => (
                    <span key={k.g} className={`badge ${gradeColor(k.g)}`}>
                      {k.g} — {k.r} ({k.p})
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <h3 className="text-xl font-bold text-brand-ink mb-4 flex items-center gap-2 no-print">
                <TrendingUp className="w-5 h-5 text-brand-blue" />
                AI-Powered Recommendations
              </h3>

              <div className="space-y-4 no-print">
                {results.map(r => (
                  <div key={r.studentId} className="card p-0 overflow-hidden">
                    {/* Student header */}
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8F7F2] transition-colors"
                      onClick={() => setExpanded(prev => ({ ...prev, [r.studentId]: !prev[r.studentId] }))}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${positionColor(r.position)}`}>
                          {r.position}
                        </span>
                        <div className="text-left">
                          <p className="font-bold text-brand-ink">{r.studentName}</p>
                          <p className="text-xs text-brand-inkMid">
                            {r.positionLabel} position · {r.percentage}% · Grade {r.overallGrade} · {r.passed ? '✅ PASS' : '❌ FAIL'}
                          </p>
                        </div>
                      </div>
                      {expanded[r.studentId]
                        ? <ChevronUp className="w-5 h-5 text-brand-inkMid" />
                        : <ChevronDown className="w-5 h-5 text-brand-inkMid" />}
                    </button>

                    {/* Expanded AI content */}
                    {expanded[r.studentId] && (
                      <div className="border-t border-[#E0DDD5] px-5 py-5 space-y-5">

                        {/* Per-subject breakdown */}
                        <div>
                          <p className="text-xs font-semibold text-brand-inkMid uppercase tracking-wide mb-2">Subject Breakdown</p>
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {r.subjectResults.map(sr => (
                              <div key={sr.subjectName} className={`rounded-xl px-3 py-2 border ${gradeColor(sr.grade)}`}>
                                <p className="font-semibold text-xs">{sr.subjectName}</p>
                                <p className="text-lg font-bold">{sr.score}<span className="text-xs font-normal">/{sr.maxScore}</span></p>
                                <p className="text-xs">{sr.grade} — {sr.remark} ({sr.percentage}%)</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {r.recommendation ? (
                          <>
                            {/* Recommendation */}
                            <div className="bg-brand-blueLight border border-brand-blue/20 rounded-xl p-4">
                              <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" /> Performance Summary
                              </p>
                              <p className="text-brand-ink text-sm leading-relaxed">{r.recommendation}</p>
                            </div>

                            {/* Strengths */}
                            {r.strengths && r.strengths.length > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5" /> Strengths &amp; Areas for Improvement
                                </p>
                                <ul className="space-y-1">
                                  {r.strengths.map((s, i) => (
                                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                                      <span className="text-green-500 mt-0.5">→</span> {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Career suggestions */}
                            {r.careerSuggestions && r.careerSuggestions.length > 0 && (
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                  <Trophy className="w-3.5 h-3.5" /> Recommended Career Paths
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {r.careerSuggestions.map((c, i) => (
                                    <span key={i} className="badge badge-amber text-xs">{c}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-brand-inkMid italic">
                            AI recommendations unavailable. Results are still accurate.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Print-only per-student comment cards */}
              <div className="print-only hidden print:block mt-8">
                {results.map(r => (
                  <div key={r.studentId} className="mb-6 border border-gray-300 rounded p-4 page-break-inside-avoid">
                    <h4 className="font-bold text-base mb-1">
                      {r.positionLabel} Position — {r.studentName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Total: {r.totalScore}/{r.totalMax} · Average: {r.average} · {r.percentage}% · Grade {r.overallGrade} · {r.passed ? 'PASS' : 'FAIL'}
                    </p>
                    {r.recommendation && (
                      <p className="text-sm mb-2"><strong>Recommendation:</strong> {r.recommendation}</p>
                    )}
                    {r.careerSuggestions && r.careerSuggestions.length > 0 && (
                      <p className="text-sm"><strong>Career Paths:</strong> {r.careerSuggestions.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="no-print mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button onClick={downloadExcel}
                  className="btn-secondary inline-flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)
                </button>
                <button onClick={reset}
                  className="btn-outline inline-flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Generate Another Result
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  )
}
