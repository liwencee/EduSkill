'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Briefcase, MapPin, Clock, DollarSign, ArrowLeft,
  CheckCircle, Loader2, ChevronDown
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

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    title: '',
    category: '',
    location_state: '',
    job_type: 'full_time',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
    deadline: '',
    require_cert: true,
    is_active: true,
  })

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in to post a job')
      router.push('/auth/login?next=/employer/post-job')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('job_listings').insert({
      employer_id: user.id,
      title: form.title,
      category: form.category,
      location_state: form.location_state,
      job_type: form.job_type,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      description: form.description,
      requirements: form.requirements,
      deadline: form.deadline || null,
      require_cert: form.require_cert,
      is_active: true,
      applications: 0,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSubmitted(true)
      toast.success('Job posted successfully! 🎉')
    }
    setLoading(false)
  }

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

          {/* Basic Info */}
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
                      <option value="full_time">Full-Time</option>
                      <option value="part_time">Part-Time</option>
                      <option value="contract">Contract / Freelance</option>
                      <option value="internship">Internship / Apprenticeship</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Salary */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1B4B] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F97316]" /> Location & Compensation
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    <DollarSign className="w-3.5 h-3.5 inline" /> Min Salary (₦/month)
                  </label>
                  <input
                    type="number" min={0}
                    value={form.salary_min} onChange={e => set('salary_min', e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    <DollarSign className="w-3.5 h-3.5 inline" /> Max Salary (₦/month)
                  </label>
                  <input
                    type="number" min={0}
                    value={form.salary_max} onChange={e => set('salary_max', e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                  />
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

          {/* Description */}
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

          {/* Options */}
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
                <p className="text-xs text-gray-500 mt-0.5">Only show your listing to candidates who hold a verified SkillBridge certificate in the relevant skill.</p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 text-base">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting…</> : <>Post Job — Free <CheckCircle className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
