import { useCallback } from 'react'
import './App.css'
import GameComponent from './components/GameComponent'
import { ChorusKingGame } from './game/Game'

function App() {
  const handleGameReady = useCallback((game: ChorusKingGame) => {
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
