import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MissionPanel from './MissionPanel'
import SearchLocation from './SearchLocation'
import Feedback from './Feedback'

// Building data for display names
const BUILDING_INFO = {
  'spencer': { name: 'Spencer Building (SP)', floors: 13 },
  'gp-square': { name: 'GP Square', floors: 8 },
  'ramakrishna': { name: 'Ramakrishna Building', floors: 5 }
}

function GameUI({ playerNickname, selectedBuilding, onBackToMenu, onTeleport, currentFloor, setCurrentFloor, missions, onMissionUpdate }) {
  const navigate = useNavigate()
  const [showControls, setShowControls] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  // currentFloor is now passed as a prop
  const [isMinimapExpanded, setIsMinimapExpanded] = useState(false)
  // missions and onMissionUpdate are passed as props
  const [showSearch, setShowSearch] = useState(false)
  const [navigationMessage, setNavigationMessage] = useState(null)
  const [displayedMessage, setDisplayedMessage] = useState('')
  const navigationMessageTimeout = useRef(null)

  // Typewriter effect for navigation message
  useEffect(() => {
    if (!navigationMessage) {
      setDisplayedMessage('');
      return;
    }

    let currentIndex = 0;
    setDisplayedMessage('');

    const intervalId = setInterval(() => {
      currentIndex++;
      setDisplayedMessage(navigationMessage.slice(0, currentIndex));
      if (currentIndex >= navigationMessage.length) {
        clearInterval(intervalId);
      }
    }, 40); // typing speed

    return () => clearInterval(intervalId);
  }, [navigationMessage]);

  // Get building info based on selection
  const buildingInfo = BUILDING_INFO[selectedBuilding] || { name: 'Unknown Building', floors: 1 }

  // Handle M key for minimap expand
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'm' || e.key === 'M') {
        setIsMinimapExpanded(true)
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'm' || e.key === 'M') {
        setIsMinimapExpanded(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleExitGame = () => {
    setShowFeedback(true)
  }

  const handleFeedbackComplete = () => {
    setShowFeedback(false)
    // Clear session data when exiting
    sessionStorage.removeItem('universe3d_player_nickname')
    sessionStorage.removeItem('universe3d_selected_building')
    navigate('/')
  }

  // Building spawn points (x/z) for fast travel and floor navigation
  const BUILDING_SPAWNS = {
    'spencer': { x: -10, z: -10 }, // Edit Spencer spawn here
    'ramakrishna': { x: 5, z: 5 }  // Edit Ramakrishna spawn here
  }

  // Specific spawn points for each floor of GP Square
  // Specific spawn points for each floor of GP Square
  // Adjust these coordinates to change where the player lands when using Up/Down buttons
  const GP_LEVEL_UP_DOWN_COORDINATES = {
    1: { x: -7, y: 0, z: -5 },  // Ground Floor
    2: { x: -9, y: 7, z: -5 },  // Floor 1
    3: { x: -9, y: 10, z: -5 },   // Floor 2
    4: { x: -9, y: 12, z: -5 },  // Floor 3
    5: { x: -9, y: 16, z: -5 },  // Floor 4
    6: { x: -9, y: 20, z: -5 },  // Floor 5
    7: { x: -9, y: 24, z: -3.5 },  // Floor 6
    8: { x: -9, y: 28, z: -3.5 },  // Floor 7
  }

  const getSpawnCoordinates = (floor) => {
    if (selectedBuilding === 'gp-square') {
      // Use the explicit list for GP Square
      return GP_LEVEL_UP_DOWN_COORDINATES[floor] || { x: -18, y: (floor - 1) * 4, z: -4 }
    }
    // Default logic for other buildings
    const spawn = BUILDING_SPAWNS[selectedBuilding] || { x: 0, z: 0 }
    return { x: spawn.x, y: (floor - 1) * 4, z: spawn.z }
  }

  const handleFloorUp = () => {
    if (currentFloor < buildingInfo.floors) {
      const nextFloor = currentFloor + 1
      const spawn = getSpawnCoordinates(nextFloor)
      onTeleport?.({
        name: `Floor ${nextFloor}`,
        floor: nextFloor,
        coordinates: spawn
      })
    }
  }

  const handleFloorDown = () => {
    if (currentFloor > 1) {
      const prevFloor = currentFloor - 1
      const spawn = getSpawnCoordinates(prevFloor)
      onTeleport?.({
        name: `Floor ${prevFloor}`,
        floor: prevFloor,
        coordinates: spawn
      })
    }
  }

  const handleBackToMenu = () => {
    // Go back to main menu (building selection)
    setShowMenu(false)
    onBackToMenu?.()
  }

  return (
    <div className="game-ui">
      {/* Top Bar */}
      <div className="game-ui-top">
        <button
          className="game-ui-btn game-logo-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Universe 3D</span>
        </button>

        {/* Building Location - Now on left side */}
        <div className="game-ui-location">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            {buildingInfo.name} - {currentFloor === 1 ? 'Ground Floor' : `Floor ${currentFloor - 1}`}
          </span>
        </div>

        {/* Player Info - Now on right side */}
        <div className="game-ui-player">
          <div className="player-avatar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="player-name">{playerNickname || "Explorer"}</span>
        </div>

        {/* Mission Panel - Under top bar on right side */}
        <MissionPanel missions={missions} onMissionUpdate={onMissionUpdate} buildingName={buildingInfo.name} />
      </div>

      {/* Control Hints */}
      <button
        className="game-ui-btn game-controls-hint"
        onClick={() => setShowControls(!showControls)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        Controls
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div className="game-controls-panel">
          <h3>Navigation Controls</h3>
          <div className="controls-grid">
            <div className="control-item">
              <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
              <span>Move</span>
            </div>
            <div className="control-item">
              <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd>
              <span>Move (Alt)</span>
            </div>
            <div className="control-item">
              <kbd>Mouse</kbd>
              <span>Look Around</span>
            </div>
            <div className="control-item">
              <kbd>Scroll</kbd>
              <span>Zoom</span>
            </div>
            <div className="control-item">
              <kbd>E</kbd>
              <span>Interact</span>
            </div>
            <div className="control-item">
              <kbd>M (Hold )</kbd>
              <span>Map</span>
            </div>
          </div>
          <button
            className="close-panel"
            onClick={() => setShowControls(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* Menu Panel */}
      {showMenu && (
        <div className="game-menu-panel">
          <nav className="menu-nav">
            <button
              className="menu-item"
              onClick={() => {
                setShowMenu(false);
                setShowSearch(true);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Location
            </button>
            <button className="menu-item" onClick={handleBackToMenu}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Campus Map
            </button>
            <button className="menu-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              University Info
            </button>
            <button className="menu-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Quick Quiz
            </button>
            <div className="menu-divider"></div>
            <button
              className="menu-item menu-item-exit"
              onClick={handleExitGame}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Exit to Website
            </button>
          </nav>
        </div>
      )}

      <SearchLocation
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        selectedBuilding={selectedBuilding}
        currentFloor={currentFloor}
        onTeleport={(location) => {
          console.log("Navigating to:", location);
          
          // Set navigation message
          const floorText = location.floor === 1 ? 'Ground Floor' : `Floor ${location.floor - 1}`;
          setNavigationMessage(`Navigating to ${location.name}. Your location is on ${floorText}`);
          
          // Clear previous timeout and set new one
          if (navigationMessageTimeout.current) {
            clearTimeout(navigationMessageTimeout.current);
          }
          navigationMessageTimeout.current = setTimeout(() => {
            setNavigationMessage(null);
          }, 5000);
          
          if (location.floor !== currentFloor) {
            // Find the nearest stairs/elevator on the current floor (we use the spawn point)
            const currentFloorStairs = getSpawnCoordinates(currentFloor);
            
            // Generate path for each intermediate floor
            const floorPath = [];
            const dir = location.floor > currentFloor ? 1 : -1;
            for (let f = currentFloor + dir; f !== location.floor + dir; f += dir) {
                floorPath.push({
                   targetFloor: f,
                   spawn: getSpawnCoordinates(f)
                });
            }
            
            // Trigger auto-walk to current floor's stairs, with payload for cross-floor jump
            onTeleport?.({
              name: `Stairs to Floor ${location.floor}`,
              floor: currentFloor,
              coordinates: currentFloorStairs,
              walk: true,
              crossFloor: {
                path: floorPath,
                finalLocation: location
              }
            });
          } else {
            // Trigger auto-walk instead of instant teleport
            onTeleport?.({ ...location, walk: true });
          }
        }}
      />

      {/* Mini Map */}
      <div className={`game-minimap ${isMinimapExpanded ? "expanded" : ""}`}>
        <div className="minimap-header">
          <span>{buildingInfo.name}</span>
          <span className="minimap-key">M</span>
        </div>
        <div className="minimap-content">
          <div className="minimap-player-dot"></div>
        </div>
        {/* <div className="minimap-hint">Hold M to expand</div> */}
      </div>

      {/* Navigation Message */}
      {navigationMessage && (
        <div className="navigation-message-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-toast-icon">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span className="typewriter-text">
            {displayedMessage}
            {displayedMessage.length < navigationMessage.length && <span className="typewriter-cursor">_</span>}
          </span>
        </div>
      )}

      {/* Bottom Info */}
      <div className="game-ui-bottom">
        <div className="game-floor-indicator">
          <button
            className="floor-btn"
            onClick={handleFloorUp}
            disabled={currentFloor >= buildingInfo.floors}
          >
            ▲
          </button>
          <span>
            {currentFloor === 1 ? 'Ground' : `Floor ${currentFloor - 1}`}
          </span>
          <button
            className="floor-btn"
            onClick={handleFloorDown}
            disabled={currentFloor <= 1}
          >
            ▼
          </button>
        </div>
      </div>
      {/* Feedback Modal */}
      {showFeedback && (
        <Feedback
          onComplete={handleFeedbackComplete}
          onClose={() => setShowFeedback(false)}
          playerNickname={playerNickname}
        />
      )}
    </div>
  );
}

export default GameUI