import Phaser from 'phaser';
import { COLORS } from '../utils/Constants';
import { loadLevelData, type LevelId } from '../data/levels/index';

export interface LevelData {
  name: string;
  music: {
    bpm: number;
    key: string;
    style: string;
  };
  camera: {
    bounds: { width: number; height: number };
    zoom: number;
    followOffset: { x: number; y: number };
  };
  player: {
    spawn: { x: number; y: number };
  };
  platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    color: string;
    moveRange?: number;
  }>;
  notes: Array<{
    x: number;
    y: number;
    type: string;
    color: string;
    pitch: string;
  }>;
  enemies: Array<{
    x: number;
    y: number;
    type: string;
    color: string;
    patrolRange?: number;
    shootInterval?: number;
  }>;
  hazards: Array<{
    x: number;
    y: number;
    type: string;
    color: string;
  }>;
  background: {
    style: string;
    colors: string[];
    particles: number;
    effects: string[];
  };
  goal: {
    x: number;
    y: number;
    type: string;
    color: string;
    nextLevel?: string;
  };
}

export class LevelLoader {
  private scene: Phaser.Scene;
  private currentLevelData: LevelData | null = null;

  // Enhanced color palette with more vibrant colors
  private static COLOR_MAP: { [key: string]: number } = {
    NEON_BLUE: 0x00FFFF,
    NEON_PINK: 0xFF00FF,
    NEON_GREEN: 0x00FF00,
    NEON_ORANGE: 0xFF8000,
    NEON_YELLOW: 0xFFFF00,
    NEON_PURPLE: 0x8000FF,
    NEON_CYAN: 0x00FFFF,
    NEON_RED: 0xFF0040,
    NEON_WHITE: 0xFFFFFF,
    DANGER_RED: 0xFF0000,
    DANGER_ORANGE: 0xFF4500,
    ELECTRIC_BLUE: 0x0080FF,
    LASER_GREEN: 0x80FF00,
    PLASMA_PURPLE: 0xFF00C0
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async loadLevel(levelId: LevelId): Promise<LevelData | null> {
    try {
      const levelData = await loadLevelData(levelId);
      if (!levelData) {
        console.error(`Level ${levelId} not found`);
        return null;
      }

      this.currentLevelData = levelData;
      return levelData;
    } catch (error) {
      console.error(`Error loading level ${levelId}:`, error);
      return null;
    }
  }

  createPlatforms(
    levelData: LevelData,
    platformsGroup: Phaser.Physics.Arcade.StaticGroup,
    movingPlatformsGroup: Phaser.Physics.Arcade.Group,
    bouncyPlatformsGroup: Phaser.Physics.Arcade.StaticGroup
  ) {
    levelData.platforms.forEach(platformData => {
      let platform: Phaser.Physics.Arcade.Sprite;
      
      // Create platform based on type
      switch (platformData.type) {
        case 'moving':
          platform = movingPlatformsGroup.create(platformData.x, platformData.y, 'platform');
          platform.setData('startX', platformData.x);
          platform.setData('endX', platformData.x + (platformData.moveRange || 100));
          platform.setData('direction', 1);
          if (platform.body && 'setVelocityX' in platform.body) {
            (platform.body as Phaser.Physics.Arcade.Body).setVelocityX(50);
          }
          break;
        case 'bouncy':
          platform = bouncyPlatformsGroup.create(platformData.x, platformData.y, 'bouncyPlatform');
          break;
        default:
          platform = platformsGroup.create(platformData.x, platformData.y, 'platform');
          break;
      }

      // Set platform properties
      platform.setOrigin(0, 0);
      platform.setDisplaySize(platformData.width, platformData.height);
      platform.setTint(this.getColor(platformData.color));
      platform.refreshBody();

      // Add visual effects for different platform types
      this.addPlatformEffects(platform, platformData.type, platformData.color);
    });
  }

  createNotes(levelData: LevelData, notesGroup: Phaser.Physics.Arcade.Group) {
    levelData.notes.forEach((noteData, index) => {
      const note = notesGroup.create(noteData.x, noteData.y, 'note');
      note.setOrigin(0.5);
      note.setTint(this.getColor(noteData.color));
      note.setData('pitch', noteData.pitch);
      note.setData('type', noteData.type);
      
      // Enhanced note animations
      this.scene.tweens.add({
        targets: note,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 600 + (index * 30),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.scene.tweens.add({
        targets: note,
        y: noteData.y - 15,
        duration: 800 + (index * 40),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Add glowing effect
      this.scene.tweens.add({
        targets: note,
        alpha: { from: 0.7, to: 1.0 },
        duration: 400 + (index * 20),
        yoyo: true,
        repeat: -1,
        ease: 'Power2.easeInOut'
      });
    });
  }

  createEnemies(levelData: LevelData, enemiesGroup: Phaser.Physics.Arcade.Group, projectilesGroup: Phaser.Physics.Arcade.Group) {
    // Placeholder for enemy creation
    // Will be implemented when Enemy classes are ready
    levelData.enemies.forEach(enemyData => {
      console.log('Enemy placeholder for:', enemyData.type, 'at', enemyData.x, enemyData.y);
    });
  }

  createHazards(levelData: LevelData, hazardsGroup: Phaser.Physics.Arcade.StaticGroup) {
    levelData.hazards.forEach(hazardData => {
      const hazard = hazardsGroup.create(hazardData.x, hazardData.y, 'hazard');
      hazard.setOrigin(0.5);
      hazard.setTint(this.getColor(hazardData.color));
      hazard.refreshBody();

      // Add spinning animation
      this.scene.tweens.add({
        targets: hazard,
        rotation: Math.PI * 2,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });

      // Add pulsing effect
      this.scene.tweens.add({
        targets: hazard,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  createBackground(levelData: LevelData) {
    const { background } = levelData;
    const { width, height } = this.scene.cameras.main;

    // Create dynamic background based on style
    switch (background.style) {
      case 'synthwave_grid':
        this.createSynthwaveGrid(background);
        break;
      case 'neon_city':
        this.createDefaultBackground(background);
        break;
      default:
        this.createDefaultBackground(background);
    }

    // Add floating particles
    this.createFloatingParticles(background);
  }

  private createSynthwaveGrid(background: any) {
    const { width, height } = this.scene.cameras.main;
    
    // Create grid lines
    const gridGraphics = this.scene.add.graphics();
    gridGraphics.setDepth(-10);
    
    // Vertical lines
    for (let x = 0; x < width * 3; x += 50) {
      gridGraphics.lineStyle(1, this.getColor(background.colors[0]), 0.3);
      gridGraphics.lineBetween(x, 0, x, height);
    }
    
    // Horizontal lines with perspective effect
    for (let y = height * 0.6; y < height; y += 30) {
      const alpha = (y - height * 0.6) / (height * 0.4);
      gridGraphics.lineStyle(2, this.getColor(background.colors[1]), 0.2 + alpha * 0.3);
      gridGraphics.lineBetween(0, y, width * 3, y);
    }

    // Animated scan lines
    this.createScanLines();
  }

  private createScanLines() {
    const { width, height } = this.scene.cameras.main;
    const scanLine = this.scene.add.graphics();
    scanLine.setDepth(-5);
    
    const updateScanLine = () => {
      scanLine.clear();
      const time = this.scene.time.now;
      const y = (Math.sin(time * 0.002) * 0.5 + 0.5) * height;
      
      scanLine.lineStyle(3, 0x00FFFF, 0.8);
      scanLine.lineBetween(0, y, width * 3, y);
      
      // Add glow effect
      scanLine.lineStyle(1, 0xFFFFFF, 0.6);
      scanLine.lineBetween(0, y - 1, width * 3, y - 1);
      scanLine.lineBetween(0, y + 1, width * 3, y + 1);
    };

    this.scene.time.addEvent({
      delay: 16,
      callback: updateScanLine,
      loop: true
    });
  }

  private createFloatingParticles(background: any) {
    for (let i = 0; i < background.particles; i++) {
      const particle = this.scene.add.graphics();
      const size = Phaser.Math.Between(1, 4);
      const colorIndex = i % background.colors.length;
      const color = this.getColor(background.colors[colorIndex]);
      
      particle.fillStyle(color, 0.6);
      
      // Create different shapes
      const shapeType = i % 4;
      switch (shapeType) {
        case 0:
          particle.fillCircle(0, 0, size);
          break;
        case 1:
          particle.fillRect(-size/2, -size/2, size, size);
          break;
        case 2:
          particle.fillTriangle(0, -size, -size, size, size, size);
          break;
        case 3:
          // Create a star shape manually
          particle.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? size : size / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) particle.moveTo(x, y);
            else particle.lineTo(x, y);
          }
          particle.closePath();
          particle.fillPath();
          break;
      }
      
      const x = Phaser.Math.Between(0, this.scene.cameras.main.width * 3);
      const y = Phaser.Math.Between(0, this.scene.cameras.main.height);
      particle.setPosition(x, y);
      particle.setDepth(-8);
      
      // Floating animation with different speeds
      this.scene.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-200, 200),
        y: y + Phaser.Math.Between(-100, 100),
        rotation: Math.PI * 2,
        alpha: { from: 0.3, to: 0.8 },
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createDefaultBackground(background: any) {
    // Simple gradient background
    const { width, height } = this.scene.cameras.main;
    const bg = this.scene.add.graphics();
    bg.setDepth(-15);
    
    // Create vertical gradient
    for (let y = 0; y < height; y += 5) {
      const alpha = y / height;
      const color1 = this.getColor(background.colors[0]);
      const color2 = this.getColor(background.colors[1] || background.colors[0]);
      
      // Simple interpolation without the complex Phaser method
      const r1 = (color1 >> 16) & 0xFF;
      const g1 = (color1 >> 8) & 0xFF;
      const b1 = color1 & 0xFF;
      
      const r2 = (color2 >> 16) & 0xFF;
      const g2 = (color2 >> 8) & 0xFF;
      const b2 = color2 & 0xFF;
      
      const r = Math.round(r1 + (r2 - r1) * alpha);
      const g = Math.round(g1 + (g2 - g1) * alpha);
      const b = Math.round(b1 + (b2 - b1) * alpha);
      
      const interpolatedColor = (r << 16) | (g << 8) | b;
      
      bg.fillStyle(interpolatedColor, 0.3);
      bg.fillRect(0, y, width * 3, 5);
    }
  }

  private addPlatformEffects(platform: Phaser.Physics.Arcade.Sprite, type: string, colorName: string) {
    const color = this.getColor(colorName);
    
    switch (type) {
      case 'bouncy':
        // Add bouncy animation
        this.scene.tweens.add({
          targets: platform,
          scaleY: { from: 0.9, to: 1.1 },
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
      case 'moving':
        // Add trail effect for moving platforms
        break;
      default:
        // Add subtle glow for regular platforms
        this.scene.tweens.add({
          targets: platform,
          alpha: { from: 0.8, to: 1.0 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
    }
  }

  private getColor(colorName: string): number {
    return LevelLoader.COLOR_MAP[colorName] || COLORS.PLAYER;
  }

  setupCamera(levelData: LevelData, camera: Phaser.Cameras.Scene2D.Camera, target?: Phaser.GameObjects.GameObject) {
    const { camera: cameraConfig } = levelData;
    
    camera.setBounds(0, 0, cameraConfig.bounds.width, cameraConfig.bounds.height);
    camera.setZoom(cameraConfig.zoom);
    
    if (target) {
      camera.startFollow(target, true, 0.08, 0.08, cameraConfig.followOffset.x, cameraConfig.followOffset.y);
      camera.setDeadzone(100, 60);
    }
  }

  getCurrentLevelData(): LevelData | null {
    return this.currentLevelData;
  }
}