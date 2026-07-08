'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  /** The numeric target to count up to. */
  value: number
  /** Text before the number, e.g. "₦". */
  prefix?: string
  /** Text after the number, e.g. "K+", "%", "/5". */
  suffix?: string
  /** Decimal places to show (e.g. 1 for "4.9"). */
  decimals?: number
  /** Animation duration in ms. */
  duration?: number
  className?: string
}

/**
 * Animates a number from 0 → value the first time it scrolls into view.
 * Respects prefers-reduced-motion by jumping straight to the final value.
 */
export default function CountUp({
  value, prefix = '', suffix = '', decimals = 0, duration = 1600, className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            // easeOutExpo for a snappy, satisfying finish
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            setDisplay(value * eased)
            if (t < 1) requestAnimationFrame(tick)
            else setDisplay(value)
          }
          requestAnimationFrame(tick)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.4 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  const shown = display.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return <span ref={ref} className={className}>{prefix}{shown}{suffix}</span>
}
