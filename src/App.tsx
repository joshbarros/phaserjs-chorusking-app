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
    <div className="app">
      <header className="app-header">
        <h1>Chorus King</h1>
        <p>A Sound Shapes Clone</p>
        {isGameLoaded && (
          <div className="game-status">
            <span>Game Ready</span>
          </div>
        )}
      </header>
      
      <main className="app-main">
        <GameComponent 
          onGameReady={handleGameReady}
          className="game-wrapper"
        />
      </main>
      
      <footer className="app-footer">
        <p>Controls: WASD/Arrow Keys to move, Space to jump</p>
        <p>Gamepad support enabled</p>
      </footer>
    </div>
  )
}

export default App
