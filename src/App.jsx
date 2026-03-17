import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MarketingPage from './pages/MarketingPage'
import GamePage from './pages/GamePage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </Router>
  )
}

export default App
