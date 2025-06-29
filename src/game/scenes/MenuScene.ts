import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private selectedIndex = 0;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private gamepad?: Phaser.Input.Gamepad.Gamepad;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Game title
    const title = this.add.text(width / 2, height / 4, 'CHORUS KING', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 60, 'A Sound Shapes Clone', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#cccccc'
    });
    subtitle.setOrigin(0.5);

    // Menu options
    const menuOptions = [
      'Play Campaign',
      'Level Editor', 
      'Community Levels',
      'Settings',
      'Credits'
    ];

    const startY = height / 2 + 50;
    menuOptions.forEach((option, index) => {
      const menuItem = this.add.text(width / 2, startY + index * 50, option, {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#ffffff'
      });
      menuItem.setOrigin(0.5);
      menuItem.setInteractive();
      
      menuItem.on('pointerover', () => {
        this.selectedIndex = index;
        this.updateMenuSelection();
      });

      menuItem.on('pointerdown', () => {
        this.selectMenuItem(index);
      });

      this.menuItems.push(menuItem);
    });

    // Setup input
    this.setupInput();
    this.updateMenuSelection();

    // Add some visual flair
    this.createBackgroundAnimation();
  }

  update() {
    this.handleGamepadInput();
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
      if (!this.gamepad.up?.pressed) {
        this.navigateMenu(-1);
      }
    } else if (this.gamepad.down || this.gamepad.axes[1].getValue() > 0.5) {
      if (!this.gamepad.down?.pressed) {
        this.navigateMenu(1);
      }
    }

    // A button to select
    if (this.gamepad.A?.isDown && !this.gamepad.A.pressed) {
      this.selectMenuItem(this.selectedIndex);
    }
  }

  private navigateMenu(direction: number) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.menuItems.length);
    this.updateMenuSelection();
  }

  private updateMenuSelection() {
    this.menuItems.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.setColor('#ffff00');
        item.setScale(1.1);
      } else {
        item.setColor('#ffffff');
        item.setScale(1.0);
      }
    });
  }

  private selectMenuItem(index: number) {
    switch (index) {
      case 0: // Play Campaign
        this.scene.start('GameScene');
        break;
      case 1: // Level Editor
        this.scene.start('EditorScene');
        break;
      case 2: // Community Levels
        // TODO: Implement community levels
        console.log('Community Levels not implemented yet');
        break;
      case 3: // Settings
        // TODO: Implement settings
        console.log('Settings not implemented yet');
        break;
      case 4: // Credits
        // TODO: Implement credits
        console.log('Credits not implemented yet');
        break;
    }
  }

  private createBackgroundAnimation() {
    // Create some animated background elements
    const { width, height } = this.cameras.main;
    
    for (let i = 0; i < 20; i++) {
      const shape = this.add.graphics();
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 8);
      
      shape.fillStyle(0x333333, 0.3);
      shape.fillCircle(0, 0, size);
      shape.setPosition(x, y);
      
      // Animate the shapes
      this.tweens.add({
        targets: shape,
        y: y + Phaser.Math.Between(-50, 50),
        alpha: { from: 0.1, to: 0.5 },
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}