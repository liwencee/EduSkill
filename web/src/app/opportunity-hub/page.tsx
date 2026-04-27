import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Briefcase, Search, CheckCircle, Star } from 'lucide-react'

const FEATURES = [
  { icon: '🔍', title: 'Skills-Based Matching',      desc: 'AI matches your certificates and completed courses to relevant job openings — not just your CV.' },
  { icon: '📋', title: 'One-Click Apply',            desc: 'Your verified profile auto-fills every application. Apply to 10 jobs in minutes.' },
  { icon: '🏢', title: 'Verified Employers',         desc: 'All employers are verified. No scam listings, no ghost jobs — just real Nigerian SMEs and NGOs.' },
  { icon: '🤝', title: 'Apprenticeship Programmes',  desc: 'Structured 3–12 month apprenticeships with ITF, N-Power partner organisations, and SMEs.' },
  { icon: '💼', title: 'Freelance Gig Board',        desc: 'Local freelance opportunities: design, marketing, coding, and more for newly skilled youth.' },
  { icon: '📊', title: 'Career Tracker',             desc: 'Track your applications, interview status, and salary progress all in one dashboard.' },
]

const EMPLOYERS = ['MTN Foundation', 'Dangote Group', 'GTBank', 'MAN', 'NECA Partners', 'N-Power', 'Tony Elumelu Foundation', 'NITDA']

export default function OpportunityHubPage() {
  return (
    <div className="bg-brand-bg">
      <Navbar />

      {/* Hero — 30% blue */}
      <section className="bg-brand-blue text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" /> For Certified Youth · Employers · NGOs
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">OpportunityHub</h1>
          <p className="text-xl text-white/80 mb-6 leading-relaxed max-w-2xl">
            Nigeria&apos;s skills-based job marketplace. Earn a SkillBridge certificate → get matched to jobs that actually match your skills.
            No experience? No problem — your certificate is your proof.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 10% amber CTA */}
            <Link href="/opportunity-hub/jobs" className="btn-primary inline-flex items-center gap-2 text-lg">
              Browse All Jobs <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/employer" className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-lg">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — 10% amber strip */}
      <section className="bg-brand-amber py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[['500+','Jobs & gigs posted'],['1,200+','Verified candidates'],['87%','Hire rate within 3 months'],['₦0','Cost to apply']].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold text-brand-ink">{v}</div>
                <div className="text-brand-inkMid text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — 60% cream */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Everything in One Place</h2>
            <p className="section-subtitle mx-auto">OpportunityHub goes beyond job boards — it connects skills to income.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-[#E0DDD5] p-5">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-brand-ink mb-1">{f.title}</h3>
                <p className="text-sm text-brand-inkMid leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer logos — white */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-inkMid text-sm font-medium mb-6">Trusted employer and partner network</p>
          <div className="flex flex-wrap justify-center gap-3">
            {EMPLOYERS.map(e => (
              <span key={e} className="bg-brand-bg border border-[#D5D2C8] text-brand-inkMid text-sm font-medium px-4 py-2 rounded-lg">
                {e}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for youth — 30% blue */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-10">From Certificate to Career</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Complete a Course',   desc: 'Finish any SkillBridge course and pass the assessment.' },
              { step: '2', title: 'Your Profile Goes Live', desc: 'A verified candidate profile is auto-created from your certs.' },
              { step: '3', title: 'Get Matched & Hired', desc: 'AI matches you to jobs. Apply in one click. Get hired.' },
            ].map(s => (
              <div key={s.step}>
                {/* 10% amber step number */}
                <div className="w-14 h-14 bg-brand-amber text-brand-ink rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-white/70 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/opportunity-hub/jobs" className="btn-primary inline-flex items-center gap-2 text-lg">
              Browse Jobs Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/skillup/courses" className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-lg">
              Get Certified First
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
