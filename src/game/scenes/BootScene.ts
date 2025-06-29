import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 800, 50);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 780 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Generate basic geometric textures
    this.generateTextures();
  }

  create() {
    // Initialize game managers here if needed
    
    // Start demo scene in background first
    this.scene.start('DemoScene');
    
    // Then start menu scene on top
    this.scene.launch('MenuScene');
  }

  private generateTextures() {
    // Player texture - glowing circle
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff88, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.lineStyle(2, 0x00ffff, 0.8);
    playerGraphics.strokeCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Platform texture - vibrant orange with glow
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6b35, 1);
    platformGraphics.fillRoundedRect(0, 0, 64, 32, 6);
    platformGraphics.lineStyle(1, 0xff8c42, 1);
    platformGraphics.strokeRoundedRect(0, 0, 64, 32, 6);
    platformGraphics.generateTexture('platform', 64, 32);
    platformGraphics.destroy();

    // Moving platform texture - teal
    const movingPlatformGraphics = this.add.graphics();
    movingPlatformGraphics.fillStyle(0x06d6a0, 1);
    movingPlatformGraphics.fillRoundedRect(0, 0, 64, 32, 6);
    movingPlatformGraphics.lineStyle(2, 0x00ffff, 0.8);
    movingPlatformGraphics.strokeRoundedRect(0, 0, 64, 32, 6);
    movingPlatformGraphics.generateTexture('movingPlatform', 64, 32);
    movingPlatformGraphics.destroy();

    // Bouncy platform texture - amber with animation hints
    const bouncyPlatformGraphics = this.add.graphics();
    bouncyPlatformGraphics.fillStyle(0xf59e0b, 1);
    bouncyPlatformGraphics.fillRoundedRect(0, 0, 64, 24, 12);
    bouncyPlatformGraphics.lineStyle(2, 0xfbbf24, 1);
    bouncyPlatformGraphics.strokeRoundedRect(0, 0, 64, 24, 12);
    bouncyPlatformGraphics.generateTexture('bouncyPlatform', 64, 24);
    bouncyPlatformGraphics.destroy();

    // Note texture - bright yellow diamond
    const noteGraphics = this.add.graphics();
    noteGraphics.fillStyle(0xffff00, 1);
    noteGraphics.beginPath();
    noteGraphics.moveTo(12, 0);
    noteGraphics.lineTo(24, 12);
    noteGraphics.lineTo(12, 24);
    noteGraphics.lineTo(0, 12);
    noteGraphics.closePath();
    noteGraphics.fillPath();
    noteGraphics.lineStyle(2, 0xffffff, 0.8);
    noteGraphics.strokePath();
    noteGraphics.generateTexture('note', 24, 24);
    noteGraphics.destroy();

    // Enemy texture - pink triangle
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3366, 1);
    enemyGraphics.beginPath();
    enemyGraphics.moveTo(16, 0);
    enemyGraphics.lineTo(32, 28);
    enemyGraphics.lineTo(0, 28);
    enemyGraphics.closePath();
    enemyGraphics.fillPath();
    enemyGraphics.lineStyle(2, 0xff6b9d, 1);
    enemyGraphics.strokePath();
    enemyGraphics.generateTexture('enemy', 32, 28);
    enemyGraphics.destroy();

    // Projectile texture - red square
    const projectileGraphics = this.add.graphics();
    projectileGraphics.fillStyle(0xdc2626, 1);
    projectileGraphics.fillRect(0, 0, 8, 8);
    projectileGraphics.lineStyle(1, 0xff4444, 1);
    projectileGraphics.strokeRect(0, 0, 8, 8);
    projectileGraphics.generateTexture('projectile', 8, 8);
    projectileGraphics.destroy();

    // Hazard texture - spiky red shape
    const hazardGraphics = this.add.graphics();
    hazardGraphics.fillStyle(0xff0066, 1);
    hazardGraphics.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = i % 2 === 0 ? 16 : 8;
      const x = 16 + Math.cos(angle) * radius;
      const y = 16 + Math.sin(angle) * radius;
      if (i === 0) hazardGraphics.moveTo(x, y);
      else hazardGraphics.lineTo(x, y);
    }
    hazardGraphics.closePath();
    hazardGraphics.fillPath();
    hazardGraphics.generateTexture('hazard', 32, 32);
    hazardGraphics.destroy();

    // Particle texture
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x00ffff, 1);
    particleGraphics.fillCircle(2, 2, 2);
    particleGraphics.generateTexture('particle', 4, 4);
    particleGraphics.destroy();
  }
}