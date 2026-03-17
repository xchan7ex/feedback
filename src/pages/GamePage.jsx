import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── Game stylesheet imports ─── */
import '../styles/game-base.css'
import '../styles/game-loading.css'
import '../styles/game-main-menu.css'
import '../styles/game-ui.css'

import LoadingScreen from '../components/game/LoadingScreen'
import MainMenu from '../components/game/MainMenu'
import GameCanvas from '../components/game/GameCanvas'
import GameUI from '../components/game/GameUI'
import MISSIONS from '../data/missions'

// Create context to share player data across game components
export const PlayerContext = createContext(null)

// Custom hook to access player data
export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider')
  }
  return context
}

function GamePage() {
  // Screen states: 'loading' | 'menu' | 'playing'
  const [screenState, setScreenState] = useState('loading')
  const [playerNickname, setPlayerNickname] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [teleportTarget, setTeleportTarget] = useState(null)
  const [currentFloor, setCurrentFloor] = useState(1)

  // Missions state initialized directly from data
  const [missions, setMissions] = useState(MISSIONS)

  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  const navigate = useNavigate()

  // Centralized audio management - plays across loading and menu screens
  useEffect(() => {
    audioRef.current = new Audio('/audio/loading-music.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.15

    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => { })
      }
    }

    // Try to play on any user interaction
    const handleInteraction = () => {
      playAudio()
      // Remove all listeners after first successful play
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }

    // Add multiple interaction listeners
    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Handle mute toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  // Called when player submits nickname from loading screen
  const handleNicknameSubmit = (nickname) => {
    // Store nickname
    setPlayerNickname(nickname)
    sessionStorage.setItem('universe3d_player_nickname', nickname)

    // Transition to main menu
    setScreenState('menu')

    console.log(`Player "${nickname}" ready to select building!`)
  }

  // Resume music when returning to menu
  useEffect(() => {
    if (screenState === 'menu' && audioRef.current && !isMuted) {
       // Since the user is returning from 'playing', they have already interacted with the app.
       // The browser shouldn't block this.
       audioRef.current.play().catch((err) => {
         console.warn("Audio play prevented:", err);
       });
    }
  }, [screenState, isMuted]);

  // Called when player selects a building and starts the game
  const handleStartGame = (buildingId) => {
    setSelectedBuilding(buildingId)
    sessionStorage.setItem('universe3d_selected_building', buildingId)

    // Stop music when entering game
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Transition to game
    setScreenState('playing')
    console.log(`Player "${playerNickname}" starting game in ${buildingId}!`)
  }

  // Called when player exits from main menu
  const handleExit = () => {
    sessionStorage.removeItem('universe3d_player_nickname')
    sessionStorage.removeItem('universe3d_selected_building')
    navigate('/')
  }

  // Handle teleportation
  const handleTeleport = (location) => {
    setTeleportTarget(location)
  }

  const handleFloorChange = (floor) => {
    setCurrentFloor(floor)
  }

  // Player context value
  const playerContextValue = {
    nickname: playerNickname,
    setNickname: setPlayerNickname,
    selectedBuilding,
    setSelectedBuilding,
    clearSession: () => {
      sessionStorage.removeItem('universe3d_player_nickname')
      sessionStorage.removeItem('universe3d_selected_building')
      setPlayerNickname('')
      setSelectedBuilding(null)
    }
  }

  return (
    <PlayerContext.Provider value={playerContextValue}>
      <div className="game-page">
        {/* Loading Screen - Enter nickname */}
        {screenState === "loading" && (
          <LoadingScreen onNicknameSubmit={handleNicknameSubmit} />
        )}

        {/* Main Menu - Select building */}
        {screenState === "menu" && (
          <MainMenu
            onStartGame={handleStartGame}
            onExit={handleExit}
            playerNickname={playerNickname}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
          />
        )}

        {/* Game - Playing */}
        {screenState === "playing" && (
          <div className="game-container visible">
            <GameCanvas
              selectedBuilding={selectedBuilding}
              teleportTarget={teleportTarget}
              onFloorChange={handleFloorChange}
              missions={missions}
              setMissions={setMissions}
            />
            <GameUI
              playerNickname={playerNickname}
              selectedBuilding={selectedBuilding}
              onBackToMenu={() => setScreenState("menu")}
              onTeleport={handleTeleport}
              currentFloor={currentFloor}
              setCurrentFloor={setCurrentFloor}
              missions={missions}
              onMissionUpdate={setMissions}
            />
          </div>
        )}
      </div>
    </PlayerContext.Provider>
  );
}

export default GamePage
