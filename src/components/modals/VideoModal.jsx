import React, { useEffect } from 'react'

function VideoModal({ closeModal }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeModal])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal-content">
        <button className="modal-close" onClick={closeModal}>×</button>
        <div className="modal-header">
          <h2>Demo Video</h2>
        </div>
        <div className="demo-viewer">
          <svg className="demo-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Demo Video Player</p>
        </div>
        <p className="modal-desc">
          Watch how Universe3D transforms digital spaces with immersive 3D experiences.
        </p>
      </div>
    </div>
  )
}

export default VideoModal
