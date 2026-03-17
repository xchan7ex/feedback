import React, { useEffect, useRef } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'

function TechRail() {
  const railRef = useRef(null)
  const { ref: titleRef, visible: titleVis } = useScrollReveal()

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const items = Array.from(rail.querySelectorAll('.tech-item'))
    if (!items.length) return

    // duplicate for seamless loop
    for (let i = 0; i < 3; i++) {
      items.forEach(item => rail.appendChild(item.cloneNode(true)))
    }

    const pause  = () => { rail.style.animationPlayState = 'paused' }
    const resume = () => { rail.style.animationPlayState = 'running' }
    rail.addEventListener('mouseenter', pause)
    rail.addEventListener('mouseleave', resume)

    return () => {
      rail.removeEventListener('mouseenter', pause)
      rail.removeEventListener('mouseleave', resume)
    }
  }, [])

  const techItems = ['React', 'Three.js', 'GLTF / GLB', 'Blender', 'Node.js', 'WebGL', 'Tailwind CSS', 'Vite']

  return (
    <section className="tech-rail" id="tech">
      <div className="section-container">
        <div ref={titleRef} className={`tech-rail-header reveal-up ${titleVis ? 'visible' : ''}`}>
          <p className="section-eyebrow">Technology Stack</p>
          <h2>Powered by Modern Technology</h2>
        </div>
      </div>
      <div ref={railRef} className="tech-rail-track">
        {techItems.map((t, i) => (
          <div key={i} className="tech-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="#6366f1" opacity="0.7" />
            </svg>
            <span className="tech-label">{t}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TechRail
