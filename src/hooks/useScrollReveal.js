import { useState, useEffect, useRef } from 'react'

/**
 * Basic binary reveal — visible becomes true once element enters viewport.
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -50px 0px', ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

/**
 * Continuous progress ratio (0 → 1) as element scrolls into view.
 * Useful for animating counters while the element is entering the viewport.
 */
export function useScrollProgress() {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId = null
    let done  = false

    const tick = () => {
      if (done) return
      const rect  = el.getBoundingClientRect()
      const winH  = window.innerHeight
      const start = winH
      const end   = winH * 0.4
      const p     = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))
      setProgress(p)
      if (p >= 1) { done = true; return }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  return { ref, progress }
}
