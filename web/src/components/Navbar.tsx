'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, BookOpen } from 'lucide-react'

const navLinks = [
  { href: '/edupro',          label: 'For Teachers' },
  { href: '/skillup',         label: 'For Youth' },
  { href: '/opportunity-hub', label: 'Jobs' },
  { href: '/employer',        label: 'Employers' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#4F46E5] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-white text-xl">SkillBridge</span>
            <span className="font-heading font-bold text-[#F97316] text-xl">Nigeria</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login"
              className="text-white/80 hover:text-white font-medium text-sm transition-colors cursor-pointer">
              Log in
            </Link>
            <Link href="/auth/signup"
              className="bg-[#F97316] text-white font-bold text-sm px-5 py-2.5 rounded-xl
                         border-[2px] border-orange-700/30 shadow-[0_4px_0_rgba(180,80,0,0.4)]
                         hover:shadow-[0_2px_0_rgba(180,80,0,0.4)] hover:translate-y-0.5
                         transition-all duration-150 cursor-pointer">
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu"
            className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/20 bg-[#4338CA] px-4 py-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium transition-colors cursor-pointer">
              {l.label}
            </Link>
          ))}
          <hr className="border-white/20 my-3" />
          <Link href="/auth/login" onClick={() => setOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-white/80 hover:text-white font-medium cursor-pointer">
            Log in
          </Link>
          <Link href="/auth/signup" onClick={() => setOpen(false)}
            className="block text-center bg-[#F97316] text-white font-bold py-3 px-4 rounded-xl
                       border-[2px] border-orange-700/30 shadow-[0_4px_0_rgba(180,80,0,0.4)] cursor-pointer">
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  )
}
