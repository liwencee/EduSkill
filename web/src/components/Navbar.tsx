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
    /* 30% blue — structural nav bar */
    <header className="sticky top-0 z-50 bg-brand-blue shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">SkillBridge</span>
            {/* Amber accent on "Nigeria" */}
            <span className="text-brand-amber font-bold text-lg">Nigeria</span>
          </Link>

          {/* Desktop nav links — 60% bg on hover */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="text-white/80 hover:text-white font-medium text-sm transition-colors hover:bg-white/10 px-3 py-1.5 rounded-lg">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA — 10% amber button */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login"
              className="text-white/80 hover:text-white font-medium text-sm transition-colors">
              Log in
            </Link>
            <Link href="/auth/signup"
              className="bg-brand-amber text-brand-ink font-semibold text-sm px-4 py-2 rounded-xl
                         hover:bg-brand-amberDark hover:text-white transition-colors">
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — 60% cream bg */}
      {open && (
        <div className="md:hidden border-t border-white/20 bg-brand-blueDark px-4 py-4 space-y-2">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2 px-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 font-medium">
              {l.label}
            </Link>
          ))}
          <hr className="border-white/20 my-2" />
          <Link href="/auth/login" onClick={() => setOpen(false)}
            className="block py-2 px-3 rounded-lg text-white/80 hover:text-white font-medium">
            Log in
          </Link>
          <Link href="/auth/signup" onClick={() => setOpen(false)}
            className="btn-primary block text-center text-sm py-2.5">
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  )
}
