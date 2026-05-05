'use client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react'
import { useState } from 'react'

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      { q: 'Is SkillBridge Nigeria free to use?', a: 'Yes! You can sign up and access dozens of free courses at no cost. Some premium courses and certificate programmes require payment, starting from ₦2,500.' },
      { q: 'What devices can I use?', a: 'SkillBridge works on any Android smartphone (even entry-level ₦15,000 phones), iOS, and desktop browsers. Our app is optimised for low-end devices and slow connections.' },
      { q: 'Do I need a constant internet connection?', a: 'No. Download courses on Wi-Fi and study completely offline. Your progress syncs automatically when you reconnect — perfect for areas with unreliable data.' },
      { q: 'What languages are available?', a: 'Courses are available in English, Yoruba, Igbo, Hausa, and Nigerian Pidgin. We\'re adding more local languages in 2025.' },
    ],
  },
  {
    category: 'Courses & Certificates',
    items: [
      { q: 'How long do courses take to complete?', a: 'Most courses are 2–6 weeks long, designed for 1–2 hours of study per day. You learn at your own pace with no deadlines.' },
      { q: 'Are the certificates recognised by employers?', a: 'Yes. Our certificates are recognised by 200+ Nigerian employers including Access Bank, Jumia, and dozens of state-level SMEs. Each certificate includes a verifiable QR code.' },
      { q: 'Can I retake assessments if I fail?', a: 'Absolutely. You can retake any quiz or assessment as many times as needed. We want you to truly learn the material, not just pass once.' },
      { q: 'Will my course progress be saved if I switch phones?', a: 'Yes. Your account stores all progress in the cloud. Log in on any device and pick up exactly where you left off.' },
    ],
  },
  {
    category: 'Payments & Billing',
    items: [
      { q: 'How do I pay for premium courses?', a: 'We accept Paystack (debit/credit cards), bank transfer, USSD, and mobile money. All payments are in Nigerian Naira (₦).' },
      { q: 'Can I get a refund?', a: 'Yes. If you are not satisfied within 7 days of purchasing a course and have completed less than 30% of the content, we will issue a full refund.' },
      { q: 'Are there scholarships available?', a: 'Yes! We partner with government agencies and NGOs to offer fully sponsored access. Check our Partnerships page or contact us to find out if you qualify.' },
    ],
  },
  {
    category: 'For Teachers & Employers',
    items: [
      { q: 'How does EduPro work for teachers?', a: 'EduPro gives teachers access to CPD courses, an AI-powered lesson planner, and peer communities. Schools can onboard their entire staff under one institutional account.' },
      { q: 'How do I post jobs on OpportunityHub?', a: 'Employers can register on the Employer page, verify their business, and post job listings for free. Listings are matched to certified graduates who fit the role.' },
      { q: 'Can I customise training for my company\'s workforce?', a: 'Yes. We offer custom corporate training programmes. Contact our partnerships team at partners@skillbridge.ng for a tailored proposal.' },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border-[2px] rounded-2xl transition-all duration-200 ${open ? 'border-[#4F46E5] bg-indigo-50' : 'border-gray-200 bg-white'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="font-heading font-semibold text-[#1E1B4B] text-base">{q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-[#4F46E5] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{a}</p>}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4" /> Help Centre
          </div>
          <h1 className="font-heading text-5xl font-bold mb-4">Frequently Asked <span className="text-[#F97316]">Questions</span></h1>
          <p className="text-xl text-white/80">Everything you need to know about SkillBridge Nigeria.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {FAQS.map(section => (
            <div key={section.category}>
              <h2 className="font-heading text-2xl font-bold text-[#1E1B4B] mb-5">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map(item => <FAQItem key={item.q} {...item} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <MessageCircle className="w-12 h-12 text-[#4F46E5] mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold text-[#1E1B4B] mb-3">Still Have Questions?</h2>
          <p className="text-gray-500 mb-6">Our support team replies within 24 hours — or reach us instantly on WhatsApp.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-[#4F46E5] text-white font-bold px-7 py-3.5 rounded-2xl border-[3px] border-indigo-800/20 shadow-[0_4px_0_rgba(79,70,229,0.3)] hover:translate-y-1 hover:shadow-none transition-all duration-150">
              Contact Us
            </Link>
            <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold px-7 py-3.5 rounded-2xl border-[3px] border-green-700/20 shadow-[0_4px_0_rgba(34,197,94,0.3)] hover:translate-y-1 hover:shadow-none transition-all duration-150">
              WhatsApp Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
