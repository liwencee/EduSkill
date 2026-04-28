import Link from 'next/link'
import {
  BookOpen, Briefcase, Users, Award, Download,
  ArrowRight, CheckCircle, Star, TrendingUp,
} from 'lucide-react'
import Navbar  from '@/components/Navbar'
import Footer  from '@/components/Footer'

/* ─────────────────────────────────────────────────────────────────
   Static data
   UI/UX Pro Max: Educational App → Claymorphism + Micro-interactions
   Color palette: Playful indigo-adjacent + energetic orange
   Font: Plus Jakarta Sans (headings) · Nunito (body)
───────────────────────────────────────────────────────────────── */

const STATS = [
  { value: '23%',  label: 'Youth unemployment in Nigeria', emoji: '📉' },
  { value: '278K', label: 'Teacher shortage nationwide',   emoji: '👩‍🏫' },
  { value: '33%',  label: 'Technical education deficit',   emoji: '📚' },
  { value: '1:50', label: 'Teacher → Youth impact ratio',  emoji: '⚡' },
]

const FEATURES = [
  {
    Icon: BookOpen,
    title: 'EduPro',
    subtitle: 'For Teachers',
    desc: 'CPD short courses, AI-powered lesson planner aligned to NERDC curriculum, peer community, and digital certificates.',
    href: '/edupro',
    cta: 'Explore EduPro',
    topBar:    'from-[#378ADD] to-[#1e4f8a]',
    iconBg:    'bg-blue-100',
    iconColor: 'text-[#378ADD]',
    ctaColor:  'text-[#378ADD]',
    tagBg:     'bg-blue-100 text-blue-700',
    tag:       'Teachers',
    clayShadow:'clay-card-blue',
  },
  {
    Icon: TrendingUp,
    title: 'SkillUp',
    subtitle: 'For Youth',
    desc: 'Practical vocational and digital skills courses. Offline-first for 2G networks. Available in Yoruba, Igbo, Hausa, and Pidgin.',
    href: '/skillup',
    cta: 'Explore SkillUp',
    topBar:    'from-[#EF9F27] to-[#C97E0A]',
    iconBg:    'bg-amber-100',
    iconColor: 'text-[#EF9F27]',
    ctaColor:  'text-[#EF9F27]',
    tagBg:     'bg-amber-100 text-amber-700',
    tag:       'Youth',
    clayShadow:'clay-card-amber',
  },
  {
    Icon: Briefcase,
    title: 'OpportunityHub',
    subtitle: 'Find Jobs',
    desc: 'AI-powered job matching connects certified youth directly to Nigerian SMEs, apprenticeships, and freelance gigs.',
    href: '/opportunity-hub',
    cta: 'Browse Jobs',
    topBar:    'from-emerald-500 to-teal-600',
    iconBg:    'bg-emerald-100',
    iconColor: 'text-emerald-600',
    ctaColor:  'text-emerald-600',
    tagBg:     'bg-emerald-100 text-emerald-700',
    tag:       'Everyone',
    clayShadow:'clay-card-green',
  },
]

const HOW_WORKS = [
  {
    step: '01', role: 'Teacher',
    roleClasses: 'bg-blue-100 text-blue-700 border border-blue-200',
    action: 'Takes a 3-week CPD course on EduPro',
    outcome: 'Earns a verifiable digital certificate',
    dotBg: 'bg-[#378ADD]',
  },
  {
    step: '02', role: 'Teacher',
    roleClasses: 'bg-blue-100 text-blue-700 border border-blue-200',
    action: 'Uses AI Lesson Planner in the classroom',
    outcome: 'Saves 3–5 hours/week on preparation',
    dotBg: 'bg-[#378ADD]',
  },
  {
    step: '03', role: 'Youth',
    roleClasses: 'bg-amber-100 text-amber-700 border border-amber-200',
    action: 'Downloads a 4-week course on the app',
    outcome: 'Learns offline even on 2G network',
    dotBg: 'bg-[#EF9F27]',
  },
  {
    step: '04', role: 'Youth',
    roleClasses: 'bg-amber-100 text-amber-700 border border-amber-200',
    action: 'Completes project and earns micro-certificate',
    outcome: 'Profile goes live on OpportunityHub',
    dotBg: 'bg-[#EF9F27]',
  },
  {
    step: '05', role: 'Employer',
    roleClasses: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    action: 'Searches certified graduates by skill',
    outcome: 'Hires or offers apprenticeship in one click',
    dotBg: 'bg-emerald-500',
  },
]

const COURSES_PREVIEW = [
  { emoji: '📱', title: 'Digital Marketing',        weeks: 4, lang: 'EN/Pidgin', badge: 'Popular', grad: 'from-pink-500 to-rose-500'    },
  { emoji: '💻', title: 'Coding Basics',             weeks: 6, lang: 'EN/Yoruba', badge: 'New',     grad: 'from-violet-500 to-purple-600' },
  { emoji: '👗', title: 'Fashion Design & Business', weeks: 4, lang: 'EN/Igbo',   badge: 'Offline', grad: 'from-fuchsia-400 to-pink-600'  },
  { emoji: '☀️', title: 'Solar Installation',        weeks: 4, lang: 'EN/Hausa',  badge: 'Offline', grad: 'from-amber-400 to-orange-500'  },
  { emoji: '🌱', title: 'Agribusiness',              weeks: 4, lang: 'EN/Hausa',  badge: 'Free',    grad: 'from-green-400 to-emerald-600' },
  { emoji: '💰', title: 'Financial Literacy',        weeks: 2, lang: 'EN/Pidgin', badge: 'Free',    grad: 'from-teal-400 to-cyan-600'     },
]

const TESTIMONIALS = [
  {
    name: 'Adaeze O.', role: 'Secondary School Teacher, Enugu',
    quote: 'The AI lesson planner saved me so much time. I now create full lesson plans in minutes instead of hours.',
    initials: 'AO', avatarGrad: 'from-[#378ADD] to-[#1e4f8a]',
  },
  {
    name: 'Tunde A.', role: 'Youth Learner, Lagos',
    quote: 'I completed the Digital Marketing course on my Tecno phone with 2G data. Got my first client one week after.',
    initials: 'TA', avatarGrad: 'from-[#EF9F27] to-[#C97E0A]',
  },
  {
    name: 'Fatima B.', role: 'Employer, Kano SME',
    quote: 'We hired 3 certified graduates from OpportunityHub. They came ready to work — no extra training needed.',
    initials: 'FB', avatarGrad: 'from-emerald-400 to-teal-500',
  },
]

/* ─────────────────────────────────────────────────────────────────
   Page component
───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
          HERO  —  aurora dark-blue canvas
          Accessibility: min 4.5:1 contrast on all text
          Touch targets: all CTAs ≥ 44px
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0d2a4a] overflow-hidden min-h-[88vh] flex items-center">

        {/* Aurora background blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 -left-20 w-[55%] h-[65%] rounded-full bg-[#378ADD]/25 blur-[130px]" />
          <div className="absolute bottom-0 -right-10 w-[45%] h-[55%] rounded-full bg-[#EF9F27]/18 blur-[110px]" />
          <div className="absolute top-[35%] right-[25%] w-[28%] h-[35%] rounded-full bg-[#1e4f8a]/35 blur-[90px]" />
        </div>

        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="max-w-4xl">

            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[#EF9F27] animate-pulse" aria-hidden />
              Nigeria&apos;s first two-sided education platform
            </div>

            {/* Headline */}
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-white leading-[1.08] mb-6 animate-slide-up">
              Upskill Teachers.<br />
              <span className="gradient-text-amber">Empower Youth.</span><br />
              Connect to Opportunity.
            </h1>

            <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-2xl">
              Train 1 teacher on SkillBridge → they impact 30–50 youth every year for the rest of their career.
              Works offline on 2G. Available in Yoruba, Igbo, Hausa, and Pidgin.
            </p>

            {/* CTAs — min 44px height for touch targets */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-[#EF9F27] hover:bg-[#C97E0A] text-[#2C2C2A] font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/25 focus:outline-none focus:ring-2 focus:ring-[#EF9F27] focus:ring-offset-2 focus:ring-offset-[#0d2a4a]"
              >
                Get Started Free <ArrowRight className="w-5 h-5" aria-hidden />
              </Link>
              <Link
                href="/skillup"
                className="inline-flex items-center justify-center gap-2 glass glass-hover text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0d2a4a]"
              >
                Browse Courses
              </Link>
            </div>

            {/* Floating stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATS.map(s => (
                <div
                  key={s.value}
                  className="glass glass-hover rounded-2xl p-4 text-center transition-colors"
                >
                  <div className="text-2xl mb-1" aria-hidden>{s.emoji}</div>
                  <div className="font-heading text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-white/55 text-xs mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave transition to cream */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" className="w-full fill-[#F1EFE8]" preserveAspectRatio="none">
            <path d="M0,36 C480,72 960,0 1440,36 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          THREE MODULES  —  Claymorphism bento grid
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-pill-blue">One Platform</span>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-brand-ink mb-4">
              Three Powerful Modules
            </h2>
            <p className="text-lg text-brand-inkMid max-w-2xl mx-auto leading-relaxed">
              Teachers, youth, and employers all connect on the same platform —
              creating a self-reinforcing cycle of skills and opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <article
                key={f.title}
                className={`clay-card ${f.clayShadow} group flex flex-col`}
              >
                {/* Coloured top accent bar */}
                <div className={`h-1.5 rounded-t-3xl bg-gradient-to-r ${f.topBar}`} aria-hidden />

                <div className="p-8 flex flex-col flex-1">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <f.Icon className={`w-7 h-7 ${f.iconColor}`} aria-hidden />
                  </div>

                  {/* Tag pill */}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 ${f.tagBg}`}>
                    {f.tag}
                  </span>

                  <h3 className="font-heading text-2xl font-bold text-brand-ink mb-1">{f.title}</h3>
                  <p className="text-brand-inkLight text-sm font-medium mb-3">{f.subtitle}</p>
                  <p className="text-brand-inkMid text-sm leading-relaxed flex-1 mb-6">{f.desc}</p>

                  <Link
                    href={f.href}
                    className={`inline-flex items-center gap-1.5 font-semibold text-sm ${f.ctaColor} group-hover:gap-3 transition-all duration-200 focus:outline-none focus:underline`}
                  >
                    {f.cta} <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS  —  Connected vertical timeline
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-pill-blue">The Journey</span>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-brand-ink mb-4">
              How SkillBridge Works
            </h2>
            <p className="text-lg text-brand-inkMid">From training to employment in one connected flow.</p>
          </div>

          <ol className="relative space-y-5">
            {/* Vertical connecting line */}
            <div
              className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#378ADD] via-[#EF9F27] to-emerald-500"
              aria-hidden
            />

            {HOW_WORKS.map((s, i) => (
              <li key={i} className="relative flex gap-6">
                {/* Numbered dot */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-2xl ${s.dotBg} flex items-center justify-center shrink-0 shadow-md`}
                  aria-hidden
                >
                  <span className="font-heading font-bold text-white text-sm">{s.step}</span>
                </div>

                {/* Card */}
                <div className="flex-1 bg-brand-bg rounded-2xl p-5 border border-[#E0DDD5] hover:border-[#378ADD]/30 hover:shadow-md transition-all duration-200">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2 ${s.roleClasses}`}>
                    {s.role}
                  </span>
                  <p className="font-semibold text-brand-ink mb-2">{s.action}</p>
                  <div className="flex items-center gap-2 text-sm text-brand-inkMid">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden />
                    <span>{s.outcome}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COURSES  —  Colourful gradient cards
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="section-pill-amber">Popular Courses</span>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-brand-ink mb-3">
                Skills That Lead to Real Jobs
              </h2>
              <p className="text-lg text-brand-inkMid">Practical, offline-ready, in your language.</p>
            </div>
            <Link
              href="/skillup/courses"
              className="inline-flex items-center gap-2 border-2 border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#378ADD] focus:ring-offset-2"
            >
              All Courses <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES_PREVIEW.map(c => (
              <Link
                key={c.title}
                href="/skillup/courses"
                className="group bg-white rounded-3xl overflow-hidden border border-[#E0DDD5] hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#378ADD] focus:ring-offset-2"
              >
                {/* Gradient header with emoji */}
                <div className={`bg-gradient-to-br ${c.grad} p-6 flex items-center justify-between`}>
                  <span className="text-4xl" role="img" aria-label={c.title}>{c.emoji}</span>
                  <span className="bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                    {c.badge}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="font-heading font-bold text-brand-ink text-lg mb-2 group-hover:text-[#378ADD] transition-colors">
                    {c.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-brand-inkMid">
                    <span>{c.weeks} weeks</span>
                    <span className="bg-brand-bg px-2 py-0.5 rounded-md text-xs font-medium">{c.lang}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BUILT FOR NIGERIA  —  Dark glassmorphism section
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0d2a4a] relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-[40%] h-[60%] rounded-full bg-[#378ADD]/15 blur-[110px]" />
          <div className="absolute bottom-0 left-0 w-[35%] h-[50%] rounded-full bg-[#EF9F27]/12 blur-[90px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <span className="inline-block glass text-white/70 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                Built for Nigeria
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Designed for<br />
                <span className="gradient-text-amber">Nigerian Realities</span>
              </h2>
              <ul className="space-y-5" role="list">
                {[
                  { icon: '📶', text: 'Works offline — download on WiFi, learn anywhere' },
                  { icon: '🌍', text: 'Yoruba, Igbo, Hausa & Pidgin subtitles on all courses' },
                  { icon: '📱', text: 'Optimised for Android phones on 2G/3G networks' },
                  { icon: '💾', text: 'Full course downloads under 50MB to save data' },
                  { icon: '⚡', text: 'Adaptive video quality — never buffers on slow data' },
                ].map(item => (
                  <li key={item.text} className="flex items-start gap-4">
                    <span className="text-2xl shrink-0 mt-0.5" role="img" aria-hidden>{item.icon}</span>
                    <span className="text-white/75 leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download card */}
            <div className="glass rounded-3xl p-8 text-center hover:bg-white/15 transition-colors">
              <div className="w-20 h-20 bg-[#EF9F27]/20 border border-[#EF9F27]/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-[#EF9F27]" aria-hidden />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-2">Download the App</h3>
              <p className="text-white/55 mb-7">Android · Free · Works offline</p>
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 bg-[#EF9F27] hover:bg-[#C97E0A] text-[#2C2C2A] font-bold px-8 py-4 rounded-2xl w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/25 focus:outline-none focus:ring-2 focus:ring-[#EF9F27] focus:ring-offset-2 focus:ring-offset-[#0d2a4a]"
              >
                Download APK <Download className="w-5 h-5" aria-hidden />
              </a>
              <p className="text-white/35 text-xs mt-4">Android 6.0+ · ~12 MB · No sign-up needed to browse</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS  —  Gradient avatar cards
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-pill-green">Real Stories</span>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-brand-ink">
              Real People. Real Results.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
              <figure
                key={t.name}
                className="bg-brand-bg rounded-3xl p-8 border border-[#DDD9CF] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Star rating */}
                <div className="flex gap-1 mb-5" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#EF9F27] text-[#EF9F27]" aria-hidden />
                  ))}
                </div>

                <blockquote className="text-brand-inkMid leading-relaxed mb-6 text-sm">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="flex items-center gap-3">
                  {/* Gradient avatar */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.avatarGrad} flex items-center justify-center shrink-0`}
                    aria-hidden
                  >
                    <span className="font-heading font-bold text-white text-sm">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-brand-ink text-sm">{t.name}</p>
                    <p className="text-brand-inkLight text-xs">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA  —  Deep blue with ambient glow
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-[#1e4f8a] overflow-hidden">
        {/* Subtle ambient glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#378ADD]/20 to-transparent" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#EF9F27]/15 to-transparent" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Award icon */}
          <div className="w-20 h-20 bg-[#EF9F27]/20 border border-[#EF9F27]/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Award className="w-10 h-10 text-[#EF9F27]" aria-hidden />
          </div>

          <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Bridge<br />the Skills Gap?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of teachers and youth already building a better Nigeria.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/auth/signup?role=teacher"
              className="inline-flex items-center justify-center gap-2 bg-[#EF9F27] hover:bg-[#C97E0A] text-[#2C2C2A] font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-[#EF9F27] focus:ring-offset-2 focus:ring-offset-[#1e4f8a]"
            >
              I&apos;m a Teacher <ArrowRight className="w-5 h-5" aria-hidden />
            </Link>
            <Link
              href="/auth/signup?role=youth"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-bg text-[#1e4f8a] font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1e4f8a]"
            >
              I&apos;m a Youth Learner <ArrowRight className="w-5 h-5" aria-hidden />
            </Link>
          </div>

          <p className="text-white/40 text-sm flex items-center justify-center gap-2">
            <Users className="w-4 h-4" aria-hidden />
            Free to start · No credit card · Works on any Android phone
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
