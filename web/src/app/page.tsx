import Link from 'next/link'
import {
  ArrowRight, Star, CheckCircle, BookOpen, TrendingUp, Briefcase,
  Award, Download, Smartphone, Wifi, Globe, Trophy, Target, Zap, Users
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/* ── Data ──────────────────────────────────────────────────────────── */
const COURSES = [
  {
    // Nigerian man with laptop + multiple phones, shot in Lagos Nigeria
    image: 'https://images.unsplash.com/photo-xcUVwwdsWis?w=600&q=80',
    title: 'Digital Marketing Mastery',
    category: 'Business', catBg: 'bg-orange-100', catText: 'text-orange-700',
    cardBorder: 'border-orange-200', shadow: 'shadow-clay-orange',
    badgeText: 'Most Popular', badgeBg: 'bg-orange-500',
    weeks: 4, students: '2.4K', lang: 'EN / Pidgin', free: false,
  },
  {
    // Two Nigerian men coding on laptops, shot in Abuja Nigeria
    image: 'https://images.unsplash.com/photo-DThlV4dYlnE?w=600&q=80',
    title: 'Coding Basics for Beginners',
    category: 'Tech', catBg: 'bg-indigo-100', catText: 'text-indigo-700',
    cardBorder: 'border-indigo-200', shadow: 'shadow-clay-indigo',
    badgeText: 'New', badgeBg: 'bg-indigo-500',
    weeks: 6, students: '1.8K', lang: 'EN / Yoruba', free: false,
  },
  {
    // West African tailor at sewing machine, Accra Ghana
    image: 'https://images.unsplash.com/photo-VJEAwdodmK0?w=600&q=80',
    title: 'Fashion Design & Business',
    category: 'Creative', catBg: 'bg-pink-100', catText: 'text-pink-700',
    cardBorder: 'border-pink-200', shadow: 'shadow-clay-purple',
    badgeText: 'Offline', badgeBg: 'bg-pink-500',
    weeks: 4, students: '3.1K', lang: 'EN / Igbo', free: false,
  },
  {
    // Solar installation (universal technical skill in Nigeria)
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
    title: 'Solar Panel Installation',
    category: 'Technical', catBg: 'bg-yellow-100', catText: 'text-yellow-700',
    cardBorder: 'border-yellow-200', shadow: 'shadow-clay',
    badgeText: 'Offline', badgeBg: 'bg-yellow-500',
    weeks: 4, students: '987', lang: 'EN / Hausa', free: false,
  },
  {
    // Nigerian woman standing in open field, by Nigerian photographer Tomiwa Ogunmodede
    image: 'https://images.unsplash.com/photo-jcKbKG8P_6U?w=600&q=80',
    title: 'Agribusiness Fundamentals',
    category: 'Agriculture', catBg: 'bg-green-100', catText: 'text-green-700',
    cardBorder: 'border-green-200', shadow: 'shadow-clay-green',
    badgeText: 'Free', badgeBg: 'bg-green-500',
    weeks: 4, students: '1.2K', lang: 'EN / Hausa', free: true,
  },
  {
    // Nigerian man working on MacBook, shot in Lagos Nigeria during lockdown
    image: 'https://images.unsplash.com/photo-ajWHOi2r2uA?w=600&q=80',
    title: 'Financial Literacy Essentials',
    category: 'Finance', catBg: 'bg-teal-100', catText: 'text-teal-700',
    cardBorder: 'border-teal-200', shadow: 'shadow-clay-green',
    badgeText: 'Free', badgeBg: 'bg-teal-500',
    weeks: 2, students: '4.5K', lang: 'EN / Pidgin', free: true,
  },
]

const PROGRESS_COURSES = [
  { title: 'Digital Marketing', pct: 85, bar: 'bg-orange-500' },
  { title: 'Coding Basics',     pct: 42, bar: 'bg-indigo-500' },
  { title: 'Financial Literacy',pct: 100, bar: 'bg-green-500' },
]

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo', role: 'Teacher, Enugu State',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
    quote: 'The AI lesson planner changed everything. I create full lesson plans in minutes — my students are more engaged than ever.',
    stars: 5, course: 'EduPro Teacher Training',
    border: 'border-indigo-200', shadow: 'shadow-clay-indigo',
  },
  {
    name: 'Tunde Adeyemi', role: 'Youth Learner, Lagos',
    avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face',
    quote: 'Finished the Digital Marketing course on my Tecno phone using 2G data. Got my first client one week after completing it!',
    stars: 5, course: 'Digital Marketing Mastery',
    border: 'border-orange-200', shadow: 'shadow-clay-orange',
  },
  {
    name: 'Fatima Bashir', role: 'Employer, Kano SME',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    quote: 'We hired 3 certified graduates from OpportunityHub. They came ready to work — best hiring decision we ever made.',
    stars: 5, course: 'OpportunityHub Employer',
    border: 'border-green-200', shadow: 'shadow-clay-green',
  },
]

const CIRCUMFERENCE = 2 * Math.PI * 40 // r=40

/* ── Page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-[#4F46E5] via-[#5553E8] to-[#6366F1] overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#F97316]/15 rounded-full blur-3xl pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                Nigeria&apos;s #1 Education Platform
              </div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                Learn Skills.<br />
                <span className="text-[#F97316]">Earn Money.</span><br />
                Build Nigeria.
              </h1>

              <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-lg">
                Join 48,000+ Nigerians learning practical digital, business &amp; technical skills.
                Works offline on 2G. Available in Yoruba, Igbo, Hausa &amp; Pidgin.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/auth/signup"
                  className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-8 py-4 rounded-2xl text-lg
                             border-[3px] border-orange-800/25 shadow-[0_6px_0_rgba(154,52,18,0.5)]
                             hover:shadow-[0_2px_0_rgba(154,52,18,0.5)] hover:translate-y-1
                             transition-all duration-150 cursor-pointer">
                  Start Learning Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/skillup"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-2xl text-lg
                             border-[3px] border-white/25 shadow-[0_6px_0_rgba(0,0,0,0.2)]
                             hover:bg-white/20 hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-1
                             transition-all duration-150 cursor-pointer">
                  Browse Courses
                </Link>
              </div>

              <div className="flex flex-wrap gap-5 text-white/65 text-sm">
                {['Free to start', 'No credit card', 'Works on 2G', 'Available offline'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-400" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — hero image + floating stats */}
            <div className="relative hidden lg:flex justify-end">
              <div className="relative w-full max-w-md">
                {/* Image card */}
                <div className="bg-white/10 border-[3px] border-white/20 rounded-[32px] overflow-hidden
                                shadow-[0_20px_0_rgba(0,0,0,0.12),0_8px_40px_rgba(0,0,0,0.25)]">
                  <img
                    src="https://images.unsplash.com/photo-VC6MGt9ZoBA?w=700&q=80"
                    alt="Nigerian teacher with students in Port Harcourt classroom"
                    className="w-full h-[420px] object-cover"
                    loading="eager"
                  />
                </div>

                {/* Floating stat — top left */}
                <div className="absolute -top-5 -left-10 bg-white border-[3px] border-indigo-100 rounded-2xl px-5 py-3
                                shadow-[0_6px_0_rgba(79,70,229,0.2),0_4px_16px_rgba(0,0,0,0.12)] animate-float">
                  <div className="font-heading text-2xl font-bold text-[#4F46E5]">48K+</div>
                  <div className="text-xs text-gray-500 font-semibold">Active Learners</div>
                </div>

                {/* Floating stat — mid right */}
                <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white border-[3px] border-green-100 rounded-2xl px-5 py-3
                                shadow-[0_6px_0_rgba(34,197,94,0.2),0_4px_16px_rgba(0,0,0,0.12)]"
                  style={{ animationDelay: '2s' }}>
                  <div className="font-heading text-2xl font-bold text-green-600">12K+</div>
                  <div className="text-xs text-gray-500 font-semibold">Jobs Filled</div>
                </div>

                {/* Floating stat — bottom right */}
                <div className="absolute -bottom-5 -right-8 bg-white border-[3px] border-orange-100 rounded-2xl px-5 py-3
                                shadow-[0_6px_0_rgba(249,115,22,0.2),0_4px_16px_rgba(0,0,0,0.12)]">
                  <div className="font-heading text-2xl font-bold text-[#F97316]">94%</div>
                  <div className="text-xs text-gray-500 font-semibold">Completion Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="lg:hidden grid grid-cols-2 gap-3 mt-8 mb-4">
            {[
              { v: '48K+', l: 'Active Learners', c: 'text-[#4F46E5]' },
              { v: '94%',  l: 'Completion Rate', c: 'text-[#F97316]' },
              { v: '3.2K', l: 'Teachers Trained', c: 'text-purple-400' },
              { v: '12K+', l: 'Jobs Filled',      c: 'text-green-400' },
            ].map(s => (
              <div key={s.l} className="bg-white/10 border border-white/20 rounded-2xl p-3 text-center">
                <div className={`font-heading text-2xl font-bold ${s.c}`}>{s.v}</div>
                <div className="text-white/65 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave into next section */}
        <div className="relative mt-10 -mb-1">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0,36 C360,72 720,0 1080,36 C1260,54 1380,24 1440,36 L1440,72 L0,72 Z" fill="#EEF2FF" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          COURSE CATALOG
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-block bg-white border-[2px] border-indigo-200 text-[#4F46E5] font-bold text-sm px-5 py-2 rounded-full mb-5 shadow-clay-sm">
              100+ Courses Available
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1E1B4B] mb-4">
              Skills That <span className="text-[#F97316]">Pay the Bills</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Every course is designed for Nigerian realities — offline-friendly, locally relevant, and directly connected to jobs.
            </p>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((c) => (
              <Link key={c.title} href="/skillup/courses"
                className={`group bg-white border-[3px] ${c.cardBorder} rounded-3xl overflow-hidden ${c.shadow}
                            hover:-translate-y-2 hover:shadow-none transition-all duration-200 cursor-pointer`}>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={c.image} alt={c.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 ${c.catBg} ${c.catText} text-xs font-bold px-3 py-1 rounded-full`}>
                    {c.category}
                  </span>
                  <span className={`absolute top-3 right-3 ${c.badgeBg} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {c.badgeText}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-[#1E1B4B] mb-2 group-hover:text-[#4F46E5] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{c.weeks} weeks · {c.students} enrolled · {c.lang}</p>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${c.free ? 'text-green-600' : 'text-[#4F46E5]'}`}>
                      {c.free ? 'Free' : 'Start Free'}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#4F46E5] group-hover:bg-[#F97316] text-white text-sm font-bold px-4 py-1.5 rounded-xl transition-colors duration-150">
                      Enroll <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/skillup/courses"
              className="inline-flex items-center gap-2 bg-white border-[3px] border-indigo-200 text-[#4F46E5] font-bold px-8 py-4 rounded-2xl text-lg
                         shadow-clay-indigo hover:shadow-none hover:translate-y-1 transition-all duration-150 cursor-pointer">
              View All 100+ Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PROGRESS TRACKING DEMO
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div>
              <span className="inline-block bg-orange-100 text-[#F97316] font-bold text-sm px-5 py-2 rounded-full mb-5 border-[2px] border-orange-200">
                Track Every Step
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1E1B4B] mb-6">
                Watch Yourself <span className="text-[#4F46E5]">Grow</span> Every Day
              </h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                Your personal dashboard shows exactly how far you&apos;ve come. Earn certificates employers actually trust.
              </p>

              <div className="space-y-4">
                {[
                  { Icon: Target, title: 'Personal Learning Path', desc: 'AI-curated course sequences based on your career goals', bg: 'bg-indigo-50', iconColor: 'text-[#4F46E5]' },
                  { Icon: Trophy, title: 'Verified Certificates', desc: 'Share on LinkedIn and attach directly to job applications', bg: 'bg-orange-50', iconColor: 'text-[#F97316]' },
                  { Icon: Zap, title: 'Offline Progress Sync', desc: 'Learn anywhere offline — syncs automatically when you reconnect', bg: 'bg-green-50', iconColor: 'text-green-600' },
                ].map(({ Icon, title, desc, bg, iconColor }) => (
                  <div key={title}
                    className="flex items-start gap-4 bg-[#EEF2FF] border-[2px] border-indigo-100 rounded-2xl p-4">
                    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-[#1E1B4B] text-base">{title}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — app mockup */}
            <div>
              <div className="bg-[#EEF2FF] border-[3px] border-indigo-200 rounded-[36px] p-6
                              shadow-[0_16px_0_rgba(79,70,229,0.2),0_8px_40px_rgba(79,70,229,0.12)]">

                {/* Greeting */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Welcome back</p>
                    <p className="font-heading font-bold text-[#1E1B4B] text-xl">Tunde 👋</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] flex items-center justify-center
                                  text-white font-heading font-bold text-sm border-[2px] border-indigo-300">
                    TA
                  </div>
                </div>

                {/* Overall progress ring */}
                <div className="bg-white border-[2px] border-indigo-100 rounded-3xl p-5 mb-4
                                shadow-[0_4px_0_rgba(79,70,229,0.10)]">
                  <div className="flex items-center gap-6">
                    <div className="relative shrink-0">
                      <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#EEF2FF" strokeWidth="10" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#4F46E5" strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={CIRCUMFERENCE}
                          strokeDashoffset={CIRCUMFERENCE * (1 - 0.67)}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-heading font-bold text-[#4F46E5] text-xl leading-none">67%</span>
                        <span className="text-[10px] text-gray-400 font-semibold">done</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-[#1E1B4B] text-lg mb-1">Great progress!</p>
                      <p className="text-gray-500 text-sm">2 of 3 courses active</p>
                      <div className="inline-flex items-center gap-1 bg-orange-50 text-[#F97316] font-bold text-sm px-3 py-1 rounded-full mt-2">
                        <Zap className="w-3.5 h-3.5" /> 4-day streak
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual course bars */}
                <div className="space-y-3 mb-4">
                  {PROGRESS_COURSES.map((p) => (
                    <div key={p.title}
                      className="bg-white border-[2px] border-gray-100 rounded-2xl p-4 shadow-[0_2px_0_rgba(0,0,0,0.04)]">
                      <div className="flex justify-between text-sm font-semibold text-[#1E1B4B] mb-2">
                        <span>{p.title}</span>
                        <span className={p.pct === 100 ? 'text-green-600' : 'text-gray-400'}>{p.pct}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${p.bar} rounded-full transition-all`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Achievement badges */}
                <div className="bg-white border-[2px] border-gray-100 rounded-2xl p-4 shadow-[0_2px_0_rgba(0,0,0,0.04)]">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Achievements</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { Icon: Trophy, label: 'First Course', bg: 'bg-yellow-50', color: 'text-yellow-500' },
                      { Icon: Zap,    label: '30-Day Streak',bg: 'bg-orange-50', color: 'text-[#F97316]' },
                      { Icon: Target, label: 'Perfect Score',bg: 'bg-green-50',  color: 'text-green-500' },
                    ].map(({ Icon, label, bg, color }) => (
                      <div key={label} className={`${bg} rounded-xl p-3 text-center border border-gray-100`}>
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                        <p className="text-[10px] font-bold text-gray-600 leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-white border-[2px] border-indigo-200 text-[#4F46E5] font-bold text-sm px-5 py-2 rounded-full mb-5 shadow-clay-sm">
              Simple as 1-2-3
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1E1B4B]">
              Your Journey to <span className="text-[#4F46E5]">Success</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01', title: 'Sign Up Free',
                desc: 'Create your account in 2 minutes. No credit card needed. Works on any Android phone.',
                numBg: 'bg-[#4F46E5]', cardBorder: 'border-indigo-200', shadow: 'shadow-clay-indigo',
                img: 'https://images.unsplash.com/photo-jEEYZsaxbH4?w=400&q=80',
              },
              {
                n: '02', title: 'Choose Your Course',
                desc: 'Browse 100+ practical courses in business, tech, creative arts, and agriculture.',
                numBg: 'bg-[#F97316]', cardBorder: 'border-orange-200', shadow: 'shadow-clay-orange',
                img: 'https://images.unsplash.com/photo-KUzlAah2dog?w=400&q=80',
              },
              {
                n: '03', title: 'Get Certified & Hired',
                desc: 'Complete courses offline, earn verifiable certificates, connect to real job opportunities.',
                numBg: 'bg-green-500', cardBorder: 'border-green-200', shadow: 'shadow-clay-green',
                img: 'https://images.unsplash.com/photo-zOt6a59k2BE?w=400&q=80',
              },
            ].map((step) => (
              <div key={step.n}
                className={`bg-white border-[3px] ${step.cardBorder} rounded-3xl overflow-hidden ${step.shadow}
                            hover:-translate-y-2 hover:shadow-none transition-all duration-200 cursor-default`}>
                <div className="relative h-44 overflow-hidden">
                  <img src={step.img} alt={step.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute bottom-4 left-4 ${step.numBg} text-white font-heading font-bold text-2xl w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}>
                    {step.n}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-2xl font-bold text-[#1E1B4B] mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 border-[2px] border-orange-200 text-[#F97316] font-bold text-sm px-5 py-2 rounded-full mb-5">
              Real Stories
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1E1B4B] mb-4">
              Lives Changed <span className="text-[#4F46E5]">Every Day</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From classrooms in Enugu to markets in Kano — SkillBridge is changing real lives.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className={`bg-[#F8F7FF] border-[3px] ${t.border} rounded-3xl p-7 ${t.shadow}
                            hover:-translate-y-1 transition-all duration-200 cursor-default`}>
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#F97316] text-[#F97316]" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-gray-700 leading-relaxed mb-6 text-base italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} loading="lazy"
                    className="w-12 h-12 rounded-2xl border-[3px] border-white shadow-md object-cover" />
                  <div>
                    <p className="font-heading font-bold text-[#1E1B4B] text-base">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-xs font-bold text-[#4F46E5] bg-indigo-50 px-3 py-1.5 rounded-full">
                    {t.course}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof numbers */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: '4.9/5', l: 'Average Rating',    icon: Star,     c: 'text-[#F97316]', bg: 'bg-orange-50' },
              { n: '48K+',  l: 'Active Students',    icon: Users,    c: 'text-[#4F46E5]', bg: 'bg-indigo-50' },
              { n: '94%',   l: 'Completion Rate',    icon: Award,    c: 'text-green-600',  bg: 'bg-green-50' },
              { n: '12K+',  l: 'Graduates Hired',    icon: Briefcase,c: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(({ n, l, icon: Icon, c, bg }) => (
              <div key={l}
                className="bg-white border-[3px] border-gray-100 rounded-3xl p-5 text-center shadow-clay hover:-translate-y-1 transition-all duration-200 cursor-default">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 ${c}`} />
                </div>
                <p className={`font-heading text-3xl font-bold ${c}`}>{n}</p>
                <p className="text-gray-500 text-sm mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BUILT FOR NIGERIA
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#1E1B4B] text-white relative overflow-hidden">
        <div className="absolute -top-32 right-0 w-96 h-96 bg-[#4F46E5]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className="inline-block bg-white/10 border border-white/20 text-white/80 font-bold text-sm px-5 py-2 rounded-full mb-5">
                Made for Nigeria
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-5 leading-tight">
                Built for <span className="text-[#F97316]">Real Nigerian</span><br /> Conditions
              </h2>
              <p className="text-white/65 text-lg mb-10 leading-relaxed">
                No reliable power or internet? No problem. SkillBridge works with the Nigeria you have today.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { Icon: Wifi,       title: 'Works on 2G',    desc: 'Course downloads under 50MB', color: 'text-[#F97316]' },
                  { Icon: Smartphone, title: 'Any Android',    desc: 'Works on phones from ₦15K',   color: 'text-purple-400' },
                  { Icon: Download,   title: 'Full Offline',   desc: 'Download on WiFi, learn anywhere', color: 'text-green-400' },
                  { Icon: Globe,      title: '5 Languages',    desc: 'EN, Yoruba, Igbo, Hausa, Pidgin', color: 'text-blue-400' },
                ].map(({ Icon, title, desc, color }) => (
                  <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors duration-150">
                    <Icon className={`w-6 h-6 ${color} mb-3`} />
                    <p className="font-heading font-bold text-white mb-1">{title}</p>
                    <p className="text-white/55 text-sm leading-tight">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="bg-white/5 border-[3px] border-white/10 rounded-[32px] overflow-hidden
                              shadow-[0_20px_0_rgba(0,0,0,0.2),0_8px_40px_rgba(0,0,0,0.3)]">
                <img
                  src="https://images.unsplash.com/photo-I80J6MorGqs?w=700&q=80"
                  alt="Nigerian youth using laptop — tagged Yoruba, Hausa, Nigeria"
                  loading="lazy"
                  className="w-full h-80 object-cover opacity-80"
                />
              </div>
              {/* Download card */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 bg-[#F97316]
                              border-[3px] border-orange-700/30 rounded-2xl py-4 px-6 text-center
                              shadow-[0_6px_0_rgba(154,52,18,0.5)]">
                <Download className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="font-heading font-bold text-white text-lg">Download the App</p>
                <p className="text-orange-100 text-xs">Android · Free · Works Offline</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          ENROLLMENT CTA
      ════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 border-[3px] border-white/20 rounded-3xl mb-8
                          shadow-[0_8px_0_rgba(0,0,0,0.15)]">
            <Award className="w-10 h-10 text-[#F97316]" />
          </div>

          <h2 className="font-heading text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Ready to Start?
          </h2>
          <p className="text-xl text-white/75 mb-12 leading-relaxed">
            Join 48,000+ Nigerians already building their future. Free to start — no credit card needed.
          </p>

          {/* Enrollment form */}
          <form action="/auth/signup" method="get"
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <input
              type="email" name="email" placeholder="Enter your email"
              className="flex-1 px-5 py-4 rounded-2xl border-[3px] border-white/25 bg-white/10 text-white
                         placeholder-white/45 font-medium focus:outline-none focus:bg-white/20 focus:border-white/50
                         transition-all text-base"
            />
            <button type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-bold px-7 py-4 rounded-2xl text-base
                         border-[3px] border-orange-800/25 shadow-[0_6px_0_rgba(154,52,18,0.5)]
                         hover:shadow-[0_2px_0_rgba(154,52,18,0.5)] hover:translate-y-1
                         transition-all duration-150 cursor-pointer whitespace-nowrap">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-5 text-white/60 text-sm">
            {['Free to start', 'Cancel anytime', 'Works offline', 'Nigerian data-friendly'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" /> {t}
              </span>
            ))}
          </div>

          {/* Teacher CTA */}
          <div className="mt-10 pt-10 border-t border-white/20">
            <p className="text-white/60 text-base mb-4">Are you a teacher or school administrator?</p>
            <Link href="/edupro"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-7 py-3.5 rounded-2xl
                         border-[2px] border-white/20 hover:bg-white/20 transition-colors duration-150 cursor-pointer">
              <BookOpen className="w-5 h-5" /> Explore EduPro for Teachers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
