import React, { useEffect, useRef } from 'react'
import ThreeHero from '../hooks/useThreeHero'
import useScrollFadeOut from '../hooks/useScrollFadeOut'

function Hero({ openModal }) {
  const containerRef = useRef(null)
  const threeRef = useRef(null)
  const { ref: fadeRef, opacity } = useScrollFadeOut()

  useEffect(() => {
    if (containerRef.current && !threeRef.current) {
      threeRef.current = new ThreeHero(containerRef.current)
    }
    return () => {
      if (threeRef.current) {
        threeRef.current.cleanup()
        threeRef.current = null
      }
    }
  }, [])

  return (
    <section className="hero" id="hero" ref={fadeRef} style={{ opacity }}>
      <div ref={containerRef} className="hero-3d-container"></div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-eyebrow">Immersive 3D by | TeamExplore X | </p>
          <h1>
            Explore Digital<br />
            <span className="gradient-text">Universes</span><br />
            With Immersive 3D
          </h1>
          <p className="hero-sub">
            Create stunning 3D walkarounds and interactive campus experiences.
            Built with cutting-edge Three.js technology.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => openModal('demo')}>
              Launch Campus Explorer
            </button>
            <button className="btn btn-secondary" onClick={() => openModal('video')}>
              Watch Demo Video
            </button>
          </div>
        </div>
        <div className="hero-scroll">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Hero
