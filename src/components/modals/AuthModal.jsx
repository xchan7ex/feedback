import React, { useState, useEffect } from 'react'

function AuthModal({ closeModal }) {
  const [isSignIn, setIsSignIn] = useState(true)
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' })
  const [submitStatus, setSubmitStatus] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeModal])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!isSignIn && formData.password !== formData.confirmPassword) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus(''), 3000)
      return
    }

    console.log(isSignIn ? '🔑 Sign In:' : '📝 Sign Up:', formData)
    setSubmitStatus('success')
    setFormData({ email: '', password: '', confirmPassword: '' })
    setTimeout(() => {
      setSubmitStatus('')
      closeModal()
    }, 1500)
  }

  const handleGoogleSignIn = () => {
    console.log('🔐 Google Sign In initiated')
    setSubmitStatus('success')
    setTimeout(() => {
      setSubmitStatus('')
      closeModal()
    }, 1500)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const toggleMode = () => {
    setIsSignIn(!isSignIn)
    setFormData({ email: '', password: '', confirmPassword: '' })
    setSubmitStatus('')
  }

  return (
    <div className="modal-overlay auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal-content auth-modal-content">
        <button className="modal-close" onClick={closeModal}>×</button>
        <div className="modal-header auth-modal-header">
          <h2>{isSignIn ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isSignIn ? 'Sign in to your Universe3D account' : 'Join Universe3D today'}</p>
        </div>

        <form className="modal-form auth-form" onSubmit={handleSubmit}>
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
            type="password" 
            name="password" 
            className="modal-input" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            minLength="6"
          />
          
          {!isSignIn && (
            <input 
              type="password" 
              name="confirmPassword" 
              className="modal-input" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              minLength="6"
            />
          )}

          {submitStatus === 'error' && (
            <div className="auth-error">Passwords do not match</div>
          )}

          <button
            type="submit"
            className="modal-submit"
            style={submitStatus === 'success' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
          >
            {submitStatus === 'success' ? '✓ Success!' : (isSignIn ? 'Sign In' : 'Sign Up')}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-sign-in-btn"
            onClick={handleGoogleSignIn}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-toggle">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleMode} className="auth-toggle-btn">
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
