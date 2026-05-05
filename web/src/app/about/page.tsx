import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Users, Target, Heart, BookOpen, Award, Globe } from 'lucide-react'

const TEAM = [
  { name: 'Olalekan Adeyemi', role: 'CEO & Co-founder', avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face' },
  { name: 'Adaeze Nwosu', role: 'CTO & Co-founder', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face' },
  { name: 'Fatima Yusuf', role: 'Head of Curriculum', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face' },
  { name: 'Emeka Obi', role: 'Head of Partnerships', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
]

const VALUES = [
  { Icon: Target, title: 'Purposeful Learning', desc: 'Every course is designed with one goal: real employment and income for Nigerians.', color: 'text-[#4F46E5]', bg: 'bg-indigo-50' },
  { Icon: Heart, title: 'Radical Inclusion', desc: 'Works on 2G, in 5 languages, on any ₦15K Android phone. No Nigerian left behind.', color: 'text-[#F97316]', bg: 'bg-orange-50' },
  { Icon: Award, title: 'Trusted Credentials', desc: 'Our certificates are recognised by 200+ employers across Nigeria and West Africa.', color: 'text-green-600', bg: 'bg-green-50' },
  { Icon: Globe, title: 'Community First', desc: 'Built with Nigerian teachers, youth, and employers — not just for them, but by them.', color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#4F46E5] via-[#5553E8] to-[#6366F1] text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <BookOpen className="w-4 h-4" /> Our Story
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight">
            We Believe in a <span className="text-[#F97316]">Skilled Nigeria</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            SkillBridge Nigeria was founded in 2023 with a single mission: close the skills gap between Nigeria&apos;s 20 million unemployed youth and the opportunities that await them.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-white border-[2px] border-indigo-200 text-[#4F46E5] font-bold text-sm px-5 py-2 rounded-full mb-5">Our Mission</span>
              <h2 className="font-heading text-4xl font-bold text-[#1E1B4B] mb-6">Upskill Teachers. Empower Youth. Connect Both to Opportunity.</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Nigeria has the largest youth population in Africa. Yet millions lack the practical skills needed to find work or start a business. We built SkillBridge to change that — one course, one certificate, one job at a time.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We partner with state governments, NGOs, and forward-thinking employers to ensure our platform reflects the real needs of the Nigerian economy — not a copy-pasted Western curriculum.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '48K+', l: 'Active Learners', c: 'text-[#4F46E5]' },
                { n: '3.2K', l: 'Teachers Trained', c: 'text-purple-600' },
                { n: '12K+', l: 'Jobs Filled', c: 'text-green-600' },
                { n: '36', l: 'States Reached', c: 'text-[#F97316]' },
              ].map(s => (
                <div key={s.l} className="bg-white border-[3px] border-indigo-100 rounded-3xl p-6 text-center shadow-[0_4px_0_rgba(79,70,229,0.1)]">
                  <p className={`font-heading text-4xl font-bold ${s.c}`}>{s.n}</p>
                  <p className="text-gray-500 text-sm mt-1 font-medium">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-bold text-[#1E1B4B] mb-4">What We Stand For</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">The values that drive every decision we make at SkillBridge Nigeria.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-[#F8F7FF] border-[3px] border-indigo-100 rounded-3xl p-6 hover:-translate-y-1 transition-all duration-200">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-heading font-bold text-[#1E1B4B] text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-bold text-[#1E1B4B] mb-4">Meet the Team</h2>
            <p className="text-gray-500 text-lg">Nigerians building for Nigerians.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white border-[3px] border-indigo-100 rounded-3xl p-6 text-center shadow-[0_4px_0_rgba(79,70,229,0.1)] hover:-translate-y-1 transition-all duration-200">
                <img src={m.avatar} alt={m.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border-[3px] border-indigo-100" />
                <p className="font-heading font-bold text-[#1E1B4B] text-base">{m.name}</p>
                <p className="text-[#4F46E5] text-sm font-medium mt-1">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
