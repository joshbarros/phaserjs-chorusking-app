import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { NewGameScene } from './scenes/NewGameScene';
import { DemoScene } from './scenes/DemoScene';
import { SettingsScene } from './scenes/SettingsScene';
import { CreditsScene } from './scenes/CreditsScene';
import { GAME_CONFIG } from './utils/Constants';

export class ChorusKingGame {
  private game: Phaser.Game;

  constructor(parentElement: string | HTMLElement) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT,
      parent: parentElement,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: GAME_CONFIG.PHYSICS.GRAVITY, x: 0 },
          debug: GAME_CONFIG.PHYSICS.DEBUG
        }
      },
      input: {
        gamepad: true
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },
      scene: [BootScene, DemoScene, MenuScene, NewGameScene, SettingsScene, CreditsScene],
      render: {
        antialias: true,
        pixelArt: false
      }
    };

    this.game = new Phaser.Game(config);
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true, false);
    }
  }

  getGame(): Phaser.Game {
    return this.game;
  }

  // Utility methods for React integration
  resize(width: number, height: number) {
    this.game.scale.resize(width, height);
  }

  pause() {
    this.game.scene.pause('GameScene');
  }

  resume() {
    this.game.scene.resume('GameScene');
  }

  getCurrentScene(): Phaser.Scene | null {
    const sceneManager = this.game.scene;
    const activeScenes = sceneManager.getScenes(true);
    return activeScenes.length > 0 ? activeScenes[0] : null;
  }
}