import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
  Briefcase, Users, ArrowRight, PlusCircle, TrendingUp,
  CheckCircle, Clock, MapPin, ChevronRight, BarChart2, Star
} from 'lucide-react'

const SAMPLE_CANDIDATES = [
  { name: 'Tunde Adeyemi', skill: 'Digital Marketing',  location: 'Lagos', cert: 'Certified', score: 95 },
  { name: 'Ngozi Obi',     skill: 'Fashion Design',     location: 'Enugu', cert: 'Certified', score: 88 },
  { name: 'Musa Ibrahim',  skill: 'Solar Installation', location: 'Kano',  cert: 'Certified', score: 91 },
]

export default function EmployerDashboard() {
  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1E1B4B] via-[#4F46E5] to-[#6366F1] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Briefcase className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm font-medium mb-1">OpportunityHub — Employer Portal 🏢</p>
            <h1 className="text-2xl font-bold mb-1">Employer Dashboard</h1>
            <p className="text-white/75 text-sm">Connect with Nigeria's next generation of skilled, certified workers.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/employer/post-job"
                className="inline-flex items-center gap-2 bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
                <PlusCircle className="w-4 h-4" /> Post a Job
              </Link>
              <Link href="/opportunity-hub"
                className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                Browse Candidates
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Listings',    value: 0, icon: Briefcase,   bg: 'bg-indigo-50', color: 'text-[#4F46E5]' },
            { label: 'Total Applications', value: 0, icon: Users,       bg: 'bg-orange-50', color: 'text-[#F97316]' },
            { label: 'Hired Candidates',   value: 0, icon: CheckCircle, bg: 'bg-green-50',  color: 'text-green-600'  },
            { label: 'Saved Profiles',     value: 0, icon: Star,        bg: 'bg-yellow-50', color: 'text-yellow-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-indigo-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E1B4B]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Active Job Listings placeholder */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">Active Job Listings</h2>
                <Link href="/employer/post-job"
                  className="text-sm font-bold text-[#4F46E5] hover:underline flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" /> Post New
                </Link>
              </div>
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-8 h-8 text-[#4F46E5] opacity-50" />
                </div>
                <p className="font-semibold text-[#1E1B4B] mb-1">No listings yet</p>
                <p className="text-sm text-gray-500 mb-4">Post your first job and find certified graduates</p>
                <Link href="/employer/post-job"
                  className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Post a Job — Free
                </Link>
              </div>
            </div>

            {/* Top Candidates */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E1B4B] text-lg">Top Certified Candidates</h2>
                <Link href="/opportunity-hub" className="text-sm text-[#4F46E5] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {SAMPLE_CANDIDATES.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1E1B4B] text-sm">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{c.skill}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{c.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full block mb-1">{c.cert}</span>
                      <span className="text-xs font-bold text-[#4F46E5]">{c.score}% match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1E1B4B] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/employer/post-job',    icon: PlusCircle, label: 'Post a Job',          bg: 'bg-orange-50', color: 'text-[#F97316]' },
                  { href: '/opportunity-hub',      icon: Users,      label: 'Browse Candidates',   bg: 'bg-indigo-50', color: 'text-[#4F46E5]' },
                  { href: '/opportunity-hub/jobs', icon: Briefcase,  label: 'Manage Listings',     bg: 'bg-green-50',  color: 'text-green-600'  },
                  { href: '/opportunity-hub',      icon: BarChart2,  label: 'Hiring Analytics',    bg: 'bg-purple-50', color: 'text-purple-600' },
                  { href: '/contact',              icon: TrendingUp, label: 'Partner with Us',     bg: 'bg-yellow-50', color: 'text-yellow-600' },
                ].map(l => (
                  <Link key={l.href + l.label} href={l.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${l.bg}`}>
                      <l.icon className={`w-4 h-4 ${l.color}`} />
                    </div>
                    <span className="text-sm font-medium text-[#1E1B4B]">{l.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1E1B4B] mb-4">Platform Talent Pool</h2>
              <div className="space-y-3">
                {[
                  { label: 'Certified Graduates', value: '8,400+',    color: 'text-[#4F46E5]' },
                  { label: 'Skills Available',    value: '50+',       color: 'text-[#F97316]' },
                  { label: 'Active Job Seekers',  value: '3,200+',    color: 'text-green-600' },
                  { label: 'Avg. Hire Time',      value: '< 2 weeks', color: 'text-purple-600' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.label}</span>
                    <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1E1B4B] to-[#4F46E5] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-orange-300" />
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wide">Employer Tip</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Feature your listing for 10x more visibility. Reach 3,200+ active certified job seekers. From ₦10,000/week. 🎯
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
