import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, CheckCircle, Download, Globe, Star } from 'lucide-react'

const COURSE_TRACKS = [
  { emoji: '📱', title: 'Digital Marketing',        desc: 'Social media, content, paid ads for Nigerian SMEs',         weeks: 4, lang: 'EN · Pidgin',  badge: 'Popular', slug: 'digital-marketing-fundamentals' },
  { emoji: '💻', title: 'Coding Basics',             desc: 'HTML, CSS, JavaScript — build your first real website',     weeks: 6, lang: 'EN · Yoruba', badge: 'New',     slug: 'coding-basics-web' },
  { emoji: '👗', title: 'Fashion Design & Business', desc: 'Pattern-making, pricing, and selling fashion in Nigeria',   weeks: 4, lang: 'EN · Igbo',   badge: 'Offline', slug: 'fashion-design-business' },
  { emoji: '☀️', title: 'Solar Installation',        desc: 'Install, wire, and maintain solar panels professionally',   weeks: 4, lang: 'EN · Hausa',  badge: 'Offline', slug: 'solar-installation' },
  { emoji: '🌱', title: 'Agribusiness',              desc: 'Modern farming, post-harvest, and selling your produce',    weeks: 4, lang: 'EN · Hausa',  badge: 'Free',    slug: 'agribusiness-farm-to-market' },
  { emoji: '💰', title: 'Financial Literacy',        desc: 'Budget, save, bank, and start a business with ₦50K',       weeks: 2, lang: 'EN · Pidgin', badge: 'Free',    slug: 'financial-literacy-youth' },
]

const BADGE_STYLE: Record<string, string> = {
  Popular: 'bg-brand-blue text-white',
  New:     'bg-brand-amber text-brand-ink',
  Offline: 'bg-[#E8E5DC] text-brand-ink',
  Free:    'bg-green-100 text-green-800',
}

export default function SkillUpPage() {
  return (
    <div className="bg-brand-bg">
      <Navbar />

      {/* Hero — 30% blue */}
      <section className="bg-brand-blue text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🎓 For Youth Learners aged 18–35
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SkillUp</h1>
          <p className="text-xl text-white/80 mb-6 leading-relaxed max-w-2xl">
            Practical vocational and digital skills. Works offline on 2G. Taught in Yoruba, Igbo, Hausa, and Pidgin.
            Earn a verifiable certificate and get matched to jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 10% amber CTA */}
            <Link href="/skillup/courses" className="btn-primary inline-flex items-center gap-2 text-lg">
              Browse All Courses <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/signup?role=youth"
              className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:border-white hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-lg">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Why SkillUp — 60% cream */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-brand-ink mb-4">Built for Nigerian Youth</h2>
              <ul className="space-y-3">
                {[
                  ['📶', 'Download on WiFi, learn on 2G — or completely offline'],
                  ['🌍', 'Subtitles in Yoruba, Igbo, Hausa, and Pidgin'],
                  ['📱', 'Optimised for Tecno, Infinix, Itel Android phones'],
                  ['✅', 'Real-world projects — not just multiple-choice tests'],
                  ['🏅', 'Blockchain-verifiable certificates employers trust'],
                  ['💼', 'Auto-matched to jobs on OpportunityHub after cert'],
                ].map(([icon, text]) => (
                  <li key={text as string} className="flex items-center gap-3 text-brand-inkMid">
                    <span className="text-xl w-7 shrink-0">{icon}</span>
                    <span>{text as string}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Stats card — white surface */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '50+',    label: 'Practical courses',         color: 'text-brand-blue' },
                { value: '5',      label: 'Nigerian languages',         color: 'text-brand-amber' },
                { value: '60%+',   label: 'Avg completion rate',        color: 'text-brand-blue' },
                { value: '₦0',     label: 'To start learning',          color: 'text-brand-amber' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#E0DDD5] p-5 text-center">
                  <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-sm text-brand-inkMid">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course tracks — white */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Available Courses</h2>
              <p className="section-subtitle">Each course ends with a real project and a verifiable certificate.</p>
            </div>
            <Link href="/skillup/courses" className="btn-outline hidden md:inline-flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSE_TRACKS.map(c => (
              <Link key={c.slug} href={`/skillup/courses/${c.slug}`}
                className="bg-white rounded-2xl border border-[#E0DDD5] p-5 hover:border-brand-blue/40 hover:shadow-md transition-all group">
                {/* 60% cream emoji block */}
                <div className="w-14 h-14 bg-brand-bg rounded-xl flex items-center justify-center text-3xl mb-4">{c.emoji}</div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-brand-ink group-hover:text-brand-blue transition-colors">{c.title}</h3>
                  {/* 10% amber badge */}
                  <span className={`badge shrink-0 text-xs ${BADGE_STYLE[c.badge] ?? 'badge-cream'}`}>{c.badge}</span>
                </div>
                <p className="text-sm text-brand-inkMid mb-3 leading-relaxed">{c.desc}</p>
                <div className="flex gap-4 text-xs text-brand-inkLight">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{c.weeks} weeks</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{c.lang}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" />Offline</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How earning works — 30% blue */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">From Zero Skill to Employed</h2>
          <p className="text-white/70 mb-10 text-lg">The SkillUp pathway in 4 steps.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', title: 'Enrol Free',        desc: 'Pick a course and enrol at no cost.' },
              { n: '2', title: 'Learn Offline',     desc: 'Download on WiFi, study anywhere.' },
              { n: '3', title: 'Earn Certificate',  desc: 'Complete the project and get your verifiable cert.' },
              { n: '4', title: 'Get Hired',         desc: 'OpportunityHub matches you to local jobs.' },
            ].map(step => (
              <div key={step.n} className="text-center">
                {/* 10% amber step circle */}
                <div className="w-12 h-12 bg-brand-amber text-brand-ink rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {step.n}
                </div>
                <h4 className="font-bold mb-1">{step.title}</h4>
                <p className="text-white/70 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/auth/signup?role=youth" className="btn-primary inline-flex items-center gap-2 text-lg">
              Start Learning Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
