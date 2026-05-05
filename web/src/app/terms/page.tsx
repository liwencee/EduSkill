import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using SkillBridge Nigeria ("the Platform"), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use the Platform. These terms apply to all users, including learners, teachers, employers, and visitors.`,
  },
  {
    title: '2. Eligibility',
    content: `You must be at least 15 years old to use the Platform. Users under 18 must have consent from a parent or guardian. By using the Platform, you confirm that you meet this requirement.`,
  },
  {
    title: '3. Account Responsibilities',
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information during registration. You may not share your account with others or use another person's account. Notify us immediately at support@skillbridge.ng if you suspect unauthorised access.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to: upload or share content that is illegal, harmful, defamatory, or violates the rights of others; attempt to gain unauthorised access to any part of the Platform; use automated tools to scrape, crawl, or download course content in bulk; impersonate another person or organisation; resell or redistribute paid course content without written permission; or interfere with the Platform's security or performance.`,
  },
  {
    title: '5. Course Content & Intellectual Property',
    content: `All course content, including videos, assessments, lesson plans, and AI-generated materials, is owned by SkillBridge Nigeria or its content partners and is protected by Nigerian and international copyright law. You are granted a non-exclusive, non-transferable licence to access purchased content for personal, non-commercial educational use only.`,
  },
  {
    title: '6. Certificates',
    content: `Certificates issued by SkillBridge Nigeria are awarded upon genuine completion of course requirements including assessments. Any attempt to fraudulently obtain a certificate — including cheating on assessments, sharing answers, or impersonating another user — will result in immediate account termination and invalidation of all issued certificates.`,
  },
  {
    title: '7. Payments & Refunds',
    content: `All payments are processed in Nigerian Naira (₦) via Paystack. Prices include applicable taxes. A full refund is available within 7 days of purchase if less than 30% of the course has been completed. After this window, we reserve the right to decline refund requests, except where required by Nigerian consumer protection law.`,
  },
  {
    title: '8. OpportunityHub (Job Board)',
    content: `Employers posting on OpportunityHub must be legitimate registered Nigerian businesses. Job listings must not be discriminatory, illegal, or misleading. SkillBridge Nigeria is not responsible for employment outcomes, salary disputes, or conditions of any employment arranged through the Platform. We do not guarantee job placement.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the fullest extent permitted by Nigerian law, SkillBridge Nigeria is not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability to you for any claim shall not exceed the amount you paid to us in the 12 months preceding the claim.`,
  },
  {
    title: '10. Termination',
    content: `We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time from your account settings. On termination, your access to paid courses will cease, but certificates already earned remain valid and verifiable.`,
  },
  {
    title: '11. Governing Law',
    content: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved first through good-faith negotiation, and if unresolved, through arbitration in Lagos, Nigeria, in accordance with the Arbitration and Conciliation Act.`,
  },
  {
    title: '12. Changes to These Terms',
    content: `We may update these Terms at any time. We will notify you by email and in-app notification at least 14 days before changes take effect. Continued use of the Platform after that date constitutes acceptance. If you do not agree to the updated Terms, you must stop using the Platform.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] to-[#4F46E5] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FileText className="w-4 h-4" /> Legal
          </div>
          <h1 className="font-heading text-5xl font-bold mb-4">Terms of <span className="text-[#F97316]">Use</span></h1>
          <p className="text-white/70 text-base">Last updated: 1 May 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-[3px] border-indigo-100 rounded-3xl p-8 md:p-12 shadow-[0_6px_0_rgba(79,70,229,0.08)] space-y-8">
            <p className="text-gray-600 leading-relaxed text-base border-l-4 border-[#F97316] pl-5 bg-orange-50 py-3 pr-3 rounded-r-xl">
              Please read these Terms carefully before using SkillBridge Nigeria. By creating an account, you agree to these Terms in full.
            </p>
            {SECTIONS.map(s => (
              <div key={s.title}>
                <h2 className="font-heading text-xl font-bold text-[#1E1B4B] mb-3">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
