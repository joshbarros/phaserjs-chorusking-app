import Phaser from 'phaser';
import { COLORS, COLOR_PALETTES } from '../utils/Constants';

export class CreditsScene extends Phaser.Scene {
  private creditsContainer!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private creditsContent: Phaser.GameObjects.Container[] = [];
  private backgroundParticles: Phaser.GameObjects.Graphics[] = [];
  private gamepad?: Phaser.Input.Gamepad.Gamepad;

  constructor() {
    super({ key: 'CreditsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent background with Sound Shapes inspired gradient
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.9)');

    // Create animated background inspired by Sound Shapes
    this.createSoundShapesBackground();

    // Main credits container
    this.creditsContainer = this.add.container(width / 2, height);

    // Create credits content
    this.createCreditsContent();

    // Setup input
    this.setupInput();

    // Close button
    const closeBtn = this.add.text(width - 40, 40, '✕', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: COLORS.TRAIL.toString(16)
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    closeBtn.on('pointerdown', () => this.closeCredits());
    closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
    closeBtn.on('pointerout', () => closeBtn.setScale(1.0));

    // Instructions
    const instructions = this.add.text(width / 2, height - 40, 'SCROLL TO READ • ESC TO CLOSE', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888888'
    });
    instructions.setOrigin(0.5);

    // Start scrolling animation
    this.startCreditsScroll();
  }

  update() {
    this.handleGamepadInput();
    this.updateBackgroundAnimation();
  }

  private createCreditsContent() {
    const credits = [
      { type: 'title', text: 'CHORUS KING', size: '48px', color: COLORS.PLAYER },
      { type: 'subtitle', text: 'A Sound Shapes Inspired Experience', size: '18px', color: COLORS.NOTE },
      { type: 'space', height: 60 },
      
      { type: 'section', text: 'DEVELOPED BY', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: 'Claude AI Assistant', size: '20px', color: '#ffffff' },
      { type: 'text', text: 'Anthropic', size: '16px', color: '#cccccc' },
      { type: 'space', height: 40 },
      
      { type: 'section', text: 'CREATED FOR', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: 'Josue Barros', size: '20px', color: '#ffffff' },
      { type: 'text', text: 'StarStream Games', size: '16px', color: '#cccccc' },
      { type: 'space', height: 40 },
      
      { type: 'section', text: 'TECHNOLOGY', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: 'React + TypeScript', size: '16px', color: '#ffffff' },
      { type: 'text', text: 'PhaserJS 3.90.0', size: '16px', color: '#ffffff' },
      { type: 'text', text: 'Howler.js Audio Engine', size: '16px', color: '#ffffff' },
      { type: 'text', text: 'Vite Build System', size: '16px', color: '#ffffff' },
      { type: 'space', height: 40 },
      
      { type: 'section', text: 'INSPIRED BY', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: 'Sound Shapes', size: '20px', color: COLORS.NOTE },
      { type: 'text', text: 'by Queasy Games & SCE Santa Monica', size: '14px', color: '#cccccc' },
      { type: 'text', text: '"Music is the soul of this experience"', size: '14px', color: '#888888', italic: true },
      { type: 'space', height: 40 },
      
      { type: 'section', text: 'GAME FEATURES', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: '• Rhythm-based platforming gameplay', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Dynamic procedural music generation', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Geometric art style with neon aesthetics', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Full gamepad support with haptic feedback', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• AI-powered demo with intelligent behavior', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Beat-synchronized visual effects', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Responsive full-screen experience', size: '14px', color: '#ffffff' },
      { type: 'space', height: 40 },
      
      { type: 'section', text: 'AUDIO SYSTEM', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: 'Procedural Music Composition', size: '16px', color: COLORS.NOTE },
      { type: 'text', text: '• Layered bass, melody, and synthesis', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Real-time audio generation', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Interactive sound effects', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Beat synchronization engine', size: '14px', color: '#ffffff' },
      { type: 'space', height: 40 },
      
      { type: 'section', text: 'VISUAL DESIGN', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: 'Pure Geometric Aesthetics', size: '16px', color: COLORS.TRAIL },
      { type: 'text', text: '• No sprites - only mathematical shapes', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Neon color palettes (SYNTHWAVE, CYBERPUNK, VAPORWAVE)', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Particle systems and dynamic effects', size: '14px', color: '#ffffff' },
      { type: 'text', text: '• Glassmorphism UI design', size: '14px', color: '#ffffff' },
      { type: 'space', height: 40 },
      
      { type: 'section', text: 'SPECIAL THANKS', size: '24px', color: COLORS.PARTICLE },
      { type: 'text', text: 'Sound Shapes Community', size: '16px', color: '#ffffff' },
      { type: 'text', text: 'for inspiring this tribute to rhythm-platforming', size: '14px', color: '#cccccc' },
      { type: 'space', height: 40 },
      
      { type: 'text', text: 'PhaserJS Community', size: '16px', color: '#ffffff' },
      { type: 'text', text: 'for the incredible game engine', size: '14px', color: '#cccccc' },
      { type: 'space', height: 40 },
      
      { type: 'text', text: 'React & TypeScript Teams', size: '16px', color: '#ffffff' },
      { type: 'text', text: 'for robust development tools', size: '14px', color: '#cccccc' },
      { type: 'space', height: 60 },
      
      { type: 'section', text: 'VERSION INFO', size: '20px', color: COLORS.PARTICLE },
      { type: 'text', text: 'Chorus King v1.0.0', size: '16px', color: COLORS.NOTE },
      { type: 'text', text: 'Built with ❤️ for the love of rhythm gaming', size: '14px', color: '#888888' },
      { type: 'space', height: 40 },
      
      { type: 'text', text: 'Open Source Project', size: '14px', color: '#cccccc' },
      { type: 'text', text: 'github.com/joshbarros/phaserjs-chorusking-app', size: '12px', color: '#666666' },
      { type: 'space', height: 100 },
      
      { type: 'title', text: 'THANK YOU FOR PLAYING!', size: '32px', color: COLORS.PLAYER },
      { type: 'space', height: 200 }
    ];

    let currentY = 0;
    credits.forEach((credit, index) => {
      let element: Phaser.GameObjects.GameObject;

      switch (credit.type) {
        case 'title':
        case 'subtitle':
        case 'section':
        case 'text':
          const style: any = {
            fontSize: credit.size,
            fontFamily: 'monospace',
            color: typeof credit.color === 'number' ? credit.color.toString(16) : credit.color,
            align: 'center'
          };

          if (credit.italic) {
            style.fontStyle = 'italic';
          }

          if (credit.type === 'title') {
            style.stroke = '#000000';
            style.strokeThickness = 3;
          }

          const text = this.add.text(0, currentY, credit.text, style);
          text.setOrigin(0.5);

          // Add glow effect for titles
          if (credit.type === 'title') {
            this.tweens.add({
              targets: text,
              alpha: { from: 0.8, to: 1 },
              duration: 2000,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }

          element = text;
          currentY += parseInt(credit.size) + 10;
          break;

        case 'space':
          currentY += credit.height || 20;
          return;

        default:
          return;
      }

      if (element) {
        const container = this.add.container(0, 0);
        container.add(element);
        
        // Add subtle entrance animation
        (element as any).setAlpha(0);
        this.tweens.add({
          targets: element,
          alpha: 1,
          duration: 1000,
          delay: index * 50,
          ease: 'Power2.easeOut'
        });

        this.creditsContent.push(container);
        this.creditsContainer.add(container);
      }
    });
  }

  private createSoundShapesBackground() {
    // Create flowing wave-like particles inspired by Sound Shapes
    for (let i = 0; i < 30; i++) {
      const particle = this.add.graphics();
      const size = Phaser.Math.Between(2, 6);
      const color = COLOR_PALETTES.SYNTHWAVE[i % COLOR_PALETTES.SYNTHWAVE.length];
      
      // Create different shapes
      const shapeType = i % 4;
      particle.fillStyle(color, 0.4);
      
      switch (shapeType) {
        case 0: // Circle
          particle.fillCircle(0, 0, size);
          break;
        case 1: // Square
          particle.fillRect(-size/2, -size/2, size, size);
          break;
        case 2: // Triangle
          particle.beginPath();
          particle.moveTo(0, -size);
          particle.lineTo(-size, size);
          particle.lineTo(size, size);
          particle.closePath();
          particle.fillPath();
          break;
        case 3: // Diamond
          particle.beginPath();
          particle.moveTo(0, -size);
          particle.lineTo(size, 0);
          particle.lineTo(0, size);
          particle.lineTo(-size, 0);
          particle.closePath();
          particle.fillPath();
          break;
      }
      
      const x = Phaser.Math.Between(-100, this.cameras.main.width + 100);
      const y = Phaser.Math.Between(-100, this.cameras.main.height + 100);
      particle.setPosition(x, y);
      particle.setDepth(-1);
      
      this.backgroundParticles.push(particle);
      
      // Create flowing wave motion
      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-200, 200),
        y: y + Phaser.Math.Between(-300, 300),
        rotation: Math.PI * 2,
        alpha: { from: 0.2, to: 0.6 },
        duration: Phaser.Math.Between(8000, 15000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private updateBackgroundAnimation() {
    this.backgroundParticles.forEach((particle, index) => {
      const time = this.time.now;
      const pulse = 1 + Math.sin(time * 0.002 + index * 0.4) * 0.3;
      particle.setScale(pulse);
      
      // Color shifting
      const colorShift = Math.sin(time * 0.001 + index * 0.2) * 0.5 + 0.5;
      const color = COLOR_PALETTES.VAPORWAVE[Math.floor(colorShift * COLOR_PALETTES.VAPORWAVE.length)];
      particle.setTint(color);
    });
  }

  private startCreditsScroll() {
    // Auto-scroll credits
    this.tweens.add({
      targets: this.creditsContainer,
      y: -this.creditsContainer.getBounds().height - 200,
      duration: 60000, // 1 minute scroll
      ease: 'Linear',
      onComplete: () => {
        // Loop back to start
        this.creditsContainer.y = this.cameras.main.height;
        this.startCreditsScroll();
      }
    });
  }

  private setupInput() {
    // Keyboard
    this.input.keyboard?.on('keydown-ESC', () => this.closeCredits());
    
    // Mouse wheel for manual scrolling
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.creditsContainer.y -= deltaY * 0.5;
    });

    // Gamepad
    this.input.gamepad?.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
    });
  }

  private handleGamepadInput() {
    if (!this.gamepad) return;

    // B button to close
    if (this.gamepad.B && this.gamepad.B.isDown && !this.gamepad.B.pressed) {
      this.closeCredits();
    }

    // Right stick for scrolling
    const scrollSpeed = this.gamepad.axes[3].getValue();
    if (Math.abs(scrollSpeed) > 0.1) {
      this.creditsContainer.y -= scrollSpeed * 5;
    }
  }

  private closeCredits() {
    // Fade out animation
    this.tweens.add({
      targets: [this.creditsContainer, ...this.backgroundParticles],
      alpha: 0,
      duration: 500,
      ease: 'Power2.easeIn',
      onComplete: () => {
        this.scene.stop();
      }
    });
  }
}