import React from 'react'
import useScrollReveal from '../hooks/useScrollRevealBidirectional'

function FeatureCard({ icon, title, description, delay }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`feature-card reveal-scale ${visible ? 'visible' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      <div className="feature-icon-wrap">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function Features() {
  const { ref: headerRef, visible: headerVis } = useScrollReveal()

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: '3D Building Maps',
      description: 'Interactive, navigable floor plans with real-time rendering powered by WebGL.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM9 20H4v-2a6 6 0 0112 0v2H9z" />
        </svg>
      ),
      title: 'Avatar Navigation',
      description: 'Customisable avatars with outfit validation and dress-code demonstrations.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Location Search',
      description: 'Instant search with auto-suggest and intelligent wayfinding to any room.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Gamified Activities',
      description: 'Quizzes, mini-games, and interactive onboarding designed to boost engagement.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 8.048M12 4.354L7.325 8.677a4 4 0 000 5.646L12 19M12 4.354l4.675 4.323a4 4 0 010 5.646L12 19" />
        </svg>
      ),
      title: 'Staff Directory',
      description: 'Integrated hierarchy mapping and department-level organisation at a glance.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Admin Controls',
      description: 'Manage staff roles, office information, and access permissions with ease.'
    }
  ]

  return (
    <section className="features" id="features">
      <div className="section-container">
        <div ref={headerRef} className={`section-header reveal-up ${headerVis ? 'visible' : ''}`}>
          <p className="section-eyebrow">What We Offer</p>
          <h2>Powerful Features</h2>
          <p className="section-sub">Everything you need for immersive campus exploration</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
