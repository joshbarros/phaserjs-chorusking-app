import Phaser from 'phaser';
import type { InputState } from '../types/GameTypes';
import { PLAYER_CONFIG, COLORS } from '../utils/Constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private inputState: InputState = {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    dash: false,
    pause: false
  };

  private isGrounded = false;
  private isTouchingWall = false;
  private wallSide = 0; // -1 for left wall, 1 for right wall
  private jumpBufferTime = 0;
  private coyoteTime = 0;
  private trail: Phaser.GameObjects.Graphics[] = [];
  private trailLength = 10;

  // Player abilities
  private abilities = {
    wallSlide: true,
    wallJump: true,
    beatDash: false,
    echoMode: false
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics body
    this.setCollideWorldBounds(true);
    this.setBounce(0, 0);
    this.setDragX(800); // Ground friction
    this.setMaxVelocity(PLAYER_CONFIG.SPEED, 1000);
    
    // Set up body size
    this.body!.setSize(PLAYER_CONFIG.RADIUS * 2, PLAYER_CONFIG.RADIUS * 2);
    this.setOrigin(0.5, 0.5);
    
    // Create visual trail effect
    this.createTrail();
    
    // Set depth for layering
    this.setDepth(3);
  }

  update(time: number, delta: number, inputState: InputState) {
    this.inputState = inputState;
    
    // Update timers
    this.updateTimers(delta);
    
    // Check ground and wall contact
    this.checkContacts();
    
    // Handle movement
    this.handleHorizontalMovement();
    this.handleJumping();
    this.handleWallInteractions();
    
    // Update visual effects
    this.updateTrail();
    this.updateAnimation();
  }

  private updateTimers(delta: number) {
    // Jump buffer timer
    if (this.inputState.jumpPressed) {
      this.jumpBufferTime = 150; // 150ms buffer
    } else if (this.jumpBufferTime > 0) {
      this.jumpBufferTime -= delta;
    }
    
    // Coyote time timer
    if (this.isGrounded) {
      this.coyoteTime = 100; // 100ms coyote time
    } else if (this.coyoteTime > 0) {
      this.coyoteTime -= delta;
    }
  }

  private checkContacts() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Check if grounded
    this.isGrounded = body.touching.down || body.blocked.down;
    
    // Check wall contact
    this.isTouchingWall = body.touching.left || body.touching.right || body.blocked.left || body.blocked.right;
    
    if (body.touching.left || body.blocked.left) {
      this.wallSide = -1;
    } else if (body.touching.right || body.blocked.right) {
      this.wallSide = 1;
    } else {
      this.wallSide = 0;
    }
  }

  private handleHorizontalMovement() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    let targetVelocityX = 0;
    
    if (this.inputState.left) {
      targetVelocityX = -PLAYER_CONFIG.SPEED;
    } else if (this.inputState.right) {
      targetVelocityX = PLAYER_CONFIG.SPEED;
    }
    
    // Apply air control when not grounded
    if (!this.isGrounded) {
      targetVelocityX *= PLAYER_CONFIG.AIR_CONTROL;
    }
    
    // Smooth acceleration/deceleration
    const currentVelocityX = body.velocity.x;
    const acceleration = this.isGrounded ? PLAYER_CONFIG.ACCELERATION : PLAYER_CONFIG.ACCELERATION * 0.5;
    
    if (targetVelocityX !== 0) {
      // Accelerating
      const newVelocityX = Phaser.Math.Linear(currentVelocityX, targetVelocityX, acceleration);
      this.setVelocityX(newVelocityX);
    } else if (this.isGrounded) {
      // Decelerating on ground
      const newVelocityX = Phaser.Math.Linear(currentVelocityX, 0, PLAYER_CONFIG.DECELERATION);
      this.setVelocityX(Math.abs(newVelocityX) < 10 ? 0 : newVelocityX);
    }
  }

  private handleJumping() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Variable height jumping
    if (this.inputState.jump && body.velocity.y < 0) {
      // Continue jumping while holding jump and moving upward
      this.setVelocityY(body.velocity.y * 0.98);
    } else if (!this.inputState.jump && body.velocity.y < -100) {
      // Cut jump short if button released
      this.setVelocityY(body.velocity.y * 0.5);
    }
    
    // Jump initiation
    if (this.jumpBufferTime > 0 && (this.coyoteTime > 0 || this.isGrounded)) {
      this.jump();
      this.jumpBufferTime = 0;
      this.coyoteTime = 0;
    }
  }

  private handleWallInteractions() {
    if (!this.abilities.wallSlide) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Wall sliding
    if (this.isTouchingWall && !this.isGrounded && body.velocity.y > 0) {
      const slidingInput = (this.wallSide === -1 && this.inputState.left) || 
                          (this.wallSide === 1 && this.inputState.right);
      
      if (slidingInput) {
        // Apply wall slide gravity reduction
        this.setVelocityY(Math.min(body.velocity.y, 100)); // Max slide speed
      }
      
      // Wall jumping
      if (this.abilities.wallJump && this.jumpBufferTime > 0) {
        this.wallJump();
        this.jumpBufferTime = 0;
      }
    }
  }

  private jump() {
    this.setVelocityY(PLAYER_CONFIG.JUMP_FORCE);
    
    // Play jump sound
    const audioManager = (this.scene as any).audioManager;
    if (audioManager) {
      audioManager.playSFX('jump');
    }
    
    // Visual feedback
    this.createJumpEffect();
  }

  private wallJump() {
    const horizontalForce = this.wallSide * -300; // Push away from wall
    const verticalForce = PLAYER_CONFIG.JUMP_FORCE * 0.8; // Slightly lower than normal jump
    
    this.setVelocity(horizontalForce, verticalForce);
    
    // Play jump sound
    const audioManager = (this.scene as any).audioManager;
    if (audioManager) {
      audioManager.playSFX('jump');
    }
    
    // Visual feedback
    this.createWallJumpEffect();
  }

  private createJumpEffect() {
    // Create a small burst of particles at player's feet
    const emitter = this.scene.add.particles(this.x, this.y + PLAYER_CONFIG.RADIUS, 'player', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 300,
      quantity: 5,
      tint: COLORS.PLAYER
    });
    
    // Clean up after animation
    this.scene.time.delayedCall(500, () => {
      emitter.destroy();
    });
  }

  private createWallJumpEffect() {
    // Create particles coming off the wall
    const offsetX = this.wallSide * PLAYER_CONFIG.RADIUS;
    const emitter = this.scene.add.particles(this.x + offsetX, this.y, 'player', {
      speed: { min: 80, max: 150 },
      scale: { start: 0.4, end: 0 },
      lifespan: 400,
      quantity: 8,
      angle: { min: this.wallSide === -1 ? 0 : 90, max: this.wallSide === -1 ? 90 : 180 },
      tint: 0xffffff
    });
    
    // Clean up after animation
    this.scene.time.delayedCall(600, () => {
      emitter.destroy();
    });
  }

  private createTrail() {
    // Initialize trail segments
    for (let i = 0; i < this.trailLength; i++) {
      const trailSegment = this.scene.add.graphics();
      trailSegment.setDepth(2); // Behind player
      this.trail.push(trailSegment);
    }
  }

  private updateTrail() {
    // Update trail positions
    for (let i = this.trail.length - 1; i > 0; i--) {
      const current = this.trail[i];
      const previous = this.trail[i - 1];
      current.x = previous.x;
      current.y = previous.y;
    }
    
    // Update first trail segment to player position
    if (this.trail.length > 0) {
      this.trail[0].x = this.x;
      this.trail[0].y = this.y;
    }
    
    // Redraw all trail segments
    this.trail.forEach((segment, index) => {
      segment.clear();
      const alpha = (this.trailLength - index) / this.trailLength * 0.3;
      const radius = PLAYER_CONFIG.RADIUS * (alpha * 2);
      
      segment.fillStyle(COLORS.TRAIL, alpha);
      segment.fillCircle(0, 0, radius);
    });
  }

  private updateAnimation() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Scale based on velocity for squash and stretch effect
    const velocityScale = Math.abs(body.velocity.x) / PLAYER_CONFIG.SPEED;
    const scaleX = 1 + velocityScale * 0.1;
    const scaleY = 1 - velocityScale * 0.05;
    
    this.setScale(scaleX, scaleY);
    
    // Rotate slightly based on movement
    const rotation = body.velocity.x / PLAYER_CONFIG.SPEED * 0.1;
    this.setRotation(rotation);
    
    // Change color based on state with more vibrant colors
    if (this.isTouchingWall && !this.isGrounded) {
      this.setTint(COLORS.PARTICLE); // Cyan when wall sliding
    } else if (!this.isGrounded) {
      this.setTint(COLORS.NOTE); // Yellow when in air
    } else {
      this.setTint(COLORS.PLAYER); // Green when grounded
    }
  }

  // Public methods for external access
  getIsGrounded(): boolean {
    return this.isGrounded;
  }

  getIsTouchingWall(): boolean {
    return this.isTouchingWall;
  }

  takeDamage() {
    // Play death sound
    const audioManager = (this.scene as any).audioManager;
    if (audioManager) {
      audioManager.playSFX('death');
    }
    
    // Death effect
    this.createDeathEffect();
    
    // Reset to spawn position or restart level
    this.respawn();
  }

  private createDeathEffect() {
    // Create explosion effect
    const emitter = this.scene.add.particles(this.x, this.y, 'player', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      quantity: 15,
      tint: [0xff0000, 0xff8800, 0xffff00]
    });
    
    // Clean up after animation
    this.scene.time.delayedCall(800, () => {
      emitter.destroy();
    });
  }

  private respawn() {
    // For now, just reset position
    this.setPosition(100, 400);
    this.setVelocity(0, 0);
  }

  // Clean up when player is destroyed
  destroy() {
    this.trail.forEach(segment => segment.destroy());
    this.trail = [];
    super.destroy();
  }
}