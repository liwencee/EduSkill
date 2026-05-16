'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Briefcase, MapPin, Clock, DollarSign, ArrowLeft,
  CheckCircle, Loader2, ChevronDown, AlertCircle, CalendarDays,
} from 'lucide-react'

const SKILL_CATEGORIES = [
  'Digital Marketing', 'Fashion Design', 'Solar Installation', 'Coding / Software',
  'Agribusiness', 'Catering & Hospitality', 'Welding & Fabrication', 'Graphic Design',
  'Cosmetology & Beauty', 'Logistics & Supply Chain', 'Data Entry / Virtual Assistant',
  'Plumbing', 'Electrical Work', 'Carpentry', 'Photography & Videography', 'Other',
]

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Remote / Nationwide',
]

// Job type values must match the job_type enum in Supabase:
// full_time | part_time | apprenticeship | freelance | internship
const JOB_TYPES = [
  { value: 'full_time',      label: 'Full-Time' },
  { value: 'part_time',      label: 'Part-Time' },
  { value: 'freelance',      label: 'Contract / Freelance' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'internship',     label: 'Internship' },
]

// How the pay is structured — used to label the rate amount fields
const RATE_TYPES = [
  { value: '',          label: 'Select pay structure',  suffix: '' },
  { value: 'hourly',    label: 'Per Hour',              suffix: '/hr' },
  { value: 'daily',     label: 'Per Day',               suffix: '/day' },
  { value: 'weekly',    label: 'Per Week',              suffix: '/wk' },
  { value: 'monthly',   label: 'Per Month (Salary)',    suffix: '/mo' },
  { value: 'per_term',  label: 'Per School Term',       suffix: '/term' },
  { value: 'fixed',     label: 'Fixed / One-off Price', suffix: ' fixed' },
]

// How long the engagement runs
const DURATIONS = [
  '1 Week',
  '2 Weeks',
  '1 Month',
  '3 Months',
  '6 Months',
  '1 School Term',
  '2 School Terms',
  'Full Academic Year',
  'Ongoing / Permanent',
  'Flexible / Negotiable',
]

export default function PostJobPage() {
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [authError, setAuthError] = useState('')

  const [form, setForm] = useState({
    title:               '',
    company_name:        '',
    category:            '',
    location_state:      '',
    job_type:            'full_time',
    rate_type:           '',
    salary_min:          '',
    salary_max:          '',
    engagement_duration: '',
    description:         '',
    requirements:        '',
    deadline:            '',
    require_cert:        true,
  })

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // ── Load current user + pre-fill company_name from employer profile ──
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAuthError('You must be logged in as an employer to post a job.')
        return
      }
      setUserId(user.id)

      // Try to pre-fill company name from employer_profiles
      const { data: ep } = await supabase
        .from('employer_profiles')
        .select('company_name')
        .eq('id', user.id)
        .single()

      if (ep?.company_name) {
        setForm(prev => ({ ...prev, company_name: ep.company_name }))
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!userId) {
      toast.error('You must be logged in to post a job.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('job_listings').insert({
      employer_id:         userId,
      title:               form.title,
      company_name:        form.company_name,
      description:         form.description + (form.requirements
        ? `\n\nRequirements:\n${form.requirements}` : ''),
      job_type:            form.job_type,
      location_state:      form.location_state,
      rate_type:           form.rate_type || null,
      salary_min_ngn:      form.salary_min ? parseFloat(form.salary_min) : null,
      salary_max_ngn:      form.salary_max ? parseFloat(form.salary_max) : null,
      engagement_duration: form.engagement_duration || null,
      deadline:            form.deadline || null,
      required_skills:     form.category ? [form.category] : [],
      is_active:           true,
      is_featured:         false,
      applications:        0,
    })

    if (error) {
      toast.error(error.message)
      console.error('Post job error:', error)
    } else {
      setSubmitted(true)
      toast.success('Job posted successfully! 🎉')
    }
    setLoading(false)
  }

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (authError) {
    return (
      <div className="min-h-screen bg-[#EEF2FF]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#1E1B4B] mb-2">Login Required</h1>
          <p className="text-gray-500 text-sm mb-6">{authError}</p>
          <Link href="/auth/login?next=/employer/post-job"
            className="inline-flex items-center gap-2 bg-[#4F46E5] text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
            Log In to Continue
          </Link>
        </div>
      </div>
    )
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#EEF2FF]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">Job Posted Successfully!</h1>
          <p className="text-gray-500 mb-8">
            Your listing is now live and visible to 3,200+ certified job seekers across Nigeria.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard/employer"
              className="inline-flex items-center gap-2 bg-[#4F46E5] text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              Back to Dashboard
            </Link>
            <button onClick={() => setSubmitted(false)}
              className="inline-flex items-center gap-2 border border-indigo-200 text-[#4F46E5] font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/employer"
            className="inline-flex items-center gap-1 text-sm text-[#4F46E5] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#1E1B4B]">Post a New Job</h1>
          <p className="text-gray-500 text-sm mt-1">
            Reach Nigeria&apos;s best certified graduates — free to post.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic Info ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#4F46E5]" /> Job Details
            </h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Digital Marketing Officer"
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                  Company / Organisation Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={form.company_name} onChange={e => set('company_name', e.target.value)}
                  placeholder="e.g. Dangote Industries Ltd"
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    Skill Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select required value={form.category} onChange={e => set('category', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm appearance-none bg-white">
                      <option value="">Select a category</option>
                      {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    Job Type
                  </label>
                  <div className="relative">
                    <select value={form.job_type} onChange={e => set('job_type', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm appearance-none bg-white">
                      {JOB_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Location ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F97316]" /> Location &amp; Deadline
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                  State / Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select required value={form.location_state} onChange={e => set('location_state', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm appearance-none bg-white">
                    <option value="">Select a state</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline" /> Application Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline} onChange={e => set('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Engagement Terms (pay + duration) ─────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Engagement Terms
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Set the pay structure and how long the engagement runs — especially important for teacher postings.
            </p>
            <div className="space-y-4">

              {/* Pay structure + duration side-by-side */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    Pay Structure
                  </label>
                  <div className="relative">
                    <select value={form.rate_type} onChange={e => set('rate_type', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm appearance-none bg-white">
                      {RATE_TYPES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    <CalendarDays className="w-3.5 h-3.5 inline" /> Engagement Duration
                  </label>
                  <div className="relative">
                    <select value={form.engagement_duration} onChange={e => set('engagement_duration', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm appearance-none bg-white">
                      <option value="">Select duration</option>
                      {DURATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Rate amount fields — label adapts to chosen pay structure */}
              <div className="grid sm:grid-cols-2 gap-4">
                {(() => {
                  const suffix = RATE_TYPES.find(r => r.value === form.rate_type)?.suffix || ''
                  const isFixed = form.rate_type === 'fixed'
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                          {isFixed ? 'Fixed Price (₦)' : `Min Rate (₦${suffix})`}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
                          <input
                            type="number" min={0}
                            value={form.salary_min} onChange={e => set('salary_min', e.target.value)}
                            placeholder={isFixed ? 'e.g. 200000' : 'e.g. 5000'}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                          />
                        </div>
                      </div>
                      {!isFixed && (
                        <div>
                          <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                            Max Rate (₦{suffix})
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
                            <input
                              type="number" min={0}
                              value={form.salary_max} onChange={e => set('salary_max', e.target.value)}
                              placeholder="e.g. 10000"
                              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Live preview chip */}
              {(form.salary_min || form.engagement_duration) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.salary_min && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
                      ₦{Number(form.salary_min).toLocaleString()}
                      {form.rate_type === 'fixed' ? ' fixed' : ''}
                      {form.salary_max && form.rate_type !== 'fixed'
                        ? ` – ₦${Number(form.salary_max).toLocaleString()}` : ''}
                      {RATE_TYPES.find(r => r.value === form.rate_type)?.suffix ?? ''}
                    </span>
                  )}
                  {form.engagement_duration && (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
                      <CalendarDays className="w-3 h-3" /> {form.engagement_duration}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Description ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4">Job Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea required rows={5}
                  value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what a typical day looks like…"
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                  Requirements
                </label>
                <textarea rows={4}
                  value={form.requirements} onChange={e => set('requirements', e.target.value)}
                  placeholder="List skills, experience, or qualifications needed (one per line)…"
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── Preferences ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4">Preferences</h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.require_cert}
                onChange={e => set('require_cert', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#4F46E5]"
              />
              <div>
                <p className="text-sm font-semibold text-[#1E1B4B]">Require SkillBridge Certification</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Only show your listing to candidates who hold a verified SkillBridge certificate in the relevant skill.
                </p>
              </div>
            </label>
          </div>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <button type="submit" disabled={loading || !userId}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 text-base">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting…</>
              : <><CheckCircle className="w-5 h-5" /> Post Job — Free</>}
          </button>
        </form>
      </div>
    </div>
  )
}
