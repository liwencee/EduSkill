import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { TrendingUp, Users, Award, Briefcase, MapPin, BookOpen } from 'lucide-react'

const STATS = [
  { n: '48,000+', l: 'Active Learners', Icon: Users, c: 'text-[#4F46E5]', bg: 'bg-indigo-50' },
  { n: '3,200+', l: 'Teachers Trained', Icon: BookOpen, c: 'text-purple-600', bg: 'bg-purple-50' },
  { n: '12,000+', l: 'Jobs Filled', Icon: Briefcase, c: 'text-green-600', bg: 'bg-green-50' },
  { n: '94%', l: 'Completion Rate', Icon: Award, c: 'text-[#F97316]', bg: 'bg-orange-50' },
  { n: '36', l: 'States Reached', Icon: MapPin, c: 'text-blue-600', bg: 'bg-blue-50' },
  { n: '₦2.4B+', l: 'Income Generated', Icon: TrendingUp, c: 'text-teal-600', bg: 'bg-teal-50' },
]

const STORIES = [
  {
    name: 'Aisha Mohammed', location: 'Kano State',
    quote: 'I completed the Fashion Design course offline on my phone. Three months later I opened my own tailoring shop and hired two apprentices.',
    course: 'Fashion Design & Business',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Chukwuemeka Eze', location: 'Enugu State',
    quote: 'The Coding Basics course landed me my first remote job. I now earn ₦180K monthly — more than I ever thought possible from Enugu.',
    course: 'Coding Basics for Beginners',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Mrs. Ngozi Adeleke', location: 'Oyo State',
    quote: 'The AI lesson planner in EduPro saves me 6 hours every week. My students\' exam scores improved by 23% this term.',
    course: 'EduPro Teacher Training',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
  },
]

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] to-[#4F46E5] text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <TrendingUp className="w-4 h-4" /> Our Impact
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6">
            Real Numbers. <span className="text-[#F97316]">Real Lives.</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Since 2023, SkillBridge Nigeria has been quietly changing lives — one skill, one certificate, one job at a time.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#EEF2FF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATS.map(({ n, l, Icon, c, bg }) => (
              <div key={l} className="bg-white border-[3px] border-indigo-100 rounded-3xl p-8 text-center shadow-[0_6px_0_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-200">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${c}`} />
                </div>
                <p className={`font-heading text-4xl font-bold ${c}`}>{n}</p>
                <p className="text-gray-500 text-base mt-2 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 border-[2px] border-orange-200 text-[#F97316] font-bold text-sm px-5 py-2 rounded-full mb-5">Impact Stories</span>
            <h2 className="font-heading text-4xl font-bold text-[#1E1B4B] mb-4">Voices from the Ground</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">The numbers above are made up of real people with real stories.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STORIES.map(s => (
              <div key={s.name} className="bg-[#F8F7FF] border-[3px] border-indigo-100 rounded-3xl p-7 hover:-translate-y-1 transition-all duration-200">
                <p className="text-gray-700 leading-relaxed mb-6 italic">&ldquo;{s.quote}&rdquo;</p>
                <div className="flex items-center gap-3 mb-4">
                  <img src={s.avatar} alt={s.name} className="w-12 h-12 rounded-2xl object-cover border-[3px] border-white shadow-md" />
                  <div>
                    <p className="font-heading font-bold text-[#1E1B4B]">{s.name}</p>
                    <p className="text-gray-500 text-sm">{s.location}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#4F46E5] bg-indigo-50 px-3 py-1.5 rounded-full">{s.course}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
