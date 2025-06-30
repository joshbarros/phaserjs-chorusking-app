import Phaser from 'phaser';
import { InputManager } from '../managers/InputManager';
import { AudioManager } from '../managers/AudioManager';
import { LevelLoader } from '../managers/LevelLoader';
import type { LevelData } from '../managers/LevelLoader';
import { Player } from '../entities/Player';
import { COLORS } from '../utils/Constants';

export class NewGameScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private audioManager!: AudioManager;
  private levelLoader!: LevelLoader;
  private player!: Player;
  
  // Physics groups
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private bouncyPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private notes!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  
  // Game state
  private score = 0;
  private notesCollected = 0;
  private totalNotes = 0;
  private currentLevel = 'level1';
  private levelData: LevelData | null = null;
  private isInitialized = false;
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private notesText!: Phaser.GameObjects.Text;
  private levelNameText!: Phaser.GameObjects.Text;
  
  // Visual effects
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private comboMultiplier = 1;
  private comboTimer = 0;

  constructor() {
    super({ key: 'NewGameScene' });
  }

  create() {
    // Initialize managers immediately  
    this.inputManager = new InputManager(this);
    this.audioManager = new AudioManager();
    this.levelLoader = new LevelLoader(this);
    
    // Set background color
    this.cameras.main.setBackgroundColor('#000012');
    
    // Show loading indicator
    const loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Loading Level...',
      {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5);
    
    // Load level data asynchronously but don't block create
    this.loadAndSetupLevel(loadingText);
  }
  
  private async loadAndSetupLevel(loadingText: Phaser.GameObjects.Text) {
    try {
      console.log('Loading level:', this.currentLevel);
      
      // Load level data asynchronously
      this.levelData = await this.levelLoader.loadLevel(this.currentLevel as any);
      if (!this.levelData) {
        console.error('Failed to load level:', this.currentLevel);
        loadingText.setText('Failed to load level!');
        return;
      }
      
      console.log('Level data loaded successfully:', this.levelData.name);

      // Remove loading text
      loadingText.destroy();
      
      // Create level background
      this.levelLoader.createBackground(this.levelData);
      
      // Create physics groups
      this.createPhysicsGroups();
      
      // Create level elements using LevelLoader
      this.levelLoader.createPlatforms(
        this.levelData,
        this.platforms,
        this.movingPlatforms,
        this.bouncyPlatforms
      );
      
      this.levelLoader.createNotes(this.levelData, this.notes);
      this.levelLoader.createHazards(this.levelData, this.hazards);
      
      // Create player at spawn point
      const spawnPoint = this.levelData.player.spawn;
      this.player = new Player(this, spawnPoint.x, spawnPoint.y);
      
      // Setup camera with level configuration
      this.levelLoader.setupCamera(this.levelData, this.cameras.main, this.player);
      
      // Set up collisions
      this.setupCollisions();
      
      // Set up enhanced UI
      this.setupEnhancedUI();
      
      // Create particle system
      this.setupParticleSystem();
      
      // Start enhanced audio
      this.audioManager.startBackgroundMusic();
      
      // Set total notes for level
      this.totalNotes = this.levelData.notes.length;
      
      // Setup input handlers
      this.setupInputHandlers();
      
      // Add level intro animation
      this.playLevelIntro();
      
      // Mark as initialized
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Error loading level:', error);
      loadingText.setText('Error loading level!');
    }
  }

  private createPhysicsGroups() {
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group();
    this.bouncyPlatforms = this.physics.add.staticGroup();
    this.notes = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.hazards = this.physics.add.staticGroup();
  }

  private setupCollisions() {
    // Player vs platforms
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    
    // Enhanced bouncy platform collision
    this.physics.add.collider(this.player, this.bouncyPlatforms, (player, platform) => {
      if (this.player.body!.touching.down) {
        this.player.setVelocityY(-700); // Super jump
        this.audioManager.playSFX('bounce', 1.0);
        
        // Enhanced visual effects
        this.cameras.main.shake(120, 0.02);
        this.createBounceEffect(this.player.x, this.player.y + 16);
        
        // Screen flash effect
        this.cameras.main.flash(100, 255, 255, 0, false);
      }
    });
    
    // Player vs notes with enhanced effects
    this.physics.add.overlap(this.player, this.notes, (player, note) => {
      this.collectNoteEnhanced(note as Phaser.Physics.Arcade.Sprite);
    });
    
    // Player vs hazards
    this.physics.add.overlap(this.player, this.hazards, () => {
      this.playerTakeDamage();
    });
  }

  private setupEnhancedUI() {
    const { width, height } = this.cameras.main;
    
    // Create modern UI panel with fixed positioning
    const uiPanel = this.add.graphics();
    uiPanel.setScrollFactor(0, 0);
    uiPanel.setDepth(100);
    uiPanel.fillStyle(0x000000, 0.7);
    uiPanel.fillRoundedRect(10, 10, 300, 120, 10);
    uiPanel.lineStyle(2, COLORS.PARTICLE, 0.8);
    uiPanel.strokeRoundedRect(10, 10, 300, 120, 10);

    // Level name
    this.levelNameText = this.add.text(20, 25, this.levelData?.name || 'Unknown Level', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: COLORS.NOTE.toString(16),
      fontStyle: 'bold'
    });
    this.levelNameText.setScrollFactor(0, 0);
    this.levelNameText.setDepth(101);

    // Score with glow effect
    this.scoreText = this.add.text(20, 50, `Score: ${this.score}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: COLORS.PLAYER.toString(16),
      strokeThickness: 1
    });
    this.scoreText.setScrollFactor(0, 0);
    this.scoreText.setDepth(101);

    // Notes counter with progress bar
    this.notesText = this.add.text(20, 75, `Notes: ${this.notesCollected}/${this.totalNotes}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.notesText.setScrollFactor(0, 0);
    this.notesText.setDepth(101);

    // Progress bar
    const progressBg = this.add.graphics();
    progressBg.setScrollFactor(0, 0);
    progressBg.setDepth(101);
    progressBg.fillStyle(0x333333, 1);
    progressBg.fillRoundedRect(20, 95, 200, 8, 4);

    const progressFill = this.add.graphics();
    progressFill.setScrollFactor(0, 0);
    progressFill.setDepth(102);
    progressFill.setData('bg', progressBg);

    // Combo multiplier display
    const comboText = this.add.text(width - 20, 30, '', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: COLORS.TRAIL.toString(16),
      fontStyle: 'bold'
    });
    comboText.setOrigin(1, 0);
    comboText.setScrollFactor(0, 0);
    comboText.setDepth(101);
    comboText.setData('comboText', true);

    // Instructions with modern styling
    this.add.text(width / 2, height - 40, 'ESC: Menu • WASD/Arrows: Move • Space: Jump', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888888'
    }).setOrigin(0.5).setScrollFactor(0, 0).setDepth(101);
  }

  private setupParticleSystem() {
    // Create reusable particle emitter
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      lifespan: 500,
      quantity: 0,
      frequency: -1
    });
    this.particles.setDepth(50);
  }

  private setupInputHandlers() {
    // Enhanced escape key handler
    this.input.keyboard?.on('keydown-ESC', () => {
      this.pauseGame();
    });

    // Debug keys
    this.input.keyboard?.on('keydown-R', () => {
      this.restartLevel();
    });
  }

  private playLevelIntro() {
    // Level name animation
    this.levelNameText.setAlpha(0);
    this.levelNameText.setScale(1.5);
    
    this.tweens.add({
      targets: this.levelNameText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Camera intro sweep
    const originalZoom = this.cameras.main.zoom;
    this.cameras.main.setZoom(0.8);
    
    this.tweens.add({
      targets: this.cameras.main,
      zoom: originalZoom,
      duration: 2000,
      ease: 'Power2.easeOut'
    });
  }

  update(time: number, delta: number) {
    // Safety check - ensure scene is fully initialized
    if (!this.isInitialized || !this.inputManager || !this.audioManager || !this.player) {
      return;
    }
    
    // Update managers
    this.inputManager.update();
    this.audioManager.update();
    
    // Update player
    this.player.update(time, delta, this.inputManager.getInputState());
    
    // Update moving platforms
    this.updateMovingPlatforms();
    
    // Update combo system
    this.updateComboSystem(delta);
    
    // Update progress bar
    this.updateProgressBar();
    
    // Check level completion
    if (this.notesCollected >= this.totalNotes) {
      this.completeLevel();
    }
  }

  private updateMovingPlatforms() {
    this.movingPlatforms.children.entries.forEach(platform => {
      const sprite = platform as Phaser.Physics.Arcade.Sprite;
      const startX = sprite.getData('startX');
      const endX = sprite.getData('endX');
      const direction = sprite.getData('direction');
      
      if (direction === 1 && sprite.x >= endX) {
        sprite.setData('direction', -1);
        if (sprite.body && 'setVelocityX' in sprite.body) {
          (sprite.body as Phaser.Physics.Arcade.Body).setVelocityX(-50);
        }
      } else if (direction === -1 && sprite.x <= startX) {
        sprite.setData('direction', 1);
        if (sprite.body && 'setVelocityX' in sprite.body) {
          (sprite.body as Phaser.Physics.Arcade.Body).setVelocityX(50);
        }
      }
    });
  }

  private updateComboSystem(delta: number) {
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboMultiplier = 1;
        this.updateComboDisplay();
      }
    }
  }

  private updateProgressBar() {
    const progress = this.notesCollected / this.totalNotes;
    
    // Find and update progress bar
    const progressFill = this.children.list.find(child => 
      child instanceof Phaser.GameObjects.Graphics && child.getData('bg')
    ) as Phaser.GameObjects.Graphics;
    
    if (progressFill) {
      progressFill.clear();
      progressFill.fillStyle(COLORS.NOTE, 1);
      progressFill.fillRoundedRect(20, 95, 200 * progress, 8, 4);
    }
  }

  private collectNoteEnhanced(note: Phaser.Physics.Arcade.Sprite) {
    const noteData = {
      pitch: note.getData('pitch'),
      type: note.getData('type')
    };
    
    // Increase combo
    if (this.comboTimer > 0) {
      this.comboMultiplier = Math.min(this.comboMultiplier + 1, 10);
    } else {
      this.comboMultiplier = 2;
    }
    this.comboTimer = 2000; // 2 seconds
    
    // Calculate score with combo
    const baseScore = 100;
    const comboScore = baseScore * this.comboMultiplier;
    this.score += comboScore;
    this.notesCollected++;
    
    // Enhanced audio feedback
    this.audioManager.playSFX('note', 0.8);
    
    // Visual effects
    this.createNoteCollectionEffect(note.x, note.y, comboScore);
    this.cameras.main.shake(60, 0.008);
    
    // Update UI
    this.updateUI();
    this.updateComboDisplay();
    
    // Destroy note
    note.destroy();
  }

  private createNoteCollectionEffect(x: number, y: number, score: number) {
    // Particle burst
    this.particles.setPosition(x, y);
    this.particles.explode(12, x, y);
    
    // Score popup
    const scorePopup = this.add.text(x, y - 30, `+${score}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: COLORS.NOTE.toString(16),
      fontStyle: 'bold'
    });
    scorePopup.setOrigin(0.5);
    scorePopup.setDepth(80);
    
    this.tweens.add({
      targets: scorePopup,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2.easeOut',
      onComplete: () => scorePopup.destroy()
    });
    
    // Screen flash for high combos
    if (this.comboMultiplier >= 5) {
      this.cameras.main.flash(50, 255, 255, 0, false);
    }
  }

  private createBounceEffect(x: number, y: number) {
    // Ring effect
    const ring = this.add.graphics();
    ring.lineStyle(4, COLORS.BOUNCY_PLATFORM, 1);
    ring.strokeCircle(0, 0, 10);
    ring.setPosition(x, y);
    ring.setDepth(60);
    
    this.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Power2.easeOut',
      onComplete: () => ring.destroy()
    });
    
    // Particle burst
    this.particles.setPosition(x, y);
    this.particles.explode(15, x, y);
  }

  private playerTakeDamage() {
    this.player.takeDamage();
    
    // Enhanced damage effects
    this.cameras.main.shake(200, 0.04);
    this.cameras.main.flash(150, 255, 0, 0, false);
    
    // Reset combo
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.updateComboDisplay();
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.notesText.setText(`Notes: ${this.notesCollected}/${this.totalNotes}`);
  }

  private updateComboDisplay() {
    const comboText = this.children.list.find(child => 
      child instanceof Phaser.GameObjects.Text && child.getData('comboText')
    ) as Phaser.GameObjects.Text;
    
    if (comboText) {
      if (this.comboMultiplier > 1) {
        comboText.setText(`${this.comboMultiplier}x COMBO!`);
        comboText.setVisible(true);
        
        // Pulse animation
        this.tweens.killTweensOf(comboText);
        this.tweens.add({
          targets: comboText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          ease: 'Power2.easeOut'
        });
      } else {
        comboText.setVisible(false);
      }
    }
  }

  private completeLevel() {
    // Level completion effects
    this.cameras.main.flash(300, 0, 255, 0, false);
    
    const completionText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'LEVEL COMPLETE!',
      {
        fontSize: '48px',
        fontFamily: 'monospace',
        color: COLORS.NOTE.toString(16),
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    completionText.setOrigin(0.5);
    completionText.setScrollFactor(0);
    completionText.setDepth(150);
    
    // Animate completion text
    completionText.setScale(0);
    this.tweens.add({
      targets: completionText,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Return to menu after delay
    this.time.delayedCall(3000, () => {
      this.scene.start('DemoScene');
      this.scene.launch('MenuScene');
    });
  }

  private pauseGame() {
    try {
      // Stop all tweens and timers to prevent conflicts
      this.tweens.killAll();
      this.time.removeAllEvents();
      
      // Stop audio cleanly
      if (this.audioManager) {
        this.audioManager.stopAll();
      }
      
      // Clean scene transition
      this.scene.stop();
      this.scene.start('DemoScene');
      this.scene.launch('MenuScene');
    } catch (error) {
      console.error('Error during pause:', error);
      // Fallback - force restart to menu
      this.scene.start('MenuScene');
    }
  }

  private restartLevel() {
    this.scene.restart();
  }
}