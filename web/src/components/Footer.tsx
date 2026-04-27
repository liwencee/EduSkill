import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  return (
    /* 30% blue — structural footer */
    <footer className="bg-brand-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">SkillBridge</span>
              {/* 10% amber accent */}
              <span className="font-bold text-brand-amber text-lg">Nigeria</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Upskill Nigeria&apos;s Teachers. Empower Nigeria&apos;s Youth. Connect Both to Opportunity.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              {[['For Teachers', '/edupro'], ['For Youth', '/skillup'], ['OpportunityHub', '/opportunity-hub'], ['For Employers', '/employer']].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-white/70 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              {[['About Us', '/about'], ['Partnerships', '/partnerships'], ['Our Impact', '/impact'], ['Contact', '/contact']].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-white/70 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              {[['FAQ', '/faq'], ['Privacy Policy', '/privacy'], ['Terms of Use', '/terms']].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-white/70 hover:text-white transition-colors">{l}</Link></li>
              ))}
              <li>
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors">WhatsApp Support</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar — 60% cream tint on divider */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} SkillBridge Nigeria. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Available in:
            {['English','Yoruba','Igbo','Hausa','Pidgin'].map(l => (
              <span key={l} className="bg-white/10 text-white/80 px-2 py-0.5 rounded text-xs">{l}</span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  )
}
