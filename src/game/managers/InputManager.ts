import Phaser from 'phaser';
import type { InputState } from '../types/GameTypes';
import { XBOX_MAPPING, AXES } from '../utils/Constants';

export class InputManager {
  private scene: Phaser.Scene;
  private keyboard?: Phaser.Input.Keyboard.KeyboardPlugin;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { [key: string]: Phaser.Input.Keyboard.Key };
  
  private inputState: InputState = {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    dash: false,
    pause: false
  };

  private deadZone = 0.15;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupInput();
  }

  private setupInput() {
    // Keyboard setup
    this.keyboard = this.scene.input.keyboard;
    if (this.keyboard) {
      this.cursors = this.keyboard.createCursorKeys();
      this.wasd = this.keyboard.addKeys('W,S,A,D,SHIFT,SPACE,ESC') as any;
    }

    // Gamepad setup
    this.scene.input.gamepad?.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
      console.log('Gamepad connected:', pad.id);
      
      // Enable vibration if supported
      if (pad.vibration) {
        console.log('Gamepad vibration supported');
      }
    });

    this.scene.input.gamepad?.on('disconnected', () => {
      this.gamepad = undefined;
      console.log('Gamepad disconnected');
    });
  }

  update() {
    this.updateKeyboardInput();
    this.updateGamepadInput();
  }

  private updateKeyboardInput() {
    if (!this.cursors || !this.wasd) return;

    // Horizontal movement
    this.inputState.left = this.cursors.left.isDown || this.wasd.A.isDown;
    this.inputState.right = this.cursors.right.isDown || this.wasd.D.isDown;

    // Jump
    const jumpKeys = this.cursors.up.isDown || this.cursors.space.isDown || this.wasd.W.isDown || this.wasd.SPACE.isDown;
    this.inputState.jumpPressed = jumpKeys && !this.inputState.jump;
    this.inputState.jump = jumpKeys;

    // Dash
    this.inputState.dash = this.wasd.SHIFT.isDown;

    // Pause
    this.inputState.pause = this.wasd.ESC.isDown;
  }

  private updateGamepadInput() {
    if (!this.gamepad) return;

    // Left stick and D-pad for movement
    const leftStickX = this.gamepad.axes[AXES.LEFT_X].getValue();
    const dpadLeft = this.gamepad.buttons[XBOX_MAPPING.LEFT].pressed;
    const dpadRight = this.gamepad.buttons[XBOX_MAPPING.RIGHT].pressed;

    this.inputState.left = leftStickX < -this.deadZone || dpadLeft;
    this.inputState.right = leftStickX > this.deadZone || dpadRight;

    // A button for jump
    const aButton = this.gamepad.buttons[XBOX_MAPPING.A];
    this.inputState.jumpPressed = aButton.pressed && !this.inputState.jump;
    this.inputState.jump = aButton.pressed;

    // X button for dash
    this.inputState.dash = this.gamepad.buttons[XBOX_MAPPING.X].pressed;

    // Start button for pause
    this.inputState.pause = this.gamepad.buttons[XBOX_MAPPING.START].pressed;
  }

  getInputState(): InputState {
    return { ...this.inputState };
  }

  vibrate(duration: number = 200, intensity: number = 1.0) {
    if (this.gamepad?.vibration) {
      this.gamepad.vibration.playEffect('dual-rumble', {
        startDelay: 0,
        duration: duration,
        weakMagnitude: intensity * 0.5,
        strongMagnitude: intensity
      });
    }
  }

  lightVibration() {
    this.vibrate(100, 0.3);
  }

  strongVibration() {
    this.vibrate(300, 1.0);
  }

  // Check if any input device is active
  hasGamepad(): boolean {
    return this.gamepad !== undefined;
  }

  // Get analog stick values for camera control in editor
  getAnalogStick(): { x: number, y: number } {
    if (!this.gamepad) return { x: 0, y: 0 };
    
    const x = this.gamepad.axes[AXES.RIGHT_X].getValue();
    const y = this.gamepad.axes[AXES.RIGHT_Y].getValue();
    
    // Apply dead zone
    return {
      x: Math.abs(x) > this.deadZone ? x : 0,
      y: Math.abs(y) > this.deadZone ? y : 0
    };
  }
}