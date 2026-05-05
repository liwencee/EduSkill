import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Handshake, Building2, GraduationCap, ArrowRight, CheckCircle, Globe } from 'lucide-react'

const PARTNER_TYPES = [
  {
    Icon: Building2, title: 'Corporate Partners',
    desc: 'Access a pipeline of certified, job-ready graduates. Co-brand courses, sponsor scholarships, or integrate our API into your HR workflow.',
    benefits: ['Priority talent pipeline', 'Co-branded certificates', 'CSR reporting dashboard', 'Custom skill assessments'],
    color: 'text-[#4F46E5]', bg: 'bg-indigo-50', border: 'border-indigo-200',
  },
  {
    Icon: GraduationCap, title: 'Education Partners',
    desc: 'Schools, universities, and training institutes can white-label our platform or integrate our courses into their existing curriculum.',
    benefits: ['White-label LMS access', 'Curriculum co-development', 'Student progress API', 'Joint certification'],
    color: 'text-[#F97316]', bg: 'bg-orange-50', border: 'border-orange-200',
  },
  {
    Icon: Globe, title: 'Government & NGO Partners',
    desc: 'State governments and NGOs can deploy SkillBridge at scale — with offline support, local language content, and full impact reporting.',
    benefits: ['Multi-state deployment', 'Offline-first delivery', 'Impact & reporting', 'Custom content in local languages'],
    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
  },
]

const CURRENT_PARTNERS = [
  'Lagos State Ministry of Education', 'Kano State Youth Board', 'Access Bank Foundation',
  'Tony Elumelu Foundation', 'NITDA', 'British Council Nigeria',
]

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#4F46E5] via-[#5553E8] to-[#6366F1] text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Handshake className="w-4 h-4" /> Partner With Us
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Let&apos;s Build a <span className="text-[#F97316]">Skilled Nigeria</span> Together
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            We partner with corporates, governments, NGOs, and educational institutions to scale practical skills training across all 36 states.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-8 py-4 rounded-2xl text-lg mt-8
            border-[3px] border-orange-800/25 shadow-[0_6px_0_rgba(154,52,18,0.5)]
            hover:shadow-[0_2px_0_rgba(154,52,18,0.5)] hover:translate-y-1 transition-all duration-150">
            Become a Partner <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-bold text-[#1E1B4B] mb-4">Partnership Models</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">We tailor every partnership to deliver real impact for your organisation and the communities you serve.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {PARTNER_TYPES.map(({ Icon, title, desc, benefits, color, bg, border }) => (
              <div key={title} className={`bg-white border-[3px] ${border} rounded-3xl p-8 shadow-[0_6px_0_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-200`}>
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#1E1B4B] mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
                <ul className="space-y-2">
                  {benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${color}`} /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-4xl font-bold text-[#1E1B4B] mb-4">Trusted by Leading Organisations</h2>
          <p className="text-gray-500 text-lg mb-12">Joining a growing network of partners committed to Nigeria&apos;s future.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CURRENT_PARTNERS.map(p => (
              <div key={p} className="bg-[#EEF2FF] border-[2px] border-indigo-100 rounded-2xl px-6 py-5 font-heading font-semibold text-[#1E1B4B] text-sm">
                {p}
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#4F46E5] text-white font-bold px-8 py-4 rounded-2xl text-lg
              border-[3px] border-indigo-800/20 shadow-[0_6px_0_rgba(79,70,229,0.3)]
              hover:shadow-[0_2px_0_rgba(79,70,229,0.3)] hover:translate-y-1 transition-all duration-150">
              Get in Touch <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
