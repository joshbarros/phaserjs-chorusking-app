import Phaser from 'phaser';
import { COLORS, COLOR_PALETTES } from '../utils/Constants';
import { AudioManager } from '../managers/AudioManager';

export class SettingsScene extends Phaser.Scene {
  private settingsContainer!: Phaser.GameObjects.Container;
  private sliders: Map<string, SettingsSlider> = new Map();
  private backgroundParticles: Phaser.GameObjects.Graphics[] = [];
  private audioManager!: AudioManager;
  private selectedIndex = 0;
  private settingsItems: Phaser.GameObjects.Container[] = [];
  private gamepad?: Phaser.Input.Gamepad.Gamepad;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create our own audio manager instance
    this.audioManager = new AudioManager();

    // Semi-transparent background
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.8)');

    // Create subtle particle background
    this.createParticleBackground();

    // Main settings container
    this.settingsContainer = this.add.container(width / 2, height / 2);

    // Background panel
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.4);
    panelBg.lineStyle(2, COLORS.PARTICLE, 0.8);
    panelBg.fillRoundedRect(-300, -250, 600, 500, 20);
    panelBg.strokeRoundedRect(-300, -250, 600, 500, 20);
    this.settingsContainer.add(panelBg);

    // Title
    const title = this.add.text(0, -200, 'SETTINGS', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: COLORS.PARTICLE.toString(16),
      strokeThickness: 2
    });
    title.setOrigin(0.5);
    this.settingsContainer.add(title);

    // Create settings options
    this.createSettingsOptions();

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
    closeBtn.on('pointerdown', () => this.closeSettings());
    closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
    closeBtn.on('pointerout', () => closeBtn.setScale(1.0));

    // Instructions
    const instructions = this.add.text(width / 2, height - 40, 'ESC TO CLOSE', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888888'
    });
    instructions.setOrigin(0.5);

    // Entrance animation
    this.animateEntrance();
  }

  update() {
    this.handleGamepadInput();
    this.updateBackgroundAnimation();
  }

  private createSettingsOptions() {
    const startY = -120;
    const spacing = 80;

    // Master Volume
    this.createSliderSetting('Master Volume', 'masterVolume', 0, startY, 0, 1, 1, (value) => {
      if (this.audioManager) {
        this.audioManager.setMasterVolume(value);
      }
    });

    // Music Volume
    this.createSliderSetting('Music Volume', 'musicVolume', 0, startY + spacing, 0, 1, 0.8, (value) => {
      if (this.audioManager) {
        this.audioManager.setMusicVolume(value);
      }
    });

    // SFX Volume
    this.createSliderSetting('SFX Volume', 'sfxVolume', 0, startY + spacing * 2, 0, 1, 1, (value) => {
      if (this.audioManager) {
        this.audioManager.setSFXVolume(value);
      }
    });

    // Fullscreen toggle
    this.createToggleSetting('Fullscreen', 'fullscreen', 0, startY + spacing * 3, false, (value) => {
      if (value) {
        this.scale.startFullscreen();
      } else {
        this.scale.stopFullscreen();
      }
    });

    // Reset to defaults
    this.createButtonSetting('Reset to Defaults', 0, startY + spacing * 4, () => {
      this.resetToDefaults();
    });
  }

  private createSliderSetting(
    label: string, 
    key: string, 
    x: number, 
    y: number, 
    min: number, 
    max: number, 
    defaultValue: number,
    callback: (value: number) => void
  ) {
    const container = this.add.container(x, y);

    // Label
    const labelText = this.add.text(-200, 0, label, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    labelText.setOrigin(0, 0.5);
    container.add(labelText);

    // Value display
    const valueText = this.add.text(200, 0, Math.round(defaultValue * 100) + '%', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: COLORS.NOTE.toString(16)
    });
    valueText.setOrigin(1, 0.5);
    container.add(valueText);

    // Slider
    const slider = new SettingsSlider(this, 0, 0, 200, 4, min, max, defaultValue, (value) => {
      valueText.setText(Math.round(value * 100) + '%');
      callback(value);
    });
    container.add(slider.container);

    // Store references
    container.setData('type', 'slider');
    container.setData('slider', slider);
    container.setData('label', labelText);
    container.setData('value', valueText);

    this.sliders.set(key, slider);
    this.settingsItems.push(container);
    this.settingsContainer.add(container);
  }

  private createToggleSetting(
    label: string,
    key: string,
    x: number,
    y: number,
    defaultValue: boolean,
    callback: (value: boolean) => void
  ) {
    const container = this.add.container(x, y);

    // Label
    const labelText = this.add.text(-200, 0, label, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    labelText.setOrigin(0, 0.5);
    container.add(labelText);

    // Toggle button
    const toggleBg = this.add.graphics();
    const toggleKnob = this.add.graphics();
    
    const updateToggle = (value: boolean) => {
      toggleBg.clear();
      toggleBg.fillStyle(value ? COLORS.PLAYER : 0x666666, 1);
      toggleBg.fillRoundedRect(-20, -8, 40, 16, 8);
      
      toggleKnob.clear();
      toggleKnob.fillStyle(0xffffff, 1);
      toggleKnob.fillCircle(value ? 12 : -12, 0, 6);
    };

    updateToggle(defaultValue);
    container.add(toggleBg);
    container.add(toggleKnob);

    // Make interactive
    const toggleArea = this.add.rectangle(0, 0, 50, 30, 0x000000, 0);
    toggleArea.setInteractive();
    
    let currentValue = defaultValue;
    toggleArea.on('pointerdown', () => {
      currentValue = !currentValue;
      updateToggle(currentValue);
      callback(currentValue);
    });
    
    container.add(toggleArea);

    // Store references
    container.setData('type', 'toggle');
    container.setData('value', currentValue);
    container.setData('callback', callback);
    container.setData('updateToggle', updateToggle);

    this.settingsItems.push(container);
    this.settingsContainer.add(container);
  }

  private createButtonSetting(
    label: string,
    x: number,
    y: number,
    callback: () => void
  ) {
    const container = this.add.container(x, y);

    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(COLORS.HAZARD, 0.8);
    buttonBg.lineStyle(1, COLORS.HAZARD, 1);
    buttonBg.fillRoundedRect(-100, -15, 200, 30, 8);
    buttonBg.strokeRoundedRect(-100, -15, 200, 30, 8);
    container.add(buttonBg);

    // Button text
    const buttonText = this.add.text(0, 0, label, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // Make interactive
    const buttonArea = this.add.rectangle(0, 0, 200, 30, 0x000000, 0);
    buttonArea.setInteractive();
    buttonArea.on('pointerdown', callback);
    buttonArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(COLORS.HAZARD, 1);
      buttonBg.lineStyle(2, COLORS.HAZARD, 1);
      buttonBg.fillRoundedRect(-100, -15, 200, 30, 8);
      buttonBg.strokeRoundedRect(-100, -15, 200, 30, 8);
    });
    buttonArea.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(COLORS.HAZARD, 0.8);
      buttonBg.lineStyle(1, COLORS.HAZARD, 1);
      buttonBg.fillRoundedRect(-100, -15, 200, 30, 8);
      buttonBg.strokeRoundedRect(-100, -15, 200, 30, 8);
    });
    container.add(buttonArea);

    // Store references
    container.setData('type', 'button');
    container.setData('callback', callback);

    this.settingsItems.push(container);
    this.settingsContainer.add(container);
  }

  private createParticleBackground() {
    for (let i = 0; i < 15; i++) {
      const particle = this.add.graphics();
      const size = Phaser.Math.Between(1, 3);
      const color = COLOR_PALETTES.CYBERPUNK[i % COLOR_PALETTES.CYBERPUNK.length];
      
      particle.fillStyle(color, 0.3);
      particle.fillCircle(0, 0, size);
      
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      particle.setPosition(x, y);
      particle.setDepth(-1);
      
      this.backgroundParticles.push(particle);
      
      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-100, 100),
        y: y + Phaser.Math.Between(-50, 50),
        alpha: { from: 0.1, to: 0.5 },
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private updateBackgroundAnimation() {
    this.backgroundParticles.forEach((particle, index) => {
      const time = this.time.now;
      const pulse = 1 + Math.sin(time * 0.004 + index * 0.3) * 0.2;
      particle.setScale(pulse);
    });
  }

  private animateEntrance() {
    this.settingsContainer.setAlpha(0);
    this.settingsContainer.setScale(0.8);
    
    this.tweens.add({
      targets: this.settingsContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  private setupInput() {
    // Keyboard
    this.input.keyboard?.on('keydown-ESC', () => this.closeSettings());
    
    // Gamepad
    this.input.gamepad?.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
    });
  }

  private handleGamepadInput() {
    if (!this.gamepad) return;

    // B button to close
    if (this.gamepad.B && this.gamepad.B.isDown && !this.gamepad.B.pressed) {
      this.closeSettings();
    }
  }

  private resetToDefaults() {
    this.sliders.get('masterVolume')?.setValue(1.0);
    this.sliders.get('musicVolume')?.setValue(0.8);
    this.sliders.get('sfxVolume')?.setValue(1.0);
    
    if (this.audioManager) {
      this.audioManager.setMasterVolume(1.0);
      this.audioManager.setMusicVolume(0.8);
      this.audioManager.setSFXVolume(1.0);
    }
  }

  private closeSettings() {
    this.tweens.add({
      targets: this.settingsContainer,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 300,
      ease: 'Power2.easeIn',
      onComplete: () => {
        this.scene.stop();
      }
    });
  }
}

class SettingsSlider {
  public container: Phaser.GameObjects.Container;
  private track: Phaser.GameObjects.Graphics;
  private fill: Phaser.GameObjects.Graphics;
  private handle: Phaser.GameObjects.Graphics;
  private isDragging = false;
  private width: number;
  private min: number;
  private max: number;
  private value: number;
  private callback: (value: number) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    min: number,
    max: number,
    defaultValue: number,
    callback: (value: number) => void
  ) {
    this.width = width;
    this.min = min;
    this.max = max;
    this.value = defaultValue;
    this.callback = callback;

    this.container = scene.add.container(x, y);

    // Track
    this.track = scene.add.graphics();
    this.track.fillStyle(0x444444, 1);
    this.track.fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    this.container.add(this.track);

    // Fill
    this.fill = scene.add.graphics();
    this.container.add(this.fill);

    // Handle
    this.handle = scene.add.graphics();
    this.handle.fillStyle(0xffffff, 1);
    this.handle.fillCircle(0, 0, height + 2);
    this.container.add(this.handle);

    // Make interactive
    const hitArea = scene.add.rectangle(0, 0, width + 20, height + 20, 0x000000, 0);
    hitArea.setInteractive();
    this.container.add(hitArea);

    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.updateFromPointer(pointer);
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.updateFromPointer(pointer);
      }
    });

    scene.input.on('pointerup', () => {
      this.isDragging = false;
    });

    this.updateVisuals();
  }

  private updateFromPointer(pointer: Phaser.Input.Pointer) {
    const localX = pointer.x - this.container.x;
    const normalizedX = Phaser.Math.Clamp((localX + this.width / 2) / this.width, 0, 1);
    this.value = this.min + (this.max - this.min) * normalizedX;
    this.updateVisuals();
    this.callback(this.value);
  }

  private updateVisuals() {
    const normalizedValue = (this.value - this.min) / (this.max - this.min);
    const handleX = -this.width / 2 + normalizedValue * this.width;

    // Update fill
    this.fill.clear();
    this.fill.fillStyle(COLORS.PLAYER, 1);
    this.fill.fillRoundedRect(-this.width / 2, -2, normalizedValue * this.width, 4, 2);

    // Update handle position
    this.handle.x = handleX;
  }

  public setValue(value: number) {
    this.value = Phaser.Math.Clamp(value, this.min, this.max);
    this.updateVisuals();
    this.callback(this.value);
  }
}