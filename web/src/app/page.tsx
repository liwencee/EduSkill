import Link from 'next/link'
import { BookOpen, Briefcase, Users, Award, Download, ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/* ── Static data ───────────────────────────────────────────────── */
const STATS = [
  { value: '23%',  label: 'Youth unemployment in Nigeria' },
  { value: '278K', label: 'Teacher shortage' },
  { value: '33%',  label: 'Technical education deficit' },
  { value: '1:50', label: 'Train 1 teacher → impact 50 youth' },
]

const FEATURES = [
  {
    icon: BookOpen,
    title: 'EduPro — For Teachers',
    desc: 'CPD short courses, AI-powered lesson planner aligned to NERDC curriculum, peer community, and digital certificates.',
    href: '/edupro',
    cta: 'Explore EduPro',
  },
  {
    icon: TrendingUp,
    title: 'SkillUp — For Youth',
    desc: 'Practical vocational and digital skills courses. Offline-first for 2G networks. Yoruba, Igbo, Hausa, and Pidgin subtitles.',
    href: '/skillup',
    cta: 'Explore SkillUp',
  },
  {
    icon: Briefcase,
    title: 'OpportunityHub — Jobs',
    desc: 'AI-powered job matching connects certified youth directly to Nigerian SMEs, apprenticeships, and freelance gigs.',
    href: '/opportunity-hub',
    cta: 'Browse Jobs',
  },
]

const HOW_WORKS = [
  { step: '01', role: 'Teacher', action: 'Takes a 3-week CPD course on EduPro',           outcome: 'Earns a verifiable digital certificate' },
  { step: '02', role: 'Teacher', action: 'Uses AI Lesson Planner in classroom',             outcome: 'Saves 3–5 hours/week on preparation' },
  { step: '03', role: 'Youth',   action: 'Downloads a 4-week course on the app',            outcome: 'Learns offline even on 2G network' },
  { step: '04', role: 'Youth',   action: 'Completes project and earns micro-cert',          outcome: 'Profile goes live on OpportunityHub' },
  { step: '05', role: 'Employer','action': 'Searches certified graduates by skill',          outcome: 'Hires or offers apprenticeship in one click' },
]

const COURSES_PREVIEW = [
  { emoji: '📱', title: 'Digital Marketing',       weeks: 4, lang: 'EN/Pidgin', badge: 'Popular' },
  { emoji: '💻', title: 'Coding Basics',            weeks: 6, lang: 'EN/Yoruba', badge: 'New' },
  { emoji: '👗', title: 'Fashion Design & Business',weeks: 4, lang: 'EN/Igbo',   badge: 'Offline' },
  { emoji: '☀️', title: 'Solar Installation',       weeks: 4, lang: 'EN/Hausa',  badge: 'Offline' },
  { emoji: '🌱', title: 'Agribusiness',             weeks: 4, lang: 'EN/Hausa',  badge: 'Free' },
  { emoji: '💰', title: 'Financial Literacy',       weeks: 2, lang: 'EN/Pidgin', badge: 'Free' },
]

const TESTIMONIALS = [
  { name: 'Adaeze O.',  role: 'Secondary School Teacher, Enugu',   quote: 'The AI lesson planner saved me so much time. I now create full lesson plans in minutes instead of hours.' },
  { name: 'Tunde A.',   role: 'Youth Learner, Lagos',              quote: 'I completed the Digital Marketing course on my Tecno phone with 2G data. Got my first client one week after.' },
  { name: 'Fatima B.',  role: 'Employer, Kano SME',                quote: 'We hired 3 certified graduates from OpportunityHub. They came ready to work — no extra training needed.' },
]

export default function LandingPage() {
  return (
    /* 60% cream background dominates the page */
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* ── HERO — 30% blue structural section ──────────────────────── */}
      <section className="relative bg-brand-blue overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, #ffffff 0%, transparent 55%), radial-gradient(circle at 80% 20%, #EF9F27 0%, transparent 50%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-amber animate-pulse" />
              Nigeria&apos;s first two-sided education platform
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Upskill Teachers.<br />
              {/* 10% amber on key phrase */}
              <span className="text-brand-amber">Empower Youth.</span><br />
              Connect to Opportunity.
            </h1>

            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Train 1 teacher on SkillBridge → they impact 30–50 youth every year for the rest of their career.
              Works offline on 2G. Available in Yoruba, Igbo, Hausa, and Pidgin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* 10% amber CTA */}
              <Link href="/auth/signup" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              {/* Ghost outline on blue bg */}
              <Link href="/skillup"
                className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl
                           hover:border-white hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 text-lg">
                Browse Courses
              </Link>
            </div>

            <p className="text-white/50 text-sm mt-4">
              No credit card required · Works on any Android phone · Available offline
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS — 10% amber strip ──────────────────────────────────── */}
      <section className="bg-brand-amber py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.value}>
                <div className="text-3xl font-bold text-brand-ink">{s.value}</div>
                <div className="text-brand-ink/70 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE MODULES — 60% cream bg ─────────────────────────────── */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">One Platform. Three Powerful Modules.</h2>
            <p className="section-subtitle mx-auto">
              Teachers, youth, and employers all connect on the same platform — creating a self-reinforcing cycle of skills and opportunity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 flex flex-col bg-white">
                {/* 30% blue icon container */}
                <div className="w-12 h-12 rounded-xl bg-brand-blueLight flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink mb-2">{f.title}</h3>
                <p className="text-brand-inkMid text-sm leading-relaxed flex-1 mb-4">{f.desc}</p>
                {/* 30% blue link */}
                <Link href={f.href} className="text-brand-blue font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  {f.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — white section ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">How SkillBridge Works</h2>
            <p className="section-subtitle mx-auto">From training to employment in one connected flow.</p>
          </div>
          <div className="space-y-4">
            {HOW_WORKS.map((step, i) => (
              <div key={i} className="card bg-white p-5 flex items-start gap-5">
                {/* 10% amber step number */}
                <span className="text-brand-amber font-bold text-lg w-8 shrink-0">{step.step}</span>
                <div className="flex-1">
                  {/* 30% blue role badge */}
                  <span className="badge badge-blue mb-2">{step.role}</span>
                  <p className="font-medium text-brand-ink">{step.action}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-inkMid shrink-0">
                  <CheckCircle className="w-4 h-4 text-brand-blue" />
                  {step.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES — 60% cream ──────────────────────────────────────── */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Popular Courses</h2>
              <p className="section-subtitle">Practical skills that lead to real jobs in Nigeria.</p>
            </div>
            <Link href="/skillup/courses" className="btn-outline hidden md:inline-flex items-center gap-2">
              All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSES_PREVIEW.map(c => (
              <Link key={c.title} href="/skillup/courses"
                className="bg-white rounded-2xl border border-[#E0DDD5] p-5 flex items-start gap-4 group hover:border-brand-blue/40 hover:shadow-md transition-all">
                {/* Cream bg emoji thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center text-2xl shrink-0">
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-brand-ink text-sm truncate group-hover:text-brand-blue transition-colors">
                      {c.title}
                    </h4>
                    {/* 10% amber badge */}
                    <span className="badge badge-amber ml-2 shrink-0">{c.badge}</span>
                  </div>
                  <p className="text-xs text-brand-inkLight">{c.weeks} weeks · {c.lang}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2G / OFFLINE — 30% blue section ─────────────────────────── */}
      <section className="py-16 bg-brand-blueDark text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Built for Nigerian Realities</h2>
              <ul className="space-y-3">
                {[
                  ['📶', 'Works offline — download courses on WiFi, learn anywhere'],
                  ['🌍', 'Yoruba, Igbo, Hausa & Pidgin subtitles on all courses'],
                  ['📱', 'Optimised for Android phones on 2G/3G networks'],
                  ['💾', 'Full course downloads under 50MB to save data'],
                  ['⚡', 'Adaptive video quality — never buffers on slow data'],
                ].map(([icon, text]) => (
                  <li key={text as string} className="flex items-center gap-3 text-white/80">
                    <span className="text-xl">{icon}</span>
                    <span>{text as string}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {/* 60% cream-tinted card on dark bg */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <Download className="w-10 h-10 text-brand-amber mx-auto mb-3" />
                <p className="font-bold text-lg">Download the App</p>
                <p className="text-white/60 text-sm mb-4">Android · Free · Works offline</p>
                {/* 10% amber CTA on dark bg */}
                <a href="#download" className="btn-primary inline-block">Download APK</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — white ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Real People. Real Results.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card bg-brand-bg border-[#DDD9CF] p-6">
                {/* 10% amber stars */}
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-amber text-brand-amber" />)}
                </div>
                <p className="text-brand-inkMid text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-brand-ink text-sm">{t.name}</p>
                  <p className="text-brand-inkLight text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — 30% blue ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-blue text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Award className="w-16 h-16 mx-auto mb-6 text-brand-amber" />
          <h2 className="text-4xl font-bold mb-4">Ready to Bridge the Skills Gap?</h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of teachers and youth already building a better Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* 10% amber primary CTA */}
            <Link href="/auth/signup?role=teacher" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
              I&apos;m a Teacher <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/signup?role=youth"
              className="bg-white text-brand-blue font-semibold px-6 py-3 rounded-xl hover:bg-brand-bg transition-colors inline-flex items-center justify-center gap-2 text-lg">
              I&apos;m a Youth Learner <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-4 flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Free to start · No credit card · Works on any Android phone
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
