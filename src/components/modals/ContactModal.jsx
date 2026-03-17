import React, { useState, useEffect } from 'react'

function ContactModal({ closeModal }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeModal])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('📧 Contact Form Submitted:', formData)
    setSubmitStatus('success')
    setFormData({ name: '', email: '', phone: '', interest: '', message: '' })
    setTimeout(() => setSubmitStatus(''), 3000)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal-content">
        <button className="modal-close" onClick={closeModal}>×</button>
        <div className="modal-header">
          <h2>Get in Touch</h2>
          <p>Our team will respond within 24 hours</p>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input type="text"  name="name"    className="modal-input"  placeholder="Full Name"         value={formData.name}     onChange={handleChange} required />
          <input type="email" name="email"   className="modal-input"  placeholder="Email Address"     value={formData.email}    onChange={handleChange} required />
          <input type="tel"   name="phone"   className="modal-input"  placeholder="Phone Number"      value={formData.phone}    onChange={handleChange} />
          <select name="interest" className="modal-input modal-select" value={formData.interest} onChange={handleChange} required>
            <option value="">Select Your Interest</option>
            <option value="demo">Interactive Demo</option>
            <option value="starter">Starter Plan</option>
            <option value="professional">Professional Plan</option>
            <option value="enterprise">Enterprise Plan</option>
            <option value="custom">Custom Solution</option>
          </select>
          <textarea name="message" className="modal-input modal-textarea" placeholder="Tell us about your project..." rows="4" value={formData.message} onChange={handleChange}></textarea>
          <button
            type="submit"
            className="modal-submit"
            style={submitStatus === 'success' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
          >
            {submitStatus === 'success' ? '✓ Message Sent!' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ContactModal
