import React, { useState, useRef, useEffect } from 'react'

import Feedback from './Feedback'

// Building data
const BUILDINGS = [
  {
    id: 'spencer',
    name: 'Spencer Building (SP)',
    floors: 13,
    image: '/buildings/spencer.png',
    description: 'Secondary premises with tutorial rooms and offices'
  },
  {
    id: 'gp-square',
    name: 'GP Square',
    floors: 8,
    image: '/buildings/gp-square.png',
    description: 'Main academic building with lecture halls and labs'
  },
  {
    id: 'ramakrishna',
    name: 'Ramakrishna Building',
    floors: 5,
    image: '/buildings/ramakrishna.png',
    description: 'Additional facilities and student services'
  }
]

function MainMenu({ onStartGame, onExit, playerNickname, isMuted, onToggleMute }) {
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const clickSoundRef = useRef(null)
  const startSoundRef = useRef(null)

  // Initialize sound effects
  useEffect(() => {
    // Pre-load audio files
    clickSoundRef.current = new Audio('/audio/card-click.mp3')
    clickSoundRef.current.volume = 0.5
    clickSoundRef.current.load()

    startSoundRef.current = new Audio('/audio/start-game.mp3')
    startSoundRef.current.volume = 0.6
    startSoundRef.current.load()
  }, [])

  const handleBuildingSelect = (buildingId) => {
    // Play click sound
    if (clickSoundRef.current && !isMuted) {
      clickSoundRef.current.currentTime = 0
      clickSoundRef.current.play().catch(() => { })
    }
    setSelectedBuilding(buildingId)
  }

  const handleStartGame = () => {
    if (selectedBuilding) {
      // Play start game sound
      if (startSoundRef.current && !isMuted) {
        startSoundRef.current.currentTime = 0
        startSoundRef.current.play().catch(() => { })
      }
      onStartGame?.(selectedBuilding)
    }
  }

  const handleExit = () => {
    setShowFeedback(true)
  }

  const handleFeedbackComplete = () => {
    setShowFeedback(false)
    onExit?.()
  }

  return (
    <div className="main-menu">
      {/* Background */}
      <div className="mm-background">
        <div className="mm-gradient"></div>

        {/* Light rays */}
        <div className="mm-rays">
          <div className="mm-ray mm-ray-1"></div>
          <div className="mm-ray mm-ray-2"></div>
          <div className="mm-ray mm-ray-3"></div>
          <div className="mm-ray mm-ray-4"></div>
          <div className="mm-ray mm-ray-5"></div>
        </div>

        {/* Floating particles */}
        <div className="mm-particles">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="mm-particle"
              style={{
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`,
                '--size': `${Math.random() * 4 + 2}px`,
                '--duration': `${Math.random() * 4 + 3}s`,
                '--delay': `${Math.random() * 3}s`,
                '--opacity': Math.random() * 0.5 + 0.3
              }}
            />
          ))}
        </div>

        {/* Clouds */}
        <div className="mm-clouds">
          <div className="mm-cloud mm-cloud-1">
            <div className="mm-cloud-puff mm-puff-1"></div>
            <div className="mm-cloud-puff mm-puff-2"></div>
            <div className="mm-cloud-puff mm-puff-3"></div>
          </div>
          <div className="mm-cloud mm-cloud-2">
            <div className="mm-cloud-puff mm-puff-1"></div>
            <div className="mm-cloud-puff mm-puff-2"></div>
            <div className="mm-cloud-puff mm-puff-3"></div>
            <div className="mm-cloud-puff mm-puff-4"></div>
          </div>
          <div className="mm-cloud mm-cloud-3">
            <div className="mm-cloud-puff mm-puff-1"></div>
            <div className="mm-cloud-puff mm-puff-2"></div>
            <div className="mm-cloud-puff mm-puff-3"></div>
          </div>
          <div className="mm-cloud mm-cloud-4">
            <div className="mm-cloud-puff mm-puff-1"></div>
            <div className="mm-cloud-puff mm-puff-2"></div>
            <div className="mm-cloud-puff mm-puff-3"></div>
          </div>
        </div>

        {/* Background scenery - Trees */}
        <div className="mm-scenery">
          <div className="mm-tree mm-tree-left-1">
            <div className="mm-tree-canopy"></div>
            <div className="mm-tree-trunk"></div>
          </div>
          <div className="mm-tree mm-tree-left-2">
            <div className="mm-tree-canopy"></div>
            <div className="mm-tree-trunk"></div>
          </div>
          <div className="mm-tree mm-tree-right-1">
            <div className="mm-tree-canopy"></div>
            <div className="mm-tree-trunk"></div>
          </div>
          <div className="mm-tree mm-tree-right-2">
            <div className="mm-tree-canopy"></div>
            <div className="mm-tree-trunk"></div>
          </div>
        </div>

        {/* Bottom decorations */}
        <div className="mm-bottom-fade"></div>
        <div className="mm-orbs">
          <div className="mm-orb mm-orb-1"></div>
          <div className="mm-orb mm-orb-2"></div>
          <div className="mm-orb mm-orb-3"></div>
          <div className="mm-orb mm-orb-4"></div>
          <div className="mm-orb mm-orb-5"></div>
        </div>
        <div className="mm-wave"></div>
        <div className="mm-wave mm-wave-2"></div>
      </div>

      {/* Corner buttons */}
      <button
        className="mm-corner-btn mm-exit-btn"
        onClick={handleExit}
        title="Exit to Home"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      <button
        className="mm-corner-btn mm-audio-btn"
        onClick={onToggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        )}
      </button>

      {/* Main content */}
      <div className="mm-content">
        {/* Greeting */}
        <div className="mm-greeting">
          <span className="mm-greeting-hello">Hello</span>
          <span className="mm-greeting-name">{playerNickname}</span>
        </div>

        {/* Welcome title */}
        <h1 className="mm-title">Welcome to IIT University</h1>

        {/* Building cards */}
        <div className="mm-cards-container">
          {BUILDINGS.map((building, index) => (
            <div
              key={building.id}
              className={`mm-card ${index === 1 ? 'mm-card-center' : ''} ${selectedBuilding === building.id ? 'selected' : ''} ${hoveredCard === building.id ? 'hovered' : ''}`}
              onClick={() => handleBuildingSelect(building.id)}
              onMouseEnter={() => setHoveredCard(building.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ '--card-index': index }}
            >
              <div className="mm-card-glow"></div>
              <div className="mm-card-inner">
                <div className="mm-card-image">
                  <img
                    src={building.image}
                    alt={building.name}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="mm-card-image-fallback">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    </svg>
                  </div>
                </div>
                <div className="mm-card-info">
                  <h3 className="mm-card-name">{building.name}</h3>
                  <p className="mm-card-floors">{building.floors} floors</p>
                </div>
                {selectedBuilding === building.id && (
                  <div className="mm-card-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selection prompt */}
        <p className={`mm-prompt ${selectedBuilding ? 'ready' : ''}`}>
          {selectedBuilding ? 'Building selected! Ready to explore.' : 'Select a Building to Continue'}
        </p>

        {/* Start Game button */}
        <button
          className={`mm-start-btn ${selectedBuilding ? 'active' : 'disabled'}`}
          onClick={handleStartGame}
          disabled={!selectedBuilding}
        >
          <span className="mm-start-btn-glow"></span>
          <span className="mm-start-btn-text">Start Game</span>
        </button>
      </div>

      {/* Footer decoration */}
      <div className="mm-footer-star">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
        </svg>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <Feedback
          onComplete={handleFeedbackComplete}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}

export default MainMenu