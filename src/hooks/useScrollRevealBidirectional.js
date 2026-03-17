import { useState, useEffect, useRef } from 'react'

/**
 * Bidirectional scroll reveal — fades in when scrolling down, fades out when scrolling up.
 * Animations persist throughout the page lifecycle, reactivating each time elements enter/exit viewport.
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const observerRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Create observer that continuously tracks visibility
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Set visible based on intersection status
        setVisible(entry.isIntersecting)
      },
      { 
        threshold: 0.15, 
        rootMargin: '0px 0px -80px 0px', 
        ...options 
      }
    )

    observerRef.current.observe(el)
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, []) // Only set up once, but observer continuously monitors

  return { ref, visible }
}

/**
 * Continuous progress ratio (0 → 1) as element scrolls into view.
 * Useful for animating counters while the element is entering the viewport.
 * Now also tracks reverse direction.
 */
export function useScrollProgress() {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId = null

    const tick = () => {
      const rect  = el.getBoundingClientRect()
      const winH  = window.innerHeight
      const start = winH
      const end   = winH * 0.4
      const p     = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))
      setProgress(p)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => { 
      if (rafId) cancelAnimationFrame(rafId) 
    }
  }, [])

  return { ref, progress }
}
