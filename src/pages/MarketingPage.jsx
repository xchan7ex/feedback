import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── Marketing stylesheet imports ─── */
import '../styles/marketing-shared.css'
import '../styles/marketing-navigation.css'
import '../styles/marketing-scrolltotop.css'
import '../styles/marketing-hero.css'
import '../styles/marketing-about.css'
import '../styles/marketing-features.css'
import '../styles/marketing-techrail.css'
import '../styles/marketing-pricing.css'
import '../styles/marketing-footercta.css'
import '../styles/marketing-team.css'
import '../styles/marketing-footer.css'
import '../styles/marketing-modals.css'

import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import AboutUs from '../components/AboutUs'
import Features from '../components/Features'
import TechRail from '../components/TechRail'
import Pricing from '../components/Pricing'
import Team from '../components/Team'
import FooterCTA from '../components/FooterCTA'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'
import VideoModal from '../components/modals/VideoModal'
import ContactModal from '../components/modals/ContactModal'
import PricingModal from '../components/modals/PricingModal'
import AuthModal from '../components/modals/AuthModal'

function MarketingPage() {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null)
  const [pricingData, setPricingData] = useState({ planName: '', planPrice: '' })

  const openModal = (modalName) => {
    // If "demo" is clicked, navigate to game instead of opening modal
    if (modalName === 'demo') {
      navigate('/game')
      return
    }
    setActiveModal(modalName)
    document.body.style.overflow = 'hidden'
  }

  const openPricingModal = (planName, planPrice) => {
    setPricingData({ planName, planPrice })
    setActiveModal('pricing')
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setActiveModal(null)
    document.body.style.overflow = 'auto'
  }

  return (
    <>
      <Navigation openModal={openModal} />
      <Hero openModal={openModal} />
      <AboutUs />
      <Features />
      <TechRail />
      <Pricing openPricingModal={openPricingModal} />
      <FooterCTA openModal={openModal} />
      <Team />
      <Footer />
      <ScrollToTop />
      
      {activeModal === 'video' && <VideoModal closeModal={closeModal} />}
      {activeModal === 'contact' && <ContactModal closeModal={closeModal} />}
      {activeModal === 'pricing' && <PricingModal closeModal={closeModal} planName={pricingData.planName} planPrice={pricingData.planPrice} />}
      {activeModal === 'auth' && <AuthModal closeModal={closeModal} />}
    </>
  )
}

export default MarketingPage
