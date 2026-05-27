'use client'
import { useState, useEffect, useRef, ChangeEvent } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import TeacherBadge from '@/components/TeacherBadge'
import {
  User, Upload, Shield, Award, Clock, CheckCircle, AlertCircle,
  Loader2, ArrowLeft, BadgeCheck, Eye, EyeOff, FileText, Camera,
  Save, Info,
} from 'lucide-react'

const CERT_TYPES = [
  { value: 'NCE',   label: 'NCE — Nigeria Certificate in Education' },
  { value: 'PGDE',  label: 'PGDE — Postgraduate Diploma in Education' },
  { value: 'B.Ed',  label: 'B.Ed — Bachelor of Education' },
  { value: 'M.Ed',  label: 'M.Ed — Master of Education' },
  { value: 'PhD',   label: 'Ph.D in Education' },
  { value: 'OND',   label: 'OND — Ordinary National Diploma (Technical)' },
  { value: 'HND',   label: 'HND — Higher National Diploma (Technical)' },
  { value: 'B.Sc',  label: 'B.Sc + PGDE' },
  { value: 'Other', label: 'Other Relevant Certificate' },
]

const SCHOOL_TYPES = [
  { value: 'public',   label: 'Public School' },
  { value: 'private',  label: 'Private School' },
  { value: 'federal',  label: 'Federal Government School' },
  { value: 'unity',    label: 'Unity School' },
  { value: 'tertiary', label: 'Tertiary Institution' },
  { value: 'ngo',      label: 'NGO / Community School' },
]

const SUBJECTS = [
  'Mathematics', 'English Language', 'Further Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Agricultural Science', 'Economics', 'Government/Civics', 'History',
  'Geography', 'Literature in English', 'Yoruba Language', 'Igbo Language',
  'Hausa Language', 'Computer Science / ICT', 'Technical Drawing', 'Fine Arts',
  'Music', 'Physical Education', 'French', 'Arabic', 'Christian Religious Studies',
  'Islamic Religious Studies', 'Commerce', 'Accounting/Book-keeping',
  'Home Economics', 'Food & Nutrition', 'Basic Technology', 'Other',
]

type KycStatus = 'incomplete' | 'pending' | 'approved' | 'rejected'

interface Profile {
  full_name: string
  email: string
  avatar_url?: string
  phone?: string
  state?: string
  bio?: string
}

interface TeacherKyc {
  teacher_uid?: string
  nin?: string
  nin_verified?: boolean
  cert_type?: string
  cert_url?: string
  cert_verified?: boolean
  years_of_service?: number
  has_badge?: boolean
  badge_type?: string
  kyc_status?: KycStatus
  kyc_submitted_at?: string
  display_to_employers?: boolean
  school_name?: string
  school_type?: string
  subject_areas?: string[]
  subject_specialization?: string
  portfolio_url?: string
  linkedin_url?: string
}

const KYC_STATUS_CONFIG: Record<KycStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  incomplete: { label: 'Incomplete — fill in your details below', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200',   icon: AlertCircle  },
  pending:    { label: 'Under Review — we will notify you within 48 hours',  color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock        },
  approved:   { label: 'KYC Approved — your badge is active',     color: 'text-green-700', bg: 'bg-green-50 border-green-200',   icon: CheckCircle  },
  rejected:   { label: 'KYC Rejected — please re-upload documents', color: 'text-red-700',   bg: 'bg-red-50 border-red-200',     icon: AlertCircle  },
}

export default function TeacherProfilePage() {
  const supabase = createClient()

  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState<'avatar' | 'cert' | null>(null)

  const [profile,    setProfile]    = useState<Profile>({ full_name: '', email: '' })
  const [kyc,        setKyc]        = useState<TeacherKyc>({})
  const [subjects,   setSubjects]   = useState<string[]>([])
  const [nin,        setNin]        = useState('')
  const [showNin,    setShowNin]    = useState(false)
  const [ninError,   setNinError]   = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const avatarRef = useRef<HTMLInputElement>(null)
  const certRef   = useRef<HTMLInputElement>(null)

  // ── Load profile + teacher_profiles ──────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Ensure profiles row exists
      await supabase.from('profiles').upsert({
        id:        user.id,
        full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Teacher',
        email:     user.email ?? '',
        role:      'teacher',
      }, { onConflict: 'id', ignoreDuplicates: true })

      // Ensure teacher_profiles row exists
      await supabase.from('teacher_profiles').upsert(
        { id: user.id }, { onConflict: 'id', ignoreDuplicates: true }
      )

      const [{ data: p }, { data: tp }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('teacher_profiles').select('*').eq('id', user.id).single(),
      ])

      if (p) {
        setProfile(p)
        if (p.avatar_url) setAvatarPreview(p.avatar_url)
      }
      if (tp) {
        setKyc(tp)
        setNin(tp.nin ?? '')
        setSubjects(tp.subject_areas ?? [])
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload avatar ─────────────────────────────────────────────────────────
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Avatar must be under 2 MB'); return }

    setUploading('avatar')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(null); return }

    const ext  = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { toast.error('Upload failed: ' + upErr.message); setUploading(null); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setProfile(p => ({ ...p, avatar_url: publicUrl }))
    setAvatarPreview(publicUrl)
    toast.success('Profile photo updated!')
    setUploading(null)
  }

  // ── Upload certificate ────────────────────────────────────────────────────
  async function handleCertChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Certificate must be under 5 MB'); return }

    setUploading('cert')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(null); return }

    const ext  = file.name.split('.').pop()
    const path = `${user.id}/certificate.${ext}`

    const { error: upErr } = await supabase.storage.from('teacher-documents').upload(path, file, { upsert: true })
    if (upErr) { toast.error('Upload failed: ' + upErr.message); setUploading(null); return }

    const { data: { publicUrl } } = supabase.storage.from('teacher-documents').getPublicUrl(path)
    setKyc(k => ({ ...k, cert_url: publicUrl }))
    toast.success('Certificate uploaded!')
    setUploading(null)
  }

  function toggleSubject(sub: string) {
    setSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    )
  }

  // ── Save all changes ──────────────────────────────────────────────────────
  async function handleSave() {
    // ── NIN is compulsory before saving ──────────────────────────
    if (!nin || nin.length !== 11) {
      setNinError('NIN is required — enter your 11-digit National Identification Number to save your profile and receive your Teacher ID.')
      toast.error('NIN is required to save your profile')
      // Scroll to NIN field
      document.getElementById('nin-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setNinError('')

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    // Determine new KYC status
    const hasNin     = nin.length === 11
    const hasCert    = !!(kyc.cert_url && kyc.cert_type)
    const hasYears   = (kyc.years_of_service ?? 0) > 0
    const newStatus: KycStatus =
      (hasNin && hasCert && hasYears && kyc.kyc_status !== 'approved' && kyc.kyc_status !== 'rejected')
        ? 'pending'
        : (kyc.kyc_status ?? 'incomplete')

    const [pRes, tpRes] = await Promise.all([
      supabase.from('profiles').update({
        full_name: profile.full_name,
        phone:     profile.phone ?? null,
        state:     profile.state ?? null,
        bio:       profile.bio   ?? null,
      }).eq('id', user.id),

      supabase.from('teacher_profiles').update({
        nin:                   nin || null,
        cert_type:             kyc.cert_type             ?? null,
        cert_url:              kyc.cert_url              ?? null,
        years_of_service:      kyc.years_of_service      ?? 0,
        school_name:           kyc.school_name           ?? null,
        school_type:           kyc.school_type           ?? null,
        subject_areas:         subjects,
        subject_specialization: kyc.subject_specialization ?? null,
        portfolio_url:         kyc.portfolio_url         ?? null,
        linkedin_url:          kyc.linkedin_url          ?? null,
        display_to_employers:  kyc.display_to_employers  ?? true,
        kyc_status:            newStatus,
        kyc_submitted_at:      newStatus === 'pending' ? new Date().toISOString() : (kyc.kyc_submitted_at ?? null),
      }).eq('id', user.id),
    ])

    if (pRes.error || tpRes.error) {
      toast.error((pRes.error ?? tpRes.error)?.message ?? 'Save failed')
    } else {
      setKyc(k => ({ ...k, kyc_status: newStatus, kyc_submitted_at: newStatus === 'pending' ? new Date().toISOString() : k.kyc_submitted_at }))
      toast.success(newStatus === 'pending' ? 'Profile saved — KYC submitted for review!' : 'Profile saved!')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const status      = (kyc.kyc_status ?? 'incomplete') as KycStatus
  const statusCfg   = KYC_STATUS_CONFIG[status]
  const StatusIcon  = statusCfg.icon
  const kycComplete = !!(nin.length === 11 && kyc.cert_url && kyc.cert_type && (kyc.years_of_service ?? 0) > 0)

  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link href="/dashboard/teacher"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B4B]">Teacher Profile & KYC</h1>
            <p className="text-sm text-gray-500 mt-1">Complete your profile to get verified and apply for jobs on the platform.</p>
          </div>
          {kyc.teacher_uid && (
            <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-4 py-2">
              <BadgeCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Teacher ID</p>
                <p className="text-sm font-bold text-[#1E1B4B] font-mono">{kyc.teacher_uid}</p>
              </div>
            </div>
          )}
        </div>

        {/* KYC Status Banner */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${statusCfg.bg}`}>
          <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${statusCfg.color}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${statusCfg.color}`}>KYC Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
            <p className={`text-xs mt-0.5 ${statusCfg.color} opacity-80`}>{statusCfg.label}</p>
          </div>
          {(kyc.has_badge || status === 'approved') && (
            <TeacherBadge hasBadge={kyc.has_badge} kycStatus={status} badgeType={kyc.badge_type} />
          )}
        </div>

        <div className="space-y-6">

          {/* ── Avatar ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-indigo-100">
                    {profile.full_name?.charAt(0)?.toUpperCase() ?? 'T'}
                  </div>
                )}
                {(kyc.has_badge || status === 'approved') && (
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">JPG, PNG or WebP · Max 2 MB</p>
                <button onClick={() => avatarRef.current?.click()}
                  disabled={uploading === 'avatar'}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {uploading === 'avatar'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Camera className="w-4 h-4" />}
                  {uploading === 'avatar' ? 'Uploading…' : 'Upload Photo'}
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>
          </div>

          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Basic Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input className="input" value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input bg-gray-50" value={profile.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input className="input" placeholder="08012345678" value={profile.phone ?? ''}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State of Practice</label>
                <input className="input" placeholder="e.g. Lagos" value={profile.state ?? ''}
                  onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                <textarea rows={3} className="input resize-none" placeholder="Tell employers and students about yourself…"
                  value={profile.bio ?? ''}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* ── Professional Details ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" /> Professional Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Service *</label>
                <input type="number" min={0} max={50} className="input"
                  placeholder="e.g. 5"
                  value={kyc.years_of_service ?? ''}
                  onChange={e => setKyc(k => ({ ...k, years_of_service: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input className="input" placeholder="e.g. Government Secondary School, Ikeja"
                  value={kyc.school_name ?? ''}
                  onChange={e => setKyc(k => ({ ...k, school_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                <select className="input" value={kyc.school_type ?? ''}
                  onChange={e => setKyc(k => ({ ...k, school_type: e.target.value }))}>
                  <option value="">Select school type</option>
                  {SCHOOL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Specialization</label>
                <input className="input" placeholder="e.g. Mathematics & Further Maths"
                  value={kyc.subject_specialization ?? ''}
                  onChange={e => setKyc(k => ({ ...k, subject_specialization: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website URL</label>
                <input type="url" className="input" placeholder="https://..."
                  value={kyc.portfolio_url ?? ''}
                  onChange={e => setKyc(k => ({ ...k, portfolio_url: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input type="url" className="input" placeholder="https://linkedin.com/in/..."
                  value={kyc.linkedin_url ?? ''}
                  onChange={e => setKyc(k => ({ ...k, linkedin_url: e.target.value }))} />
              </div>
            </div>

            {/* Subject areas checkboxes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects You Teach</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(sub => (
                  <button key={sub} type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      subjects.includes(sub)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── KYC Documents ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1E1B4B] flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" /> KYC Verification
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                <Info className="w-3 h-3" /> Verified teachers get the platform badge
              </span>
            </div>

            {/* NIN required callout */}
            <div className="mb-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <BadgeCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">NIN required to save your profile &amp; get your Teacher ID</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your National Identification Number (NIN) is compulsory. You will not be able to save your profile
                  or receive your unique EduSkill Teacher ID (e.g. <span className="font-mono font-semibold">EDU-T-2025-01042</span>) without it.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* NIN */}
              <div id="nin-field" className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIN — National Identification Number <span className="text-red-600 font-bold">* Required</span>
                </label>
                <div className="relative">
                  <input
                    type={showNin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={11}
                    className={`input pr-10 ${ninError ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-500' : nin.length === 11 ? 'border-green-400 ring-1 ring-green-300' : ''}`}
                    placeholder="Enter your 11-digit NIN"
                    value={nin}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 11)
                      setNin(v)
                      if (v.length === 11) setNinError('')
                    }}
                  />
                  <button type="button" onClick={() => setShowNin(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {ninError ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {ninError}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    Your NIN is encrypted and only used for identity verification.
                    {nin.length > 0 && nin.length < 11 && (
                      <span className="text-amber-600 ml-1">{11 - nin.length} more digit{11 - nin.length !== 1 ? 's' : ''} needed</span>
                    )}
                    {nin.length === 11 && <span className="text-green-600 ml-1 font-medium">✓ Valid — profile can be saved</span>}
                  </p>
                )}
              </div>

              {/* Certificate Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teaching Certificate Type *
                </label>
                <select className="input" value={kyc.cert_type ?? ''}
                  onChange={e => setKyc(k => ({ ...k, cert_type: e.target.value }))}>
                  <option value="">Select certificate</option>
                  {CERT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Certificate Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Certificate *
                </label>
                {kyc.cert_url ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <FileText className="w-5 h-5 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-700">Certificate uploaded</p>
                      {kyc.cert_verified && (
                        <p className="text-xs text-green-600">✓ Verified by EduSkill</p>
                      )}
                    </div>
                    <button type="button" onClick={() => certRef.current?.click()}
                      className="text-xs text-green-700 underline">Replace</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => certRef.current?.click()}
                    disabled={uploading === 'cert'}
                    className="w-full flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-gray-500 disabled:opacity-60">
                    {uploading === 'cert'
                      ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      : <Upload className="w-6 h-6" />}
                    <span className="text-xs">
                      {uploading === 'cert' ? 'Uploading…' : 'Click to upload PDF or image (max 5 MB)'}
                    </span>
                  </button>
                )}
                <input ref={certRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleCertChange} />
              </div>
            </div>

            {/* KYC progress indicator */}
            {status !== 'approved' && (
              <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 mb-2">KYC Completion Checklist</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Profile photo uploaded', done: !!avatarPreview },
                    { label: 'NIN provided (11 digits)', done: nin.length === 11 },
                    { label: 'Teaching certificate type selected', done: !!kyc.cert_type },
                    { label: 'Certificate document uploaded', done: !!kyc.cert_url },
                    { label: 'Years of service filled', done: (kyc.years_of_service ?? 0) > 0 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.done
                        ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />}
                      <span className={`text-xs ${item.done ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                {kycComplete && status === 'incomplete' && (
                  <p className="mt-3 text-xs font-semibold text-indigo-700">
                    ✓ All required fields complete — saving will submit your KYC for review.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Visibility ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500" /> Profile Visibility
            </h2>
            <label className="flex items-center gap-4 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only"
                  checked={kyc.display_to_employers ?? true}
                  onChange={e => setKyc(k => ({ ...k, display_to_employers: e.target.checked }))} />
                <div className={`w-11 h-6 rounded-full transition-colors ${kyc.display_to_employers ?? true ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${kyc.display_to_employers ?? true ? 'translate-x-5' : ''}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Show my profile to employers</p>
                <p className="text-xs text-gray-400">Employers can see your name, badge, certifications, and years of service when you apply for a job.</p>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex flex-col items-end gap-2 pb-8">
            {nin.length !== 11 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Enter your 11-digit NIN above to unlock saving
              </p>
            )}
            <button onClick={handleSave} disabled={saving}
              className={`inline-flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-colors text-sm
                ${nin.length === 11
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : nin.length === 11
                  ? <><Save className="w-4 h-4" /> Save Profile &amp; Get Teacher ID</>
                  : <><Shield className="w-4 h-4" /> NIN Required to Save</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
