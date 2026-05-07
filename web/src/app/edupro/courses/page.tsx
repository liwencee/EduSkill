import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { BookOpen, Clock, Users, ArrowRight, CheckCircle } from 'lucide-react'

const CPD_TRACKS = [
  { slug: 'digital-classroom-skills',    emoji: '🏫', title: 'Digital Classroom Skills',    weeks: 3, desc: 'Use Google Classroom, WhatsApp, and digital tools to teach effectively.' },
  { slug: 'vocational-teaching-methods', emoji: '🎓', title: 'Vocational Teaching Methods', weeks: 4, desc: 'How to teach practical skills in a TVET or vocational classroom.' },
  { slug: 'inclusive-education',         emoji: '🤝', title: 'Inclusive Education',         weeks: 3, desc: 'Teaching students with disabilities and diverse learning needs.' },
  { slug: 'entrepreneurship-education',  emoji: '🚀', title: 'Entrepreneurship Education',  weeks: 4, desc: 'Teach entrepreneurship, financial literacy, and business skills.' },
]

export default async function EduProCoursesPage() {
  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* 30% blue header */}
      <div className="bg-brand-blue text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">CPD Courses for Teachers</h1>
          <p className="text-white/80">2–6 week self-paced courses aligned to Nigerian education standards. Earn verifiable CPD certificates.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Course grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {CPD_TRACKS.map(c => (
            <Link key={c.slug} href={`/skillup/courses/${c.slug}`}
              className="bg-white rounded-2xl border border-[#E0DDD5] p-6 hover:border-brand-blue/40 hover:shadow-md transition-all group">
              {/* 60% cream emoji block */}
              <div className="w-14 h-14 bg-brand-bg rounded-xl flex items-center justify-center text-3xl mb-4">{c.emoji}</div>
              <h3 className="font-bold text-lg text-brand-ink mb-1 group-hover:text-brand-blue transition-colors">{c.title}</h3>
              <p className="text-brand-inkMid text-sm leading-relaxed mb-4">{c.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-brand-inkLight">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.weeks} weeks</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-brand-blue" />CPD Certificate</span>
                </div>
                {/* 10% amber arrow */}
                <span className="text-brand-amber font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Start →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* AI Lesson Planner promo — 30% blue card */}
        <div className="bg-brand-blue rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-bold text-xl">Try the AI Lesson Planner</h3>
            </div>
            <p className="text-white/80 text-sm">Generate a full NERDC-aligned lesson plan in 10 seconds. Save 3–5 hours every week.</p>
          </div>
          {/* 10% amber CTA */}
          <Link href="/edupro/lesson-planner" className="btn-primary shrink-0 inline-flex items-center gap-2">
            Open Lesson Planner <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
