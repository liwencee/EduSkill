import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Wand2, BookOpen, Users, Award, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  { icon: Wand2,    title: 'AI Lesson Planner',  desc: 'Input topic + grade level → get a full NERDC-aligned lesson plan in 10 seconds. Save hours every week.',  href: '/edupro/lesson-planner', cta: 'Try the AI Planner' },
  { icon: BookOpen, title: 'CPD Short Courses',   desc: '2–6 week self-paced courses: Digital Classroom, Vocational Teaching, Inclusive Education, and more.',       href: '/edupro/courses',        cta: 'Browse CPD Courses' },
  { icon: Users,    title: 'Teacher Community',   desc: 'Subject-specific forums, mentorship matching, and expert Q&A. Connect with teachers across Nigeria.',         href: '/edupro/community',      cta: 'Join the Community' },
  { icon: Award,    title: 'CPD Certificates',    desc: 'Earn blockchain-verifiable CPD certificates for every course. Build your digital teaching portfolio.',         href: '/edupro/certificates',   cta: 'View Certificates' },
]

export default function EduProPage() {
  return (
    <>
      <Navbar />

      {/* Hero — 30% blue */}
      <section className="bg-brand-blue text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/80 px-4 py-2 rounded-full text-sm mb-6">
            <BookOpen className="w-4 h-4" /> For Teachers &amp; Vocational Instructors
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">EduPro</h1>
          <p className="text-xl text-white/80 mb-6 leading-relaxed max-w-2xl">
            Professional development courses, AI lesson planning, and a peer community — built for Nigeria&apos;s teachers.
            Spend less time preparing and more time teaching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 10% amber CTA */}
            <Link href="/auth/signup?role=teacher" className="btn-primary inline-flex items-center gap-2 text-lg">
              Join as a Teacher <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/edupro/lesson-planner"
              className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-lg">
              Try AI Lesson Planner
            </Link>
          </div>
        </div>
      </section>

      {/* Features — 60% cream bg, white cards */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Everything a Nigerian Teacher Needs</h2>
            <p className="section-subtitle mx-auto">One subscription covers all four tools.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6">
                {/* blue icon bg */}
                <div className="w-12 h-12 bg-brand-blueLight rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="font-bold text-lg text-brand-ink mb-2">{f.title}</h3>
                <p className="text-brand-inkMid text-sm leading-relaxed mb-4">{f.desc}</p>
                <Link href={f.href} className="text-brand-blue font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  {f.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — 60% cream */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-3">Simple, Affordable Pricing</h2>
          <p className="section-subtitle mx-auto mb-10">Less than the cost of one textbook per month.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { plan: 'Individual Teacher',   price: '₦2,000–4,000', period: '/month', features: ['All CPD courses','AI Lesson Planner','Teacher community','Digital CPD certificates','Cancel anytime'], highlight: false },
              { plan: 'Institutional License', price: '₦50K–500K',   period: '/term',  features: ['Bulk teacher seats','Admin dashboard','Impact reporting for donors','Custom onboarding','Priority support'], highlight: true },
            ].map(p => (
              <div key={p.plan} className={`card p-8 text-left ${p.highlight ? 'border-brand-amber ring-2 ring-brand-amber/20' : ''}`}>
                {/* 10% amber highlight badge */}
                {p.highlight && <span className="badge badge-amber mb-3">Best for NGOs &amp; Schools</span>}
                <h3 className="font-bold text-xl text-brand-ink mb-1">{p.plan}</h3>
                <div className="text-3xl font-bold text-brand-blue mb-4">
                  {p.price}<span className="text-lg font-normal text-brand-inkLight">{p.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-brand-inkMid">
                      <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup?role=teacher"
                  className={p.highlight ? 'btn-primary block text-center' : 'btn-outline block text-center'}>
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
