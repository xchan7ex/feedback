import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'

// Tips that rotate during loading
const LOADING_TIPS = [
  { icon: '🎮', text: 'Use WASD or Arrow keys to navigate around the campus' },
  { icon: '🔍', text: 'Click on information markers to learn about locations' },
  { icon: '🏢', text: 'Use the elevator to quickly travel between floors' },
  { icon: '👔', text: 'Check out the dress code section to know what to wear' },
  { icon: '📍', text: 'Use the search bar to find specific rooms instantly' },
  { icon: '🎓', text: 'Take the quiz to test your campus knowledge' },
  { icon: '👥', text: 'Find staff information in the directory panel' },
  { icon: '🗺️', text: 'Press M to toggle the mini-map view' },
  { icon: '💡', text: 'Hover over buildings to see their names' },
  { icon: '🚀', text: 'Double-click to quickly teleport to a location' },
]

// Loading messages that change based on progress
const LOADING_MESSAGES = [
  'Initializing Universe 3D...',
  'Loading Campus Assets...',
  'Building 3D Environment...',
  'Setting Up Navigation...',
  'Preparing Your Experience...',
  'Almost Ready...',
  'Welcome to IIT!',
]

// Funny random nicknames
const FUNNY_NICKNAMES = [
  'CampusNinja2024', 'LostFreshman', 'CafeteriaKing', 'WiFiHunter',
  'LibraryGhost', 'ParkingLotLegend', 'LectureHallHero', 'CoffeeAddict99',
  'HomeworkDodger', 'ExamSurvivor', 'NightOwlStudent', 'GPAWarrior',
  'SnackMaster', 'ChairSpinner', 'ProcastinatorPro', 'SleepyScholar',
  'NotebookNinja', 'QuizWhiz', 'CanteenChampion', 'BackbenchBoss',
  'AttendanceAce', 'DeadlineDefier', 'MidnightCoder', 'ElevatorRacer',
]

function LoadingScreen({ onNicknameSubmit }) {
  // Screen states: 'loading' | 'nickname'
  const [screenState, setScreenState] = useState('loading')
  const [progress, setProgress] = useState(0)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [tipVisible, setTipVisible] = useState(true)
  const [characterY, setCharacterY] = useState(0)
  const [nickname, setNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  
  
  const animationRef = useRef(null)
  const tipIntervalRef = useRef(null)

  // Shuffle tips once on mount
  const shuffledTips = useMemo(() => {
    return [...LOADING_TIPS].sort(() => Math.random() - 0.5)
  }, [])


  // Simulate loading progress
  useEffect(() => {
    if (screenState !== 'loading') return

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 12 + 3 // Random increment between 3-15
        const newProgress = prev + increment
        
        if (newProgress >= 100) {
          clearInterval(interval)
          // Transition to nickname screen after a short delay
          setTimeout(() => {
            setScreenState('nickname')
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 250)

    return () => clearInterval(interval)
  }, [screenState])

  // Rotate tips every 4 seconds
  useEffect(() => {
    tipIntervalRef.current = setInterval(() => {
      setTipVisible(false)
      setTimeout(() => {
        setCurrentTipIndex(prev => (prev + 1) % shuffledTips.length)
        setTipVisible(true)
      }, 400)
    }, 4000)
    
    return () => {
      if (tipIntervalRef.current) {
        clearInterval(tipIntervalRef.current)
      }
    }
  }, [shuffledTips.length])

  // Character bobbing animation
  useEffect(() => {
    let time = 0
    const animate = () => {
      time += 0.04
      setCharacterY(Math.sin(time) * 6)
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Get loading message based on progress
  const getMessage = useCallback(() => {
    const index = Math.min(
      Math.floor((progress / 100) * LOADING_MESSAGES.length),
      LOADING_MESSAGES.length - 1
    )
    return LOADING_MESSAGES[index]
  }, [progress])

  // Generate random nickname
  const generateRandomNickname = () => {
    const randomIndex = Math.floor(Math.random() * FUNNY_NICKNAMES.length)
    setNickname(FUNNY_NICKNAMES[randomIndex])
    setNicknameError('')
  }

  // Handle nickname submission
  const handleContinue = () => {
    const trimmedNickname = nickname.trim()
    
    if (!trimmedNickname) {
      setNicknameError('Please enter a nickname to continue')
      return
    }
    if (trimmedNickname.length < 3) {
      setNicknameError('Nickname must be at least 3 characters')
      return
    }
    if (trimmedNickname.length > 20) {
      setNicknameError('Nickname must be less than 20 characters')
      return
    }
  
    
    // Submit nickname to parent
    onNicknameSubmit?.(trimmedNickname)
  }

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleContinue()
    }
  }

  const currentTip = shuffledTips[currentTipIndex]
  const displayProgress = Math.min(Math.round(progress), 100)

  return (
    <div className="loading-screen-v2">
      {/* Animated Background */}
      <div className="ls-background">
        <div className="ls-gradient"></div>
        
        {/* Floating particles */}
        <div className="ls-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="ls-particle"
              style={{
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`,
                '--size': `${2 + Math.random() * 3}px`,
                '--duration': `${4 + Math.random() * 4}s`,
                '--delay': `${Math.random() * 5}s`,
                '--opacity': 0.3 + Math.random() * 0.3,
              }}
            />
          ))}
        </div>

        {/* Light rays */}
        <div className="ls-rays">
          <div className="ls-ray ls-ray-1"></div>
          <div className="ls-ray ls-ray-2"></div>
          <div className="ls-ray ls-ray-3"></div>
        </div>
        
        {/* Clouds */}
        <div className="ls-clouds">
          <div className="ls-cloud ls-cloud-1">
            <div className="ls-cloud-puff ls-cloud-puff-1"></div>
            <div className="ls-cloud-puff ls-cloud-puff-2"></div>
            <div className="ls-cloud-puff ls-cloud-puff-3"></div>
          </div>
          <div className="ls-cloud ls-cloud-2">
            <div className="ls-cloud-puff ls-cloud-puff-1"></div>
            <div className="ls-cloud-puff ls-cloud-puff-2"></div>
            <div className="ls-cloud-puff ls-cloud-puff-3"></div>
            <div className="ls-cloud-puff ls-cloud-puff-4"></div>
          </div>
          <div className="ls-cloud ls-cloud-3">
            <div className="ls-cloud-puff ls-cloud-puff-1"></div>
            <div className="ls-cloud-puff ls-cloud-puff-2"></div>
            <div className="ls-cloud-puff ls-cloud-puff-3"></div>
          </div>
          <div className="ls-cloud ls-cloud-4">
            <div className="ls-cloud-puff ls-cloud-puff-1"></div>
            <div className="ls-cloud-puff ls-cloud-puff-2"></div>
            <div className="ls-cloud-puff ls-cloud-puff-3"></div>
            <div className="ls-cloud-puff ls-cloud-puff-4"></div>
          </div>
          <div className="ls-cloud ls-cloud-5">
            <div className="ls-cloud-puff ls-cloud-puff-1"></div>
            <div className="ls-cloud-puff ls-cloud-puff-2"></div>
            <div className="ls-cloud-puff ls-cloud-puff-3"></div>
          </div>
        </div>

        {/* Background buildings */}
        <div className="ls-buildings">
          <div className="ls-building ls-building-1"></div>
          <div className="ls-building ls-building-2"></div>
          <div className="ls-building ls-building-3"></div>
          <div className="ls-building ls-building-4"></div>
        </div>

        {/* Trees */}
        <div className="ls-trees">
          <div className="ls-tree ls-tree-1">
            <div className="ls-tree-top"></div>
            <div className="ls-tree-trunk"></div>
          </div>
          <div className="ls-tree ls-tree-2">
            <div className="ls-tree-top"></div>
            <div className="ls-tree-trunk"></div>
          </div>
          <div className="ls-tree ls-tree-3">
            <div className="ls-tree-top"></div>
            <div className="ls-tree-trunk"></div>
          </div>
          <div className="ls-tree ls-tree-4">
            <div className="ls-tree-top"></div>
            <div className="ls-tree-trunk"></div>
          </div>
        </div>
      </div>

      {/* Loading Screen Content */}
      {screenState === 'loading' && (
        <div className="ls-content">
          {/* Welcome Header */}
          <div className="ls-welcome-header">
            <h1 className="ls-welcome-title">Welcome to IIT</h1>
            <div className="ls-universe-badge">
              <span className="ls-badge-text">Universe</span>
              <span className="ls-badge-3d">3D</span>
            </div>
          </div>

          {/* Character */}
          <div 
            className="ls-character"
            style={{ transform: `translateY(${characterY}px)` }}
          >
            <div className="ls-character-shadow"></div>
            <div className="ls-character-body">
              <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="195" rx="35" ry="5" fill="rgba(0,0,0,0.1)"/>
                <rect x="65" y="70" width="25" height="40" rx="5" fill="#4A90D9"/>
                <rect x="68" y="75" width="19" height="8" rx="2" fill="#5BA0E9"/>
                <path d="M35 70 Q30 80 30 110 L30 140 Q30 145 35 145 L85 145 Q90 145 90 140 L90 110 Q90 80 85 70 Z" fill="#5BA3EC"/>
                <path d="M35 70 Q40 75 60 75 Q80 75 85 70 L85 85 Q80 90 60 90 Q40 90 35 85 Z" fill="#6BB3F5"/>
                <rect x="42" y="110" width="36" height="20" rx="3" fill="#4A93DC"/>
                <path d="M30 75 Q20 80 18 100 Q16 115 20 130" stroke="#5BA3EC" strokeWidth="18" strokeLinecap="round" fill="none"/>
                <path d="M90 75 Q95 78 93 90 L88 95" stroke="#5BA3EC" strokeWidth="18" strokeLinecap="round" fill="none"/>
                <circle cx="20" cy="130" r="8" fill="#FFD5C2"/>
                <circle cx="88" cy="95" r="8" fill="#FFD5C2"/>
                <path d="M70 75 Q72 85 75 95" stroke="#3D7DC4" strokeWidth="4" strokeLinecap="round"/>
                <rect x="38" y="143" width="18" height="45" rx="5" fill="#3D6B99"/>
                <rect x="64" y="143" width="18" height="45" rx="5" fill="#3D6B99"/>
                <ellipse cx="47" cy="190" rx="12" ry="6" fill="#2C4A6E"/>
                <ellipse cx="73" cy="190" rx="12" ry="6" fill="#2C4A6E"/>
                <ellipse cx="60" cy="45" rx="28" ry="30" fill="#FFE0D0"/>
                <path d="M32 35 Q35 15 60 12 Q85 15 88 35 Q90 45 85 50 Q80 35 60 32 Q40 35 35 50 Q30 45 32 35Z" fill="#4A7099"/>
                <path d="M40 30 Q45 25 55 28 Q50 35 40 30Z" fill="#5580AA"/>
                <ellipse cx="48" cy="45" rx="3" ry="4" fill="#2C3E50"/>
                <ellipse cx="72" cy="45" rx="3" ry="4" fill="#2C3E50"/>
                <path d="M55 55 Q60 60 65 55" stroke="#E8A090" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M43 38 Q48 36 53 38" stroke="#3D5A73" strokeWidth="2" strokeLinecap="round"/>
                <path d="M67 38 Q72 36 77 38" stroke="#3D5A73" strokeWidth="2" strokeLinecap="round"/>
                <ellipse cx="32" cy="48" rx="4" ry="6" fill="#FFD5C2"/>
                <ellipse cx="88" cy="48" rx="4" ry="6" fill="#FFD5C2"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="ls-title">Preparing Your Walkthrough Experience</h2>

          {/* Progress Bar */}
          <div className="ls-progress-container">
            <div className="ls-progress-track">
              <div 
                className="ls-progress-fill"
                style={{ width: `${displayProgress}%` }}
              >
                <div className="ls-progress-glow"></div>
                <div className="ls-progress-shine"></div>
              </div>
            </div>
          </div>

          {/* Status */}
          <p className="ls-status">{getMessage()}</p>

          {/* Tips */}
          <div className={`ls-tip ${tipVisible ? 'visible' : ''}`}>
            <span className="ls-tip-icon">{currentTip.icon}</span>
            <span className="ls-tip-text">{currentTip.text}</span>
          </div>
        </div>
      )}

      {/* Nickname Screen */}
      {screenState === 'nickname' && (
        <div className="ls-content ls-nickname-screen">
          {/* Welcome Header */}
          <div className="ls-welcome-header">
            <h1 className="ls-welcome-title">Welcome to IIT</h1>
            <div className="ls-universe-badge">
              <span className="ls-badge-text">Universe</span>
              <span className="ls-badge-3d">3D</span>
            </div>
          </div>

          {/* Smaller Character */}
          <div 
            className="ls-character ls-character-small"
            style={{ transform: `translateY(${characterY}px)` }}
          >
            <div className="ls-character-shadow"></div>
            <div className="ls-character-body">
              <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="195" rx="35" ry="5" fill="rgba(0,0,0,0.1)"/>
                <rect x="65" y="70" width="25" height="40" rx="5" fill="#4A90D9"/>
                <rect x="68" y="75" width="19" height="8" rx="2" fill="#5BA0E9"/>
                <path d="M35 70 Q30 80 30 110 L30 140 Q30 145 35 145 L85 145 Q90 145 90 140 L90 110 Q90 80 85 70 Z" fill="#5BA3EC"/>
                <path d="M35 70 Q40 75 60 75 Q80 75 85 70 L85 85 Q80 90 60 90 Q40 90 35 85 Z" fill="#6BB3F5"/>
                <rect x="42" y="110" width="36" height="20" rx="3" fill="#4A93DC"/>
                <path d="M30 75 Q20 80 18 100 Q16 115 20 130" stroke="#5BA3EC" strokeWidth="18" strokeLinecap="round" fill="none"/>
                <path d="M90 75 Q95 78 93 90 L88 95" stroke="#5BA3EC" strokeWidth="18" strokeLinecap="round" fill="none"/>
                <circle cx="20" cy="130" r="8" fill="#FFD5C2"/>
                <circle cx="88" cy="95" r="8" fill="#FFD5C2"/>
                <path d="M70 75 Q72 85 75 95" stroke="#3D7DC4" strokeWidth="4" strokeLinecap="round"/>
                <rect x="38" y="143" width="18" height="45" rx="5" fill="#3D6B99"/>
                <rect x="64" y="143" width="18" height="45" rx="5" fill="#3D6B99"/>
                <ellipse cx="47" cy="190" rx="12" ry="6" fill="#2C4A6E"/>
                <ellipse cx="73" cy="190" rx="12" ry="6" fill="#2C4A6E"/>
                <ellipse cx="60" cy="45" rx="28" ry="30" fill="#FFE0D0"/>
                <path d="M32 35 Q35 15 60 12 Q85 15 88 35 Q90 45 85 50 Q80 35 60 32 Q40 35 35 50 Q30 45 32 35Z" fill="#4A7099"/>
                <path d="M40 30 Q45 25 55 28 Q50 35 40 30Z" fill="#5580AA"/>
                <ellipse cx="48" cy="45" rx="3" ry="4" fill="#2C3E50"/>
                <ellipse cx="72" cy="45" rx="3" ry="4" fill="#2C3E50"/>
                <path d="M55 55 Q60 60 65 55" stroke="#E8A090" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M43 38 Q48 36 53 38" stroke="#3D5A73" strokeWidth="2" strokeLinecap="round"/>
                <path d="M67 38 Q72 36 77 38" stroke="#3D5A73" strokeWidth="2" strokeLinecap="round"/>
                <ellipse cx="32" cy="48" rx="4" ry="6" fill="#FFD5C2"/>
                <ellipse cx="88" cy="48" rx="4" ry="6" fill="#FFD5C2"/>
              </svg>
            </div>
          </div>

          {/* Nickname Form */}
          <div className="ls-nickname-form">
            <h2 className="ls-nickname-title">Enter Your Nickname</h2>
            <p className="ls-nickname-subtitle">This will be displayed during your campus exploration</p>
            
            <div className="ls-input-group">
              <input
                type="text"
                className={`ls-nickname-input ${nicknameError ? 'error' : ''}`}
                placeholder="Your awesome nickname..."
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setNicknameError('')
                }}
                onKeyPress={handleKeyPress}
                maxLength={20}
                autoFocus
              />
              <button 
                className="ls-random-btn"
                onClick={generateRandomNickname}
                title="Generate random nickname"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {nicknameError && (
              <p className="ls-error-message">{nicknameError}</p>
            )}

            <button 
              className="ls-continue-btn"
              onClick={handleContinue}
              type="button"
            >
              <span>Continue to Game</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="ls-footer">
        <p>Developed by <span>TeamExploreX</span></p>
      </div>

      {/* Corner Decoration */}
      <div className="ls-corner-decor ls-corner-br">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Watermark */}
      <div className="ls-watermark">
        <span>Universe</span><span className="highlight">3D</span>
      </div>
    </div>
  )
}

export default LoadingScreen
