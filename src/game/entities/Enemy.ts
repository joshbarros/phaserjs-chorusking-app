import Phaser from 'phaser';
import { COLORS } from '../utils/Constants';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private patrolSpeed = 100;
  private direction = 1;
  private startX: number;
  private patrolDistance = 200;
  private shootTimer = 0;
  private shootInterval = 2000;
  private projectiles: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, x: number, y: number, projectileGroup: Phaser.Physics.Arcade.Group) {
    super(scene, x, y, 'enemy');
    
    this.startX = x;
    this.projectiles = projectileGroup;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    this.setCollideWorldBounds(false);
    this.setVelocityX(this.patrolSpeed * this.direction);
    this.body!.setSize(28, 24);
    this.setOrigin(0.5, 1);
    
    // Set depth
    this.setDepth(2);
    
    // Add glowing effect
    this.createGlowEffect();
  }

  update(time: number, delta: number) {
    // Patrol movement
    this.handlePatrol();
    
    // Shooting
    this.handleShooting(time);
    
    // Rotation animation
    this.rotation += 0.02;
    
    // Pulsing scale effect
    const pulse = 1 + Math.sin(time * 0.005) * 0.1;
    this.setScale(pulse);
  }

  private handlePatrol() {
    const currentX = this.x;
    
    // Check patrol boundaries
    if (currentX <= this.startX - this.patrolDistance/2) {
      this.direction = 1;
      this.setVelocityX(this.patrolSpeed * this.direction);
      this.setFlipX(false);
    } else if (currentX >= this.startX + this.patrolDistance/2) {
      this.direction = -1;
      this.setVelocityX(this.patrolSpeed * this.direction);
      this.setFlipX(true);
    }
  }

  private handleShooting(time: number) {
    if (time > this.shootTimer) {
      this.shoot();
      this.shootTimer = time + this.shootInterval;
    }
  }

  private shoot() {
    // Create projectile
    const projectile = this.projectiles.create(this.x, this.y - 10, 'projectile');
    if (projectile) {
      projectile.setVelocity(this.direction * 150, -100);
      projectile.setTint(COLORS.ENEMY_PROJECTILE);
      projectile.body.setSize(6, 6);
      
      // Auto-destroy projectile after 3 seconds
      this.scene.time.delayedCall(3000, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
      
      // Add rotation to projectile
      this.scene.tweens.add({
        targets: projectile,
        rotation: Math.PI * 4,
        duration: 3000,
        ease: 'Linear'
      });
    }
  }

  private createGlowEffect() {
    // Add a glowing particle emitter
    const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
      follow: this,
      scale: { start: 0.3, end: 0 },
      speed: { min: 20, max: 40 },
      lifespan: 500,
      quantity: 1,
      frequency: 100,
      tint: COLORS.ENEMY,
      blendMode: 'ADD'
    });
    
    // Store reference for cleanup
    this.setData('glowEmitter', emitter);
  }

  takeDamage() {
    // Create explosion effect
    const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      quantity: 20,
      tint: [COLORS.ENEMY, COLORS.PARTICLE, 0xffffff]
    });
    
    // Cleanup after explosion
    this.scene.time.delayedCall(800, () => {
      emitter.destroy();
    });
    
    // Cleanup glow emitter
    const glowEmitter = this.getData('glowEmitter');
    if (glowEmitter) {
      glowEmitter.destroy();
    }
    
    // Destroy enemy
    this.destroy();
  }

  destroy() {
    // Cleanup glow emitter
    const glowEmitter = this.getData('glowEmitter');
    if (glowEmitter) {
      glowEmitter.destroy();
    }
    super.destroy();
  }
}