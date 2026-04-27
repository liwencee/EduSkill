import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Briefcase, Search, CheckCircle, ArrowRight } from 'lucide-react'

export default function EmployerPage() {
  return (
    <>
      <Navbar />

      {/* Hero — 30% blue */}
      <section className="bg-brand-blue text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/80 px-4 py-2 rounded-full text-sm mb-6">
            <Briefcase className="w-4 h-4" /> For Employers &amp; SMEs
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Skilled, Certified Graduates</h1>
          <p className="text-xl text-white/80 mb-6 leading-relaxed max-w-2xl">
            Browse verified candidates who have completed practical vocational and digital skills training.
            No more expensive recruiters. No more untrained hires.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 10% amber CTA */}
            <Link href="/auth/signup?role=employer" className="btn-primary inline-flex items-center gap-2 text-lg">
              Register as Employer <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/opportunity-hub/jobs"
              className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-lg">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — white */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">How It Works for Employers</h2>
          <p className="section-subtitle text-center mx-auto mb-12">From posting to hiring in 3 steps.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Briefcase,    title: 'Post Your Opening',          desc: 'List a job, apprenticeship, or freelance gig in under 5 minutes. Basic listings are free.' },
              { step: '2', icon: Search,        title: 'Browse Verified Candidates', desc: 'Filter by skill, location, language, and certification. See real project portfolios — not just CVs.' },
              { step: '3', icon: CheckCircle,   title: 'Hire with Confidence',       desc: 'Candidates have passed real assessments. One-click application and in-platform messaging.' },
            ].map(s => (
              <div key={s.step} className="card p-6 text-center">
                {/* 10% amber step number */}
                <div className="w-12 h-12 bg-brand-amber text-brand-ink rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{s.step}</div>
                <s.icon className="w-8 h-8 text-brand-blue mx-auto mb-3" />
                <h3 className="font-bold text-lg text-brand-ink mb-2">{s.title}</h3>
                <p className="text-brand-inkMid text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — 60% cream */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-3">Employer Pricing</h2>
          <p className="section-subtitle mx-auto mb-10">Transparent pricing. No hidden fees.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { plan: 'Basic',      price: 'Free',        features: ['1 active listing', 'Standard visibility', 'Up to 20 applicants'],                                                    highlight: false },
              { plan: 'Growth',     price: '₦10K–25K',   period: '/listing', features: ['Featured listing', 'Unlimited applicants', 'Candidate shortlisting tools'],                       highlight: true  },
              { plan: 'Enterprise', price: '₦50K+',       period: '/month',   features: ['Unlimited listings', 'Dedicated account manager', 'Bulk candidate search', 'CSR impact reporting'], highlight: false },
            ].map(p => (
              <div key={p.plan} className={`card p-6 ${p.highlight ? 'border-brand-amber ring-2 ring-brand-amber/20' : ''}`}>
                {/* 10% amber highlight badge */}
                {p.highlight && <span className="badge badge-amber mb-2 inline-block">Most Popular</span>}
                <h3 className="font-bold text-lg text-brand-ink">{p.plan}</h3>
                <div className="text-2xl font-bold text-brand-blue my-2">
                  {p.price}
                  {(p as any).period && <span className="text-sm font-normal text-brand-inkLight">{(p as any).period}</span>}
                </div>
                <ul className="space-y-2 mb-4">
                  {p.features.map(f => (
                    <li key={f} className="text-sm text-brand-inkMid flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-brand-blue shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup?role=employer"
                  className={p.highlight ? 'btn-primary block text-center text-sm' : 'btn-outline block text-center text-sm'}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
