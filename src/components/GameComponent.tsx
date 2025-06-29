import React, { useEffect, useRef, useState } from 'react';
import { ChorusKingGame } from '../game/Game';

interface GameComponentProps {
  onGameReady?: (game: ChorusKingGame) => void;
  className?: string;
}

export const GameComponent: React.FC<GameComponentProps> = ({ 
  onGameReady, 
  className = '' 
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<ChorusKingGame | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeGame = async () => {
      try {
        if (!gameRef.current) {
          throw new Error('Game container ref is not available');
        }

        // Clear any existing content
        gameRef.current.innerHTML = '';

        // Create game instance
        const game = new ChorusKingGame(gameRef.current);
        
        if (!mounted) {
          game.destroy();
          return;
        }

        gameInstanceRef.current = game;

        // Wait a frame to ensure game is initialized
        await new Promise(resolve => requestAnimationFrame(resolve));

        if (mounted) {
          setIsGameReady(true);
          onGameReady?.(game);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize game');
          console.error('Game initialization error:', err);
        }
      }
    };

    initializeGame();

    return () => {
      mounted = false;
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
      setIsGameReady(false);
      setError(null);
    };
  }, [onGameReady]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (gameInstanceRef.current && gameRef.current) {
        const { clientWidth, clientHeight } = gameRef.current.parentElement || gameRef.current;
        gameInstanceRef.current.resize(clientWidth, clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isGameReady]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!gameInstanceRef.current) return;

      if (document.hidden) {
        gameInstanceRef.current.pause();
      } else {
        gameInstanceRef.current.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isGameReady]);

  if (error) {
    return (
      <div className={`game-error ${className}`}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          color: '#ff4444',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>Game Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-container ${className}`} style={{ width: '100%', height: '100%' }}>
      <div 
        ref={gameRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} 
      />
      {!isGameReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          <div>Initializing Game...</div>
          <div style={{ fontSize: '14px', marginTop: '10px', color: '#ffff00' }}>
            Click anywhere to enable audio
          </div>
        </div>
      )}
    </div>
  );
};

export default GameComponent;