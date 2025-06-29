import Phaser from 'phaser';
import { InputManager } from '../managers/InputManager';
import { AudioManager } from '../managers/AudioManager';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { GAME_CONFIG, COLORS, COLOR_PALETTES } from '../utils/Constants';

export class GameScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private audioManager!: AudioManager;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private bouncyPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private notes!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  
  private score = 0;
  private notesCollected = 0;
  private totalNotes = 0;
  private backgroundElements: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize managers
    this.inputManager = new InputManager(this);
    this.audioManager = new AudioManager();
    
    // Set background color
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    
    // Create animated background
    this.createAnimatedBackground();
    
    // Create physics groups
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group();
    this.bouncyPlatforms = this.physics.add.staticGroup();
    this.notes = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.hazards = this.physics.add.staticGroup();
    
    // Create a colorful level
    this.createColorfulLevel();
    
    // Create player
    this.player = new Player(this, 100, 400);
    
    // Set up collisions
    this.setupCollisions();
    
    // Set up UI
    this.setupUI();
    
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setLerp(0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 720);
    
    // Start background music
    this.audioManager.startBackgroundMusic();
    
    // Escape key to return to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  update(time: number, delta: number) {
    this.inputManager.update();
    this.player.update(time, delta, this.inputManager.getInputState());
    
    // Update enemies
    this.enemies.children.entries.forEach(enemy => {
      if (enemy instanceof Enemy) {
        enemy.update(time, delta);
      }
    });
    
    // Update audio manager
    this.audioManager.update();
    
    // Update background animation
    this.updateBackgroundAnimation(time);
    
    // Update moving platforms
    this.updateMovingPlatforms(time);
  }

  private createColorfulLevel() {
    const { height } = this.cameras.main;
    const levelWidth = 3000;
    
    // Create colorful ground platforms
    for (let x = 0; x < levelWidth; x += 64) {
      const platform = this.platforms.create(x, height - 32, 'platform');
      platform.setOrigin(0, 0);
      platform.setTint(COLOR_PALETTES.NEON[x % COLOR_PALETTES.NEON.length]);
      platform.refreshBody();
    }
    
    // Create varied floating platforms with different types
    const platformData = [
      // Regular platforms
      { x: 200, y: 500, type: 'platform', color: COLOR_PALETTES.SYNTHWAVE[0] },
      { x: 400, y: 400, type: 'platform', color: COLOR_PALETTES.SYNTHWAVE[1] },
      { x: 600, y: 300, type: 'platform', color: COLOR_PALETTES.SYNTHWAVE[2] },
      { x: 800, y: 450, type: 'platform', color: COLOR_PALETTES.SYNTHWAVE[3] },
      { x: 1000, y: 350, type: 'platform', color: COLOR_PALETTES.SYNTHWAVE[4] },
      { x: 1200, y: 250, type: 'platform', color: COLOR_PALETTES.CYBERPUNK[0] },
      { x: 1400, y: 400, type: 'platform', color: COLOR_PALETTES.CYBERPUNK[1] },
      { x: 1600, y: 200, type: 'platform', color: COLOR_PALETTES.CYBERPUNK[2] },
      { x: 1800, y: 350, type: 'platform', color: COLOR_PALETTES.CYBERPUNK[3] },
      { x: 2000, y: 300, type: 'platform', color: COLOR_PALETTES.VAPORWAVE[0] },
      { x: 2200, y: 180, type: 'platform', color: COLOR_PALETTES.VAPORWAVE[1] },
      { x: 2400, y: 380, type: 'platform', color: COLOR_PALETTES.VAPORWAVE[2] },
      { x: 2600, y: 280, type: 'platform', color: COLOR_PALETTES.VAPORWAVE[3] },
      
      // Bouncy platforms
      { x: 500, y: 550, type: 'bouncy', color: COLORS.BOUNCY_PLATFORM },
      { x: 900, y: 500, type: 'bouncy', color: COLORS.BOUNCY_PLATFORM },
      { x: 1300, y: 450, type: 'bouncy', color: COLORS.BOUNCY_PLATFORM },
      { x: 1700, y: 500, type: 'bouncy', color: COLORS.BOUNCY_PLATFORM },
      { x: 2100, y: 450, type: 'bouncy', color: COLORS.BOUNCY_PLATFORM },
    ];
    
    platformData.forEach(data => {
      let platform;
      if (data.type === 'bouncy') {
        platform = this.bouncyPlatforms.create(data.x, data.y, 'bouncyPlatform');
      } else {
        platform = this.platforms.create(data.x, data.y, 'platform');
      }
      platform.setOrigin(0, 0);
      platform.setTint(data.color);
      platform.refreshBody();
    });
    
    // Create moving platforms
    const movingPlatformData = [
      { x: 700, y: 200, endX: 900, color: COLORS.MOVING_PLATFORM },
      { x: 1100, y: 150, endX: 1300, color: COLORS.MOVING_PLATFORM },
      { x: 1500, y: 100, endX: 1700, color: COLORS.MOVING_PLATFORM },
      { x: 1900, y: 200, endX: 2100, color: COLORS.MOVING_PLATFORM },
      { x: 2300, y: 150, endX: 2500, color: COLORS.MOVING_PLATFORM }
    ];
    
    movingPlatformData.forEach(data => {
      const platform = this.movingPlatforms.create(data.x, data.y, 'movingPlatform');
      platform.setOrigin(0, 0);
      platform.setTint(data.color);
      platform.body.setVelocityX(50);
      platform.setData('startX', data.x);
      platform.setData('endX', data.endX);
      platform.setData('direction', 1);
    });
    
    // Create colorful notes with different shapes
    const notePositions = [
      { x: 150, y: 450 }, { x: 250, y: 450 }, { x: 450, y: 350 },
      { x: 650, y: 250 }, { x: 850, y: 400 }, { x: 1050, y: 300 },
      { x: 1250, y: 200 }, { x: 1450, y: 350 }, { x: 1650, y: 150 },
      { x: 1850, y: 300 }, { x: 2050, y: 250 }, { x: 2250, y: 130 },
      { x: 2450, y: 330 }, { x: 2650, y: 230 }, { x: 2850, y: 400 }
    ];
    
    notePositions.forEach((pos, index) => {
      const note = this.notes.create(pos.x, pos.y, 'note');
      note.setOrigin(0.5);
      note.body.setSize(20, 20);
      note.setTint(COLOR_PALETTES.NEON[index % COLOR_PALETTES.NEON.length]);
      
      // Add pulsing animation with different timings
      this.tweens.add({
        targets: note,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 400 + (index * 50),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Add floating animation
      this.tweens.add({
        targets: note,
        y: pos.y - 20,
        duration: 1000 + (index * 100),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
    
    // Create enemies
    const enemyPositions = [
      { x: 300, y: 468 },
      { x: 750, y: 418 },
      { x: 1150, y: 318 },
      { x: 1550, y: 368 },
      { x: 1950, y: 318 },
      { x: 2350, y: 348 }
    ];
    
    enemyPositions.forEach(pos => {
      const enemy = new Enemy(this, pos.x, pos.y, this.projectiles);
      this.enemies.add(enemy);
    });
    
    // Create hazards
    const hazardPositions = [
      { x: 350, y: 600 },
      { x: 550, y: 600 },
      { x: 1050, y: 600 },
      { x: 1450, y: 600 },
      { x: 1850, y: 600 },
      { x: 2250, y: 600 }
    ];
    
    hazardPositions.forEach(pos => {
      const hazard = this.hazards.create(pos.x, pos.y, 'hazard');
      hazard.setOrigin(0.5);
      hazard.setTint(COLORS.HAZARD);
      hazard.refreshBody();
      
      // Add spinning animation
      this.tweens.add({
        targets: hazard,
        rotation: Math.PI * 2,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
      
      // Add pulsing glow
      this.tweens.add({
        targets: hazard,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
    
    this.totalNotes = notePositions.length;
  }

  private setupCollisions() {
    // Player vs platforms
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.player, this.bouncyPlatforms, (player, platform) => {
      if (this.player.body!.touching.down) {
        this.player.setVelocityY(-600); // Super jump from bouncy platforms
        this.audioManager.playSFX('jump', 0.8);
      }
    });
    
    // Player vs notes
    this.physics.add.overlap(this.player, this.notes, (player, note) => {
      this.collectNote(note as Phaser.Physics.Arcade.Sprite);
    });
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.playerHitEnemy(enemy as Enemy);
    });
    
    // Player vs projectiles
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
      this.playerHitProjectile(projectile as Phaser.Physics.Arcade.Sprite);
    });
    
    // Player vs hazards
    this.physics.add.overlap(this.player, this.hazards, () => {
      this.player.takeDamage();
    });
    
    // Projectiles vs platforms
    this.physics.add.collider(this.projectiles, this.platforms, (projectile) => {
      projectile.destroy();
    });
    this.physics.add.collider(this.projectiles, this.movingPlatforms, (projectile) => {
      projectile.destroy();
    });
  }

  private collectNote(note: Phaser.Physics.Arcade.Sprite) {
    note.destroy();
    this.notesCollected++;
    this.score += 100;
    
    // Play collection sound (placeholder)
    console.log('Note collected!', this.notesCollected, '/', this.totalNotes);
    
    // Update UI
    this.updateUI();
    
    // Check if level complete
    if (this.notesCollected >= this.totalNotes) {
      this.completeLevel();
    }
  }

  private setupUI() {
    // Score text
    this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setScrollFactor(0);
    
    // Notes counter
    this.add.text(20, 50, `Notes: ${this.notesCollected}/${this.totalNotes}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setScrollFactor(0);
    
    // Instructions
    this.add.text(20, this.cameras.main.height - 80, 'WASD/Arrow Keys: Move', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#cccccc'
    }).setScrollFactor(0);
    
    this.add.text(20, this.cameras.main.height - 60, 'Space: Jump', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#cccccc'
    }).setScrollFactor(0);
    
    this.add.text(20, this.cameras.main.height - 40, 'ESC: Return to Menu', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#cccccc'
    }).setScrollFactor(0);
  }

  private updateUI() {
    // Find and update UI elements
    const children = this.children.list;
    
    // Update score
    const scoreText = children.find(child => 
      child instanceof Phaser.GameObjects.Text && 
      child.text.startsWith('Score:')
    ) as Phaser.GameObjects.Text;
    if (scoreText) {
      scoreText.setText(`Score: ${this.score}`);
    }
    
    // Update notes counter
    const notesText = children.find(child => 
      child instanceof Phaser.GameObjects.Text && 
      child.text.startsWith('Notes:')
    ) as Phaser.GameObjects.Text;
    if (notesText) {
      notesText.setText(`Notes: ${this.notesCollected}/${this.totalNotes}`);
    }
  }

  private createAnimatedBackground() {
    // Create animated background elements
    for (let i = 0; i < 50; i++) {
      const shape = this.add.graphics();
      const x = Phaser.Math.Between(-100, 3100);
      const y = Phaser.Math.Between(-100, 820);
      const size = Phaser.Math.Between(1, 4);
      const color = COLOR_PALETTES.VAPORWAVE[i % COLOR_PALETTES.VAPORWAVE.length];
      
      shape.fillStyle(color, 0.1);
      shape.fillCircle(0, 0, size);
      shape.setPosition(x, y);
      shape.setDepth(-1);
      
      this.backgroundElements.push(shape);
      
      // Animate the shapes
      this.tweens.add({
        targets: shape,
        x: x + Phaser.Math.Between(-200, 200),
        y: y + Phaser.Math.Between(-100, 100),
        alpha: { from: 0.05, to: 0.3 },
        duration: Phaser.Math.Between(3000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private updateBackgroundAnimation(time: number) {
    // Pulse background elements to the beat
    this.backgroundElements.forEach((element, index) => {
      const pulse = 1 + Math.sin(time * 0.003 + index * 0.1) * 0.2;
      element.setScale(pulse);
    });
  }

  private updateMovingPlatforms(time: number) {
    this.movingPlatforms.children.entries.forEach(platform => {
      const sprite = platform as Phaser.Physics.Arcade.Sprite;
      const startX = sprite.getData('startX');
      const endX = sprite.getData('endX');
      const direction = sprite.getData('direction');
      
      if (direction === 1 && sprite.x >= endX) {
        sprite.setData('direction', -1);
        sprite.body!.setVelocityX(-50);
      } else if (direction === -1 && sprite.x <= startX) {
        sprite.setData('direction', 1);
        sprite.body!.setVelocityX(50);
      }
    });
  }

  private playerHitEnemy(enemy: Enemy) {
    // Check if player is above enemy (jumping on it)
    if (this.player.body!.touching.down && enemy.body!.touching.up) {
      enemy.takeDamage();
      this.player.setVelocityY(-300); // Bounce off enemy
      this.score += 200;
      this.audioManager.playSFX('note', 0.7);
      this.updateUI();
    } else {
      this.player.takeDamage();
    }
  }

  private playerHitProjectile(projectile: Phaser.Physics.Arcade.Sprite) {
    projectile.destroy();
    this.player.takeDamage();
  }

  private completeLevel() {
    // Show completion message
    const { width, height } = this.cameras.main;
    
    const completionText = this.add.text(width / 2, height / 2, 'LEVEL COMPLETE!', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    completionText.setOrigin(0.5);
    completionText.setScrollFactor(0);
    
    const scoreText = this.add.text(width / 2, height / 2 + 60, `Final Score: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);
    
    const continueText = this.add.text(width / 2, height / 2 + 100, 'Press SPACE to continue', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#cccccc'
    });
    continueText.setOrigin(0.5);
    continueText.setScrollFactor(0);
    
    // Flash the continue text
    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Listen for space key to return to menu
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });
  }
}