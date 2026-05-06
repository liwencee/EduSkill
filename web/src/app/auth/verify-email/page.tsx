import Link from 'next/link'
import { BookOpen, Mail, ArrowRight, RefreshCw } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-brand-ink text-xl">SkillBridge</span>
          <span className="font-bold text-brand-amber text-xl">Nigeria</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E0DDD5] shadow-sm p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-[#4F46E5]" />
          </div>

          <h1 className="text-2xl font-bold text-brand-ink mb-2">Check your inbox</h1>
          <p className="text-brand-inkMid text-sm mb-6 leading-relaxed">
            We&apos;ve sent a verification link to your email address. Click the link in the email to activate your account and start learning.
          </p>

          {/* Steps */}
          <div className="text-left bg-[#EEF2FF] rounded-xl p-4 mb-6 space-y-3">
            {[
              { step: '1', text: 'Open your email inbox' },
              { step: '2', text: 'Find the email from SkillBridge Nigeria' },
              { step: '3', text: 'Click "Verify my email"' },
              { step: '4', text: 'You\'ll be redirected to your dashboard' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {s.step}
                </span>
                <span className="text-sm text-[#1E1B4B]">{s.text}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-brand-inkLight mb-6">
            Didn&apos;t receive it? Check your spam folder, or{' '}
            <span className="text-[#4F46E5] font-semibold">wait a few minutes</span>.
            Emails can take up to 5 minutes to arrive.
          </p>

          <div className="space-y-3">
            <Link href="/auth/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#4F46E5] text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              Go to Login <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/signup"
              className="w-full inline-flex items-center justify-center gap-2 border border-[#E0DDD5] text-brand-inkMid font-semibold py-3 rounded-xl hover:bg-[#EEF2FF] transition-colors text-sm">
              <RefreshCw className="w-4 h-4" /> Sign up with a different email
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-brand-inkLight mt-6">
          Need help?{' '}
          <Link href="/whatsapp-support" className="text-[#4F46E5] hover:underline font-medium">
            Chat with support on WhatsApp
          </Link>
        </p>
      </div>
    </div>
  )
}
