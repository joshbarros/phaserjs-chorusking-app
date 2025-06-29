import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { COLORS, COLOR_PALETTES } from '../utils/Constants';

export class DemoScene extends Phaser.Scene {
  private demoPlayer!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private notes!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  
  private aiInputs = {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    dash: false,
    pause: false
  };
  
  private aiState = {
    targetX: 0,
    targetY: 0,
    action: 'patrol' as 'patrol' | 'jump' | 'collect' | 'avoid',
    nextActionTime: 0,
    patrolDirection: 1
  };

  private backgroundElements: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'DemoScene' });
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    
    // Create animated background
    this.createAnimatedBackground();
    
    // Create physics groups
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group();
    this.notes = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    
    // Create demo level
    this.createDemoLevel();
    
    // Create AI player
    this.demoPlayer = new Player(this, 100, 400);
    
    // Set up collisions
    this.setupCollisions();
    
    // Set up camera
    this.cameras.main.startFollow(this.demoPlayer);
    this.cameras.main.setLerp(0.05, 0.05);
    this.cameras.main.setBounds(0, 0, 2000, 720);
    this.cameras.main.setZoom(1.2);
  }

  update(time: number, delta: number) {
    // Update AI behavior
    this.updateAI(time);
    
    // Update player with AI inputs
    this.demoPlayer.update(time, delta, this.aiInputs);
    
    // Update enemies
    this.enemies.children.entries.forEach(enemy => {
      if (enemy instanceof Enemy) {
        enemy.update(time, delta);
      }
    });
    
    // Update background animation
    this.updateBackgroundAnimation(time);
    
    // Update moving platforms
    this.updateMovingPlatforms();
    
    // Respawn if player falls
    if (this.demoPlayer.y > 800) {
      this.respawnPlayer();
    }
  }

  private updateAI(time: number) {
    if (time > this.aiState.nextActionTime) {
      this.chooseNextAction(time);
    }
    
    this.executeCurrentAction();
  }

  private chooseNextAction(time: number) {
    const playerX = this.demoPlayer.x;
    const playerY = this.demoPlayer.y;
    
    // Find nearest note
    const nearestNote = this.findNearestNote(playerX, playerY);
    
    // Find nearest enemy
    const nearestEnemy = this.findNearestEnemy(playerX, playerY);
    
    // Decision making
    if (nearestEnemy && Math.abs(nearestEnemy.x - playerX) < 150) {
      // Avoid enemy or jump on it
      if (nearestEnemy.y > playerY) {
        this.aiState.action = 'jump';
        this.aiState.targetX = nearestEnemy.x;
      } else {
        this.aiState.action = 'avoid';
        this.aiState.targetX = playerX + (playerX > nearestEnemy.x ? 100 : -100);
      }
    } else if (nearestNote && Math.abs(nearestNote.x - playerX) < 200) {
      // Collect note
      this.aiState.action = 'collect';
      this.aiState.targetX = nearestNote.x;
      this.aiState.targetY = nearestNote.y;
    } else {
      // Patrol
      this.aiState.action = 'patrol';
      this.aiState.targetX = playerX + (this.aiState.patrolDirection * 150);
    }
    
    // Set next action time
    this.aiState.nextActionTime = time + Phaser.Math.Between(500, 2000);
  }

  private executeCurrentAction() {
    const playerX = this.demoPlayer.x;
    const playerY = this.demoPlayer.y;
    
    // Reset inputs
    this.aiInputs.left = false;
    this.aiInputs.right = false;
    this.aiInputs.jumpPressed = false;
    
    switch (this.aiState.action) {
      case 'patrol':
        if (Math.abs(playerX - this.aiState.targetX) > 20) {
          if (playerX < this.aiState.targetX) {
            this.aiInputs.right = true;
          } else {
            this.aiInputs.left = true;
          }
        } else {
          this.aiState.patrolDirection *= -1;
        }
        
        // Jump over obstacles
        if (this.shouldJump()) {
          this.aiInputs.jumpPressed = true;
          this.aiInputs.jump = true;
        }
        break;
        
      case 'collect':
        // Move towards note
        if (Math.abs(playerX - this.aiState.targetX) > 10) {
          if (playerX < this.aiState.targetX) {
            this.aiInputs.right = true;
          } else {
            this.aiInputs.left = true;
          }
        }
        
        // Jump to reach note
        if (playerY > this.aiState.targetY + 50) {
          this.aiInputs.jumpPressed = true;
          this.aiInputs.jump = true;
        }
        break;
        
      case 'jump':
        // Move towards target and jump
        if (Math.abs(playerX - this.aiState.targetX) > 10) {
          if (playerX < this.aiState.targetX) {
            this.aiInputs.right = true;
          } else {
            this.aiInputs.left = true;
          }
        }
        this.aiInputs.jumpPressed = true;
        this.aiInputs.jump = true;
        break;
        
      case 'avoid':
        // Move away from danger
        if (Math.abs(playerX - this.aiState.targetX) > 20) {
          if (playerX < this.aiState.targetX) {
            this.aiInputs.right = true;
          } else {
            this.aiInputs.left = true;
          }
        }
        break;
    }
    
    // Stop jump after brief time
    setTimeout(() => {
      this.aiInputs.jump = false;
    }, 100);
  }

  private shouldJump(): boolean {
    // Simple obstacle detection - check for platforms ahead
    const playerX = this.demoPlayer.x;
    const playerY = this.demoPlayer.y;
    const direction = this.aiInputs.right ? 1 : -1;
    
    // Check if there's a gap ahead
    const checkX = playerX + (direction * 80);
    const groundY = this.findGroundLevel(checkX);
    
    return groundY > playerY + 100; // Jump if there's a gap or high platform
  }

  private findGroundLevel(x: number): number {
    // Find the highest platform at this X position
    let highestY = 720; // Ground level
    
    this.platforms.children.entries.forEach(platform => {
      const sprite = platform as Phaser.Physics.Arcade.Sprite;
      if (Math.abs(sprite.x - x) < 50) {
        highestY = Math.min(highestY, sprite.y);
      }
    });
    
    return highestY;
  }

  private findNearestNote(x: number, y: number): Phaser.Physics.Arcade.Sprite | null {
    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let minDistance = Infinity;
    
    this.notes.children.entries.forEach(note => {
      const sprite = note as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(x, y, sprite.x, sprite.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = sprite;
      }
    });
    
    return nearest;
  }

  private findNearestEnemy(x: number, y: number): Enemy | null {
    let nearest: Enemy | null = null;
    let minDistance = Infinity;
    
    this.enemies.children.entries.forEach(enemy => {
      if (enemy instanceof Enemy) {
        const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = enemy;
        }
      }
    });
    
    return nearest;
  }

  private respawnPlayer() {
    this.demoPlayer.setPosition(100, 400);
    this.demoPlayer.setVelocity(0, 0);
  }

  private createDemoLevel() {
    const { height } = this.cameras.main;
    const levelWidth = 2000;
    
    // Create ground
    for (let x = 0; x < levelWidth; x += 64) {
      const platform = this.platforms.create(x, height - 32, 'platform');
      platform.setOrigin(0, 0);
      platform.setTint(COLOR_PALETTES.NEON[Math.floor(x / 64) % COLOR_PALETTES.NEON.length]);
      platform.refreshBody();
    }
    
    // Create floating platforms
    const platformData = [
      { x: 200, y: 500, color: COLOR_PALETTES.SYNTHWAVE[0] },
      { x: 400, y: 400, color: COLOR_PALETTES.SYNTHWAVE[1] },
      { x: 600, y: 300, color: COLOR_PALETTES.SYNTHWAVE[2] },
      { x: 800, y: 450, color: COLOR_PALETTES.SYNTHWAVE[3] },
      { x: 1000, y: 350, color: COLOR_PALETTES.SYNTHWAVE[4] },
      { x: 1200, y: 250, color: COLOR_PALETTES.CYBERPUNK[0] },
      { x: 1400, y: 400, color: COLOR_PALETTES.CYBERPUNK[1] },
      { x: 1600, y: 200, color: COLOR_PALETTES.CYBERPUNK[2] }
    ];
    
    platformData.forEach(data => {
      const platform = this.platforms.create(data.x, data.y, 'platform');
      platform.setOrigin(0, 0);
      platform.setTint(data.color);
      platform.refreshBody();
    });
    
    // Create moving platforms
    const movingPlatform = this.movingPlatforms.create(700, 200, 'movingPlatform');
    movingPlatform.setOrigin(0, 0);
    movingPlatform.setTint(COLORS.MOVING_PLATFORM);
    movingPlatform.body.setVelocityX(50);
    movingPlatform.setData('startX', 700);
    movingPlatform.setData('endX', 900);
    movingPlatform.setData('direction', 1);
    
    // Create notes
    const notePositions = [
      { x: 150, y: 450 }, { x: 250, y: 400 }, { x: 450, y: 350 },
      { x: 650, y: 250 }, { x: 850, y: 400 }, { x: 1050, y: 300 },
      { x: 1250, y: 200 }, { x: 1450, y: 350 }, { x: 1650, y: 150 }
    ];
    
    notePositions.forEach((pos, index) => {
      const note = this.notes.create(pos.x, pos.y, 'note');
      note.setOrigin(0.5);
      note.body.setSize(20, 20);
      note.setTint(COLOR_PALETTES.NEON[index % COLOR_PALETTES.NEON.length]);
      
      // Add animation
      this.tweens.add({
        targets: note,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 600 + (index * 100),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
    
    // Create enemies
    const enemyPositions = [
      { x: 500, y: 468 },
      { x: 1100, y: 318 },
      { x: 1700, y: 368 }
    ];
    
    enemyPositions.forEach(pos => {
      const enemy = new Enemy(this, pos.x, pos.y, this.projectiles);
      this.enemies.add(enemy);
    });
  }

  private createAnimatedBackground() {
    for (let i = 0; i < 30; i++) {
      const shape = this.add.graphics();
      const x = Phaser.Math.Between(-100, 2100);
      const y = Phaser.Math.Between(-100, 820);
      const size = Phaser.Math.Between(1, 3);
      const color = COLOR_PALETTES.VAPORWAVE[i % COLOR_PALETTES.VAPORWAVE.length];
      
      shape.fillStyle(color, 0.1);
      shape.fillCircle(0, 0, size);
      shape.setPosition(x, y);
      shape.setDepth(-1);
      
      this.backgroundElements.push(shape);
      
      this.tweens.add({
        targets: shape,
        x: x + Phaser.Math.Between(-150, 150),
        y: y + Phaser.Math.Between(-100, 100),
        alpha: { from: 0.05, to: 0.2 },
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private updateBackgroundAnimation(time: number) {
    this.backgroundElements.forEach((element, index) => {
      const pulse = 1 + Math.sin(time * 0.002 + index * 0.1) * 0.3;
      element.setScale(pulse);
    });
  }

  private updateMovingPlatforms() {
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

  private setupCollisions() {
    this.physics.add.collider(this.demoPlayer, this.platforms);
    this.physics.add.collider(this.demoPlayer, this.movingPlatforms);
    
    this.physics.add.overlap(this.demoPlayer, this.notes, (player, note) => {
      note.destroy();
      
      // Create collection effect
      const emitter = this.add.particles(note.x, note.y, 'particle', {
        speed: { min: 80, max: 150 },
        scale: { start: 0.4, end: 0 },
        lifespan: 400,
        quantity: 6,
        tint: [COLORS.NOTE, COLORS.PARTICLE]
      });
      
      this.time.delayedCall(500, () => {
        emitter.destroy();
      });
    });
    
    this.physics.add.overlap(this.demoPlayer, this.enemies, (player, enemy) => {
      if (this.demoPlayer.body!.touching.down && (enemy as Enemy).body!.touching.up) {
        (enemy as Enemy).takeDamage();
        this.demoPlayer.setVelocityY(-300);
      } else {
        this.respawnPlayer();
      }
    });
    
    this.physics.add.overlap(this.demoPlayer, this.projectiles, () => {
      this.respawnPlayer();
    });
  }
}