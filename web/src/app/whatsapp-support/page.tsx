import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { MessageCircle, Phone, Clock, CheckCircle, ArrowRight, BookOpen } from 'lucide-react'

const SUPPORT_TOPICS = [
  { emoji: '📚', label: 'Course Enrolment Help' },
  { emoji: '🎓', label: 'Certificate Issues' },
  { emoji: '💼', label: 'Job Application Support' },
  { emoji: '💳', label: 'Payment & Billing' },
  { emoji: '🔐', label: 'Account & Login Issues' },
  { emoji: '📱', label: 'App / Platform Feedback' },
]

const WHATSAPP_NUMBER = '+2348000000000' // Replace with your actual support number
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hello SkillBridge Support! I need help with my account.'
)
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${WHATSAPP_MESSAGE}`

export default function WhatsAppSupportPage() {
  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <MessageCircle className="w-10 h-10 text-green-600 fill-green-100" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E1B4B] mb-3">WhatsApp Support</h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            Chat with our support team directly on WhatsApp. Fast, friendly, and in your language — English or Pidgin.
          </p>
        </div>

        {/* Hours & Contact */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-[#1E1B4B] text-sm">Support Number</p>
                <p className="text-gray-600 text-sm mt-0.5">{WHATSAPP_NUMBER}</p>
                <p className="text-xs text-gray-400 mt-1">WhatsApp messages only</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <p className="font-bold text-[#1E1B4B] text-sm">Support Hours</p>
                <p className="text-gray-600 text-sm mt-0.5">Mon – Sat: 8am – 8pm</p>
                <p className="text-xs text-gray-400 mt-1">WAT (Nigeria time)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-[#1E1B4B] mb-4">We can help you with</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUPPORT_TOPICS.map(t => (
              <div key={t.label}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#EEF2FF] border border-indigo-100">
                <span className="text-xl">{t.emoji}</span>
                <span className="text-xs font-semibold text-[#1E1B4B]">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promises */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-[#1E1B4B] mb-4">Our support promise</h2>
          <div className="space-y-3">
            {[
              'Average response time under 2 hours during business hours',
              'Bilingual support — English and Nigerian Pidgin',
              'No bots — real humans who care about your learning',
              'Screenshots & documents accepted for faster resolution',
            ].map(p => (
              <div key={p} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold px-8 py-4 rounded-2xl hover:bg-green-500 transition-colors text-base shadow-lg shadow-green-200">
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp Now
            <ArrowRight className="w-5 h-5" />
          </a>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Link href="/contact"
              className="text-sm text-[#4F46E5] hover:underline inline-flex items-center gap-1">
              Email Support
            </Link>
            <Link href="/faq"
              className="text-sm text-[#4F46E5] hover:underline inline-flex items-center gap-1">
              View FAQs
            </Link>
            <Link href="/skillup/courses"
              className="text-sm text-[#4F46E5] hover:underline inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Browse Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
