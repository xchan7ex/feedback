import React, { useState, useEffect } from 'react'

function Navigation({ openModal }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      // Check if we've scrolled past the hero section (approximately)
      setScrolled(window.scrollY > window.innerHeight * 0.7)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // Check initial position
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('nav')) setIsMenuOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="nav-container">
        <div className="nav-logo">
          <a href="#hero">Universe<span>3D</span></a>
        </div>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#pricing" className="nav-link" onClick={() => setIsMenuOpen(false)}>Pricing</a>
          <a href="#team" className="nav-link" onClick={() => setIsMenuOpen(false)}>Team</a>
          <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a>
        </div>
        <button className="nav-btn" onClick={() => openModal('auth')}>Sign In</button>
        <button className="nav-toggle" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
