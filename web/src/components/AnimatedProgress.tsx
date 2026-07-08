'use client'

import { useEffect, useRef, useState } from 'react'

function useAnimatedPct(target: number, duration = 1400) {
  const ref = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setPct(target)
      return
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            setPct(target * eased)
            if (t < 1) requestAnimationFrame(tick)
            else setPct(target)
          }
          requestAnimationFrame(tick)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.35 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, pct }
}

const CIRCUMFERENCE = 2 * Math.PI * 40 // r=40

export function AnimatedProgressRing({ target }: { target: number }) {
  const { ref, pct } = useAnimatedPct(target)

  return (
    <div ref={ref} className="relative shrink-0">
      <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#EBF4FF" strokeWidth="10" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#378ADD" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-bold text-[#378ADD] text-xl leading-none">{Math.round(pct)}%</span>
        <span className="text-[10px] text-gray-400 font-semibold">done</span>
      </div>
    </div>
  )
}

export function AnimatedProgressBar({ target, barColor }: { target: number; barColor: string }) {
  const { ref, pct } = useAnimatedPct(target)

  return (
    <div ref={ref} className="h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full w-full ${barColor} rounded-full relative overflow-hidden origin-left`}
        style={{ transform: `scaleX(${pct / 100})`, transition: 'transform 0.1s linear' }}
      >
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            backgroundSize: '60px 100%',
            animation: pct > 0 && pct < target ? 'shimmerSlide 1s linear infinite' : 'none',
          }}
        />
      </div>
    </div>
  )
}
