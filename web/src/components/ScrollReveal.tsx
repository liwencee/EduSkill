'use client'

import { useEffect } from 'react'

/**
 * Mounts once (e.g. in a page) and animates every element carrying the
 * `.reveal` class into view as the user scrolls. Adds a staggered delay
 * based on the element's position within its parent for a cascade effect.
 * No dependencies — pure IntersectionObserver + CSS.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (els.length === 0) return

    // If IntersectionObserver is unavailable, just show everything.
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach(el => el.classList.add('reveal-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            // Stagger siblings that share a parent for a cascade.
            const siblings = el.parentElement
              ? Array.from(el.parentElement.querySelectorAll(':scope > .reveal'))
              : []
            const idx = siblings.indexOf(el)
            el.style.transitionDelay = `${Math.min(idx, 6) * 90}ms`
            el.classList.add('reveal-visible')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
