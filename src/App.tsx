import React, { useState, useCallback } from 'react'
import './App.css'
import GameComponent from './components/GameComponent'
import { ChorusKingGame } from './game/Game'

function App() {
  const [gameInstance, setGameInstance] = useState<ChorusKingGame | null>(null)
  const [isGameLoaded, setIsGameLoaded] = useState(false)

  const handleGameReady = useCallback((game: ChorusKingGame) => {
    setGameInstance(game)
    setIsGameLoaded(true)
    console.log('Chorus King game initialized successfully!')
  }, [])

  return (
    <GameComponent 
      onGameReady={handleGameReady}
      className="fullscreen-game"
    />
  )
}

export default App
