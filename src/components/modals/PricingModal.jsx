import React, { useState, useEffect } from 'react'

function PricingModal({ closeModal, planName, planPrice }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    message: '' 
  })
  const [submitStatus, setSubmitStatus] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeModal])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
        
    try {
      const response = await fetch('https://feedback-production-6600.up.railway.app/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          message: formData.message
        }),
      });

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', phone: '', company: '', message: '' })
        setTimeout(() => setSubmitStatus(''), 3000)
      } else {
        console.error('Failed to submit pricing inquiry');
      }
    } catch (error) {
      console.error('Error submitting pricing inquiry:', error);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal-content">
        <button className="modal-close" onClick={closeModal}>×</button>
        <div className="modal-header">
          <h2>Interested in {planName}?</h2>
          <p>Fill out the form below and our team will contact you within 24 hours</p>
        </div>
        
        <div className="pricing-modal-plan-badge">
          <span className="plan-name">{planName} Plan</span>
          <span className="plan-price">{planPrice}</span>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name" 
            className="modal-input" 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            className="modal-input" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="tel" 
            name="phone" 
            className="modal-input" 
            placeholder="Phone Number" 
            value={formData.phone} 
            onChange={handleChange} 
          />
          <input 
            type="text" 
            name="company" 
            className="modal-input" 
            placeholder="Company / Organization" 
            value={formData.company} 
            onChange={handleChange} 
          />
          <textarea 
            name="message" 
            className="modal-input modal-textarea" 
            placeholder="Tell us about your project requirements..." 
            rows="4" 
            value={formData.message} 
            onChange={handleChange}
          ></textarea>
          <button
            type="submit"
            className="modal-submit"
            disabled={isSubmitting}
            style={submitStatus === 'success' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
          >
            {isSubmitting ? 'Sending...' : submitStatus === 'success' ? '✓ Inquiry Sent!' : 'Request Quote'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PricingModal
