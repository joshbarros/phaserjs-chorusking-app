import Phaser from 'phaser';
import { COLORS, COLOR_PALETTES } from '../utils/Constants';

export class MenuScene extends Phaser.Scene {
  private selectedIndex = 0;
  private menuItems: Phaser.GameObjects.Container[] = [];
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private menuContainer!: Phaser.GameObjects.Container;
  private titleContainer!: Phaser.GameObjects.Container;
  private backgroundParticles: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Set transparent background so demo shows through
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.4)');

    // Create main menu container with glassmorphism background
    this.menuContainer = this.add.container(width / 2, height / 2);
    
    // Background panel
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.3);
    panelBg.lineStyle(2, COLORS.PARTICLE, 0.8);
    panelBg.fillRoundedRect(-250, -200, 500, 400, 20);
    panelBg.strokeRoundedRect(-250, -200, 500, 400, 20);
    this.menuContainer.add(panelBg);

    // Create title with animated effects
    this.createAnimatedTitle();

    // Create modern menu items
    this.createModernMenu();

    // Setup input
    this.setupInput();
    this.updateMenuSelection();

    // Create floating UI elements
    this.createFloatingElements();

    // Add entrance animation
    this.animateMenuEntrance();
  }

  private createAnimatedTitle() {
    const { width, height } = this.cameras.main;
    
    this.titleContainer = this.add.container(width / 2, height / 4);

    // Main title with glow effect
    const titleBg = this.add.graphics();
    titleBg.fillStyle(COLORS.PLAYER, 0.1);
    titleBg.fillRoundedRect(-150, -40, 300, 80, 10);
    this.titleContainer.add(titleBg);

    const title = this.add.text(0, -10, 'CHORUS KING', {
      fontSize: '42px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: COLORS.PLAYER.toString(16),
      strokeThickness: 3
    });
    title.setOrigin(0.5);
    this.titleContainer.add(title);

    // Subtitle with typewriter effect
    const subtitle = this.add.text(0, 30, 'A SOUND SHAPES CLONE', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: COLORS.PARTICLE.toString(16),
      letterSpacing: 2
    });
    subtitle.setOrigin(0.5);
    this.titleContainer.add(subtitle);

    // Animated accent lines
    const leftLine = this.add.graphics();
    leftLine.lineStyle(2, COLORS.NOTE, 1);
    leftLine.lineBetween(-120, 50, -80, 50);
    this.titleContainer.add(leftLine);

    const rightLine = this.add.graphics();
    rightLine.lineStyle(2, COLORS.NOTE, 1);
    rightLine.lineBetween(80, 50, 120, 50);
    this.titleContainer.add(rightLine);

    // Pulsing glow animation
    this.tweens.add({
      targets: titleBg,
      alpha: { from: 0.1, to: 0.3 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createModernMenu() {
    const menuOptions = [
      { text: 'PLAY CAMPAIGN', icon: '▶', color: COLORS.PLAYER },
      { text: 'SETTINGS', icon: '⚙', color: COLORS.PARTICLE },
      { text: 'CREDITS', icon: 'ℹ', color: COLORS.TRAIL }
    ];

    const startY = -80;
    menuOptions.forEach((option, index) => {
      const itemContainer = this.add.container(0, startY + index * 60);
      
      // Background for menu item
      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x000000, 0.2);
      itemBg.lineStyle(1, option.color, 0.5);
      itemBg.fillRoundedRect(-180, -20, 360, 40, 8);
      itemBg.strokeRoundedRect(-180, -20, 360, 40, 8);
      itemContainer.add(itemBg);

      // Icon
      const icon = this.add.text(-150, 0, option.icon, {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: option.color.toString(16)
      });
      icon.setOrigin(0.5);
      itemContainer.add(icon);

      // Menu text
      const text = this.add.text(-20, 0, option.text, {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ffffff',
        letterSpacing: 1
      });
      text.setOrigin(0, 0.5);
      itemContainer.add(text);

      // Selection indicator
      const selector = this.add.graphics();
      selector.fillStyle(option.color, 0.8);
      selector.fillTriangle(160, -8, 160, 8, 175, 0);
      selector.setAlpha(0);
      itemContainer.add(selector);

      // Store references
      itemContainer.setData('bg', itemBg);
      itemContainer.setData('text', text);
      itemContainer.setData('icon', icon);
      itemContainer.setData('selector', selector);
      itemContainer.setData('color', option.color);

      // Interactive behavior
      itemContainer.setSize(360, 40);
      itemContainer.setInteractive();
      
      itemContainer.on('pointerover', () => {
        this.selectedIndex = index;
        this.updateMenuSelection();
      });

      itemContainer.on('pointerdown', () => {
        this.selectMenuItem(index);
      });

      this.menuItems.push(itemContainer);
      this.menuContainer.add(itemContainer);
    });
  }

  private createFloatingElements() {
    const { width, height } = this.cameras.main;

    // Audio unlock hint
    const audioHint = this.add.text(width - 20, height - 20, 'CLICK TO UNLOCK AUDIO', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: COLORS.NOTE.toString(16)
    }).setOrigin(1, 1);

    // Controls hint
    const controlsHint = this.add.text(20, height - 60, 'WASD/ARROWS: MOVE  SPACE: JUMP  GAMEPAD SUPPORTED', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#888888'
    }).setOrigin(0, 1);

    // Version info
    const version = this.add.text(20, height - 20, 'v1.0.0', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#666666'
    }).setOrigin(0, 1);

    // Hide audio hint after interaction
    const hideHint = () => {
      audioHint.destroy();
      this.input.off('pointerdown', hideHint);
    };
    this.input.once('pointerdown', hideHint);
  }

  private animateMenuEntrance() {
    // Animate title entrance
    this.titleContainer.setAlpha(0);
    this.titleContainer.setScale(0.8);
    this.tweens.add({
      targets: this.titleContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: 'Back.easeOut'
    });

    // Animate menu container
    this.menuContainer.setAlpha(0);
    this.menuContainer.setY(this.menuContainer.y + 50);
    this.tweens.add({
      targets: this.menuContainer,
      alpha: 1,
      y: this.menuContainer.y - 50,
      duration: 1000,
      delay: 200,
      ease: 'Power2.easeOut'
    });

    // Animate menu items with stagger
    this.menuItems.forEach((item, index) => {
      item.setAlpha(0);
      item.setX(item.x - 50);
      this.tweens.add({
        targets: item,
        alpha: 1,
        x: item.x + 50,
        duration: 600,
        delay: 400 + (index * 100),
        ease: 'Power2.easeOut'
      });
    });
  }

  update() {
    this.handleGamepadInput();
    this.updateBackgroundAnimation();
  }

  private updateBackgroundAnimation() {
    // Update particle movements
    this.backgroundParticles.forEach((particle, index) => {
      const time = this.time.now;
      const pulse = 1 + Math.sin(time * 0.003 + index * 0.2) * 0.2;
      particle.setScale(pulse);
    });
  }

  private setupInput() {
    // Keyboard input
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys('W,S,A,D,ENTER,SPACE') as any;

    cursors?.up.on('down', () => this.navigateMenu(-1));
    cursors?.down.on('down', () => this.navigateMenu(1));
    cursors?.space.on('down', () => this.selectMenuItem(this.selectedIndex));
    wasd?.W.on('down', () => this.navigateMenu(-1));
    wasd?.S.on('down', () => this.navigateMenu(1));
    wasd?.ENTER.on('down', () => this.selectMenuItem(this.selectedIndex));

    // Gamepad detection
    this.input.gamepad?.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
      console.log('Gamepad connected:', pad.id);
    });
  }

  private handleGamepadInput() {
    if (!this.gamepad) return;

    // D-pad or left stick navigation
    if (this.gamepad.up || this.gamepad.axes[1].getValue() < -0.5) {
      if (!this.gamepad.up || !this.gamepad.up.pressed) {
        this.navigateMenu(-1);
      }
    } else if (this.gamepad.down || this.gamepad.axes[1].getValue() > 0.5) {
      if (!this.gamepad.down || !this.gamepad.down.pressed) {
        this.navigateMenu(1);
      }
    }

    // A button to select
    if (this.gamepad.A && this.gamepad.A.isDown && !this.gamepad.A.pressed) {
      this.selectMenuItem(this.selectedIndex);
    }
  }

  private navigateMenu(direction: number) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.menuItems.length);
    this.updateMenuSelection();
  }

  private updateMenuSelection() {
    if (!this.menuItems || this.menuItems.length === 0) {
      return;
    }
    
    this.menuItems.forEach((item, index) => {
      if (!item) return;
      
      const bg = item.getData('bg') as Phaser.GameObjects.Graphics;
      const text = item.getData('text') as Phaser.GameObjects.Text;
      const icon = item.getData('icon') as Phaser.GameObjects.Text;
      const selector = item.getData('selector') as Phaser.GameObjects.Graphics;
      const color = item.getData('color') as number;

      // Safety checks
      if (!bg || !text || !icon || !selector || !color) {
        console.warn('Menu item missing data:', { bg: !!bg, text: !!text, icon: !!icon, selector: !!selector, color: !!color });
        return;
      }

      if (index === this.selectedIndex) {
        // Selected state
        bg.clear();
        bg.fillStyle(color, 0.2);
        bg.lineStyle(2, color, 1);
        bg.fillRoundedRect(-180, -20, 360, 40, 8);
        bg.strokeRoundedRect(-180, -20, 360, 40, 8);
        
        text.setColor('#ffffff');
        icon.setScale(1.2);
        selector.setAlpha(1);
        
        // Scale animation
        this.tweens.killTweensOf(item);
        this.tweens.add({
          targets: item,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      } else {
        // Normal state
        bg.clear();
        bg.fillStyle(0x000000, 0.2);
        bg.lineStyle(1, color, 0.5);
        bg.fillRoundedRect(-180, -20, 360, 40, 8);
        bg.strokeRoundedRect(-180, -20, 360, 40, 8);
        
        text.setColor('#cccccc');
        icon.setScale(1.0);
        selector.setAlpha(0);
        
        // Return to normal scale
        this.tweens.killTweensOf(item);
        this.tweens.add({
          targets: item,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      }
    });
  }

  private selectMenuItem(index: number) {
    // Selection feedback
    const selectedItem = this.menuItems[index];
    
    this.tweens.add({
      targets: selectedItem,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2.easeOut'
    });

    switch (index) {
      case 0: // Play Campaign
        // Stop demo scene and start game
        this.scene.stop('DemoScene');
        this.scene.start('NewGameScene');
        break;
      case 1: // Settings
        this.scene.launch('SettingsScene');
        break;
      case 2: // Credits
        this.scene.launch('CreditsScene');
        break;
    }
  }
}