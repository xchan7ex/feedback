import React from 'react'
import useScrollReveal from '../hooks/useScrollRevealBidirectional'

function PricingCard({ plan, openPricingModal, delay }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`pricing-card reveal-scale ${plan.highlighted ? 'highlighted' : ''} ${visible ? 'visible' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      {plan.highlighted && <span className="pricing-badge-tag">Most Popular</span>}
      <h3>{plan.name}</h3>
      <p className="pricing-sub">Contact our team for pricing</p>
      <ul className="pricing-features">
        {plan.features.map((f, i) => (
          <li key={i} className="pricing-feature">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="check-icon">
              <circle cx="9" cy="9" r="9" fill="#2563eb" fillOpacity="0.1" />
              <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button 
        className={`pricing-btn ${plan.highlighted ? 'pricing-btn-primary' : ''}`} 
        onClick={() => openPricingModal(plan.name, plan.price)}
      >
        {plan.price}
      </button>
    </div>
  )
}

function Pricing({ openPricingModal }) {
  const { ref: headerRef, visible: headerVis } = useScrollReveal()
  const { ref: ctaRef, visible: ctaVis }       = useScrollReveal()

  const plans = [
    {
      name: 'Starter',
      price: 'LKR 200,000',
      features: [
        'One building (up to 3 floors)',
        'GLTF/GLB model integration',
        'Basic avatar navigation',
        'Clickable info hotspots',
        'Single admin account',
        '30-day deployment support'
      ]
    },
    {
      name: 'Professional',
      price: 'LKR 450,000',
      highlighted: true,
      features: [
        'Up to 3 buildings',
        'Avatar customization',
        'Location search & routing',
        'Interactive quizzes',
        'Multiple admin roles',
        'Performance optimization',
        'Analytics & sessions'
      ]
    },
    {
      name: 'Enterprise',
      price: 'LKR 600,000',
      features: [
        'Full campus digital twin',
        'Multiplayer sessions',
        'Advanced admin CMS',
        'API & SIS integration',
        'Custom gamification',
        'Dedicated SLA',
        'White-glove onboarding'
      ]
    }
  ]

  return (
    <section className="pricing" id="pricing">
      <div className="section-container">
        <div ref={headerRef} className={`section-header reveal-up ${headerVis ? 'visible' : ''}`}>
          <p className="section-eyebrow">Pricing</p>
          <h2>Simple, Transparent Pricing</h2>
          <p className="section-sub">Choose the plan that fits your needs</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} openPricingModal={openPricingModal} delay={i * 130} />
          ))}
        </div>
        <div ref={ctaRef} className={`pricing-cta reveal-up ${ctaVis ? 'visible' : ''}`}>
          <p>Need a custom solution?</p>
          <button className="btn btn-primary" onClick={() => openPricingModal('Custom', 'Contact for quote')}>Contact Our Team →</button>
        </div>
      </div>
    </section>
  )
}

export default Pricing
