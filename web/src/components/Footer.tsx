import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-[#1E4F8A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Image src="/Skillora.png" alt="Skillora" width={130} height={34} className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-white/55 leading-relaxed">
              Upskill Nigeria&apos;s Teachers. Empower Nigeria&apos;s Youth. Connect Both to Opportunity.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4 text-base">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[['For Teachers', '/edupro'], ['For Youth', '/skillup'], ['OpportunityHub', '/opportunity-hub'], ['For Employers', '/employer']].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-white/55 hover:text-white transition-colors duration-150 cursor-pointer">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4 text-base">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[['About Us', '/about'], ['Partnerships', '/partnerships'], ['Our Impact', '/impact'], ['Contact', '/contact']].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-white/55 hover:text-white transition-colors duration-150 cursor-pointer">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4 text-base">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {[['FAQ', '/faq'], ['Privacy Policy', '/privacy'], ['Terms of Use', '/terms']].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-white/55 hover:text-white transition-colors duration-150 cursor-pointer">{l}</Link>
                </li>
              ))}
              <li>
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
                  className="text-white/55 hover:text-white transition-colors duration-150 cursor-pointer">
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© {new Date().getFullYear()} Skillora. All rights reserved.</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-white/40">Available in:</span>
            {['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin'].map(l => (
              <span key={l} className="bg-white/8 border border-white/10 text-white/60 px-2.5 py-1 rounded-lg text-xs font-medium">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
