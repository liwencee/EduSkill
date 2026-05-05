'use client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setForm({ name: '', email: '', subject: '', message: '' })
      setSending(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl font-bold mb-4">Get in <span className="text-[#F97316]">Touch</span></h1>
          <p className="text-xl text-white/80">We&apos;d love to hear from you — whether it&apos;s a partnership, a question, or just feedback.</p>
        </div>
      </section>

      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="font-heading text-3xl font-bold text-[#1E1B4B]">Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">Reach us through any of the channels below. Our support team is based in Lagos and responds within 24 hours.</p>

              {[
                { Icon: Mail, label: 'Email', value: 'hello@skillbridge.ng', href: 'mailto:hello@skillbridge.ng' },
                { Icon: Phone, label: 'Phone', value: '+234 800 SKILL (75455)', href: 'tel:+23480075455' },
                { Icon: MessageCircle, label: 'WhatsApp', value: '+234 800 000 0000', href: 'https://wa.me/2348000000000' },
                { Icon: MapPin, label: 'Office', value: '14 Broad Street, Lagos Island, Lagos', href: '#' },
                { Icon: Clock, label: 'Hours', value: 'Mon–Fri, 8am – 6pm WAT', href: '#' },
              ].map(({ Icon, label, value, href }) => (
                <a key={label} href={href} className="flex items-start gap-4 bg-white border-[3px] border-indigo-100 rounded-2xl p-5 shadow-[0_4px_0_rgba(79,70,229,0.08)] hover:-translate-y-0.5 transition-all duration-150 group">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="font-semibold text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white border-[3px] border-indigo-100 rounded-3xl p-8 shadow-[0_8px_0_rgba(79,70,229,0.1)]">
              <h2 className="font-heading text-2xl font-bold text-[#1E1B4B] mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input name="name" required value={form.name} onChange={handleChange}
                    className="w-full border-[2px] border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4F46E5] transition-colors"
                    placeholder="Adaeze Okonkwo" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full border-[2px] border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4F46E5] transition-colors"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                  <select name="subject" required value={form.subject} onChange={handleChange}
                    className="w-full border-[2px] border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4F46E5] transition-colors">
                    <option value="">Select a topic…</option>
                    <option>Partnership Enquiry</option>
                    <option>Technical Support</option>
                    <option>Course Content</option>
                    <option>Billing</option>
                    <option>Press & Media</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                  <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                    className="w-full border-[2px] border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4F46E5] transition-colors resize-none"
                    placeholder="Tell us how we can help…" />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full bg-[#4F46E5] text-white font-bold py-4 rounded-2xl border-[3px] border-indigo-800/20 shadow-[0_6px_0_rgba(79,70,229,0.3)] hover:shadow-[0_2px_0_rgba(79,70,229,0.3)] hover:translate-y-1 transition-all duration-150 disabled:opacity-60">
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
