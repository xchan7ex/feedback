import React from 'react'
import useScrollReveal, { useScrollProgress } from '../hooks/useScrollRevealBidirectional'

function AnimatedStat({ target, label, suffix = '' }) {
  // target can be a number or a special string like "3D", "∞", "24/7"
  const isNumeric = !isNaN(Number(target))
  const numVal    = isNumeric ? Number(target) : 0

  const { ref, progress } = useScrollProgress()
  const current = Math.round(progress * numVal)
  const display = isNumeric ? `${current}${suffix}` : target

  return (
    <div ref={ref} className="stat-card">
      <span className="stat-number">{display}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function AboutUs() {
  const { ref: textRef, visible: textVis }   = useScrollReveal()
  const { ref: statsRef, visible: statsVis } = useScrollReveal()

  return (
    <section className="about-us" id="about">
      <div className="section-container">
        <div className="about-row">
          <div ref={textRef} className={`about-text reveal-left ${textVis ? 'visible' : ''}`}>
            <p className="section-eyebrow">About Us</p>
            <h2>Revolutionizing<br />Digital Exploration</h2>
            <p>
              Universe3D is an innovative project developed by TeamExploreX that transforms how people interact
              with digital spaces. Our mission is to create immersive 3D experiences that make campus exploration,
              building navigation, and spatial understanding more engaging and intuitive.
            </p>
            <p>
              Built with cutting-edge technologies like Three.js and React, Universe3D combines stunning visuals
              with practical functionality. Whether you're a university, a business, or an organisation seeking
              innovative onboarding solutions — we bring your vision to life.
            </p>
          </div>

          <div ref={statsRef} className={`about-stats reveal-right ${statsVis ? 'visible' : ''}`}>
            <AnimatedStat target="6"   suffix="+" label="Co-Founders"          />
            <AnimatedStat target="3D"        label="Real-time Rendering"  />
            <AnimatedStat target="∞"         label="Possibilities"        />
            <AnimatedStat target="24/7"      label="Support"              />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
