import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Shield } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly — such as your name, email address, phone number, and chosen learning role (youth, teacher, or employer) when you register. We also collect usage data including courses started and completed, quiz results, progress percentages, and device and connection information to optimise for low-bandwidth environments. We do not sell your personal data to third parties.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to: provide and personalise your learning experience; issue and verify certificates of completion; match job-seekers to relevant opportunities on OpportunityHub; improve our platform based on aggregate usage analytics; send important account and course notifications (you may opt out of marketing emails at any time); and comply with applicable Nigerian and international data protection laws.`,
  },
  {
    title: '3. Data Storage & Security',
    content: `Your data is stored on secure servers provided by Supabase, with encryption at rest and in transit. We implement industry-standard security measures including row-level security, regular security audits, and access controls. Offline course data is stored locally on your device and is not transmitted until you reconnect.`,
  },
  {
    title: '4. Sharing Your Information',
    content: `We may share your information with: employers on OpportunityHub only if you explicitly apply for a role or make your profile public; government partners (e.g. state ministries) in aggregate, anonymised form for skills gap reporting; service providers (payment processors like Paystack, cloud infrastructure) strictly to deliver our services. We do not share your personal data for advertising purposes.`,
  },
  {
    title: '5. Your Rights',
    content: `Under Nigeria's NDPR (Nigeria Data Protection Regulation), you have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your account and associated data; withdraw consent for marketing communications; and lodge a complaint with NITDA (National Information Technology Development Agency). To exercise any of these rights, email privacy@skillbridge.ng.`,
  },
  {
    title: '6. Cookies',
    content: `We use essential cookies to keep you logged in and remember your preferences. We use analytics cookies (anonymised) to understand how users navigate the platform. You can disable non-essential cookies in your browser settings; this will not affect your ability to use the platform.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `SkillBridge Nigeria is designed for users aged 15 and above. Users under 18 should have parental or guardian consent before registering. We do not knowingly collect personal information from children under 13.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you by email and via an in-app notification at least 14 days before any material changes take effect. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact',
    content: `For any privacy-related questions or requests, contact our Data Protection Officer at: privacy@skillbridge.ng or write to 14 Broad Street, Lagos Island, Lagos, Nigeria.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] to-[#4F46E5] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" /> Legal
          </div>
          <h1 className="font-heading text-5xl font-bold mb-4">Privacy <span className="text-[#F97316]">Policy</span></h1>
          <p className="text-white/70 text-base">Last updated: 1 May 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-[3px] border-indigo-100 rounded-3xl p-8 md:p-12 shadow-[0_6px_0_rgba(79,70,229,0.08)] space-y-8">
            <p className="text-gray-600 leading-relaxed text-base border-l-4 border-[#4F46E5] pl-5 bg-indigo-50 py-3 pr-3 rounded-r-xl">
              At SkillBridge Nigeria, your privacy is a fundamental right — not an afterthought. This policy explains what data we collect, how we use it, and the controls you have over it.
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
