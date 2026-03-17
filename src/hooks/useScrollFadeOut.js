import { useState, useEffect, useRef } from 'react'

/**
 * Fade-out effect: element becomes transparent as it scrolls UP and exits viewport
 * Used for creative scroll-away animations
 */
export default function useScrollFadeOut() {
  const ref = useRef(null)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId = null

    const tick = () => {
      const rect = el.getBoundingClientRect()
      const winH = window.innerHeight
      
      // When element top is above viewport (scrolling up past view)
      // Fade from 1 → 0 as it exits upward
      if (rect.bottom < winH * 0.3) {
        const fadeStart = winH * 0.3
        const fadeEnd   = -rect.height
        const traveled  = fadeStart - rect.bottom
        const distance  = fadeStart - fadeEnd
        const fade      = Math.max(0, Math.min(1, 1 - (traveled / distance)))
        setOpacity(fade)
      } else {
        setOpacity(1)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  return { ref, opacity }
}
