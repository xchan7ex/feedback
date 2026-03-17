import React, { useState, useEffect } from 'react'

function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [prevScrollPos, setPrevScrollPos] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      const isScrollingUp = currentScrollPos < prevScrollPos
      const isNotAtTop = currentScrollPos > 400

      // Show button when scrolling UP and not at top
      setVisible(isScrollingUp && isNotAtTop)
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [prevScrollPos])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button 
      className={`scroll-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10 15L10 5M10 5L5 10M10 5L15 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export default ScrollToTop
