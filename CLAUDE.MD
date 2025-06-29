# Sound Shapes Clone - Product Requirements Document

## 1. Executive Summary

### 1.1 Product Overview
A rhythm-based platformer game inspired by Sound Shapes, where players navigate through musical levels collecting notes to build dynamic soundscapes. The game combines platforming challenges with music creation, allowing players to both play through designed levels and create their own musical experiences.

### 1.2 Target Platform
- **Primary**: Web browsers (Desktop Chrome, Firefox, Safari, Edge)
- **Secondary**: Mobile web browsers (iOS Safari, Chrome Android)
- **Engine**: PhaserJS 3.x

### 1.3 Core Value Proposition
- Seamless integration of music and gameplay
- User-generated content through level editor
- Progressive difficulty with musical rewards
- Community sharing of custom levels

## 2. Game Overview

### 2.1 Core Gameplay Loop
1. **Navigate** through 2D platforming levels
2. **Collect** musical notes placed throughout the level
3. **Avoid** hazards and enemies that move to the beat
4. **Complete** levels to unlock new worlds and creation tools
5. **Create** custom levels with the built-in editor
6. **Share** creations with the community

### 2.2 Visual Style
- **Art Direction**: Pure geometric shapes with vibrant colors
- **Aesthetic**: No sprites - only circles, squares, triangles, and polygons
- **Color Palette**: Each world has distinct color themes
- **Visual Elements**:
  - Player: Circle with trail effect
  - Platforms: Rectangles with rounded corners
  - Notes: Pulsing circles or diamonds
  - Enemies: Animated geometric shapes
- **Visual Feedback**: Shape scaling, rotation, and color shifts synchronized to music

### 2.3 Audio Design
- **Dynamic Soundtrack**: Builds as players collect notes
- **Sound Layers**: 
  - Base track (drums/rhythm)
  - Melody notes (collectibles)
  - Ambient sounds (environment)
  - SFX (jumping, death, checkpoints)
- **Beat Synchronization**: All game elements move/react to BPM

## 3. Detailed Game Mechanics

### 3.1 Player Character

#### 3.1.1 Movement
- **Horizontal Movement**: 
  - Speed: 300 pixels/second
  - Acceleration: 0.2 seconds to full speed
  - Deceleration: 0.1 seconds to stop
- **Jumping**:
  - Jump Height: Variable (hold for higher jump)
  - Min Height: 2 grid units
  - Max Height: 4 grid units
  - Air Control: 75% of ground movement speed
- **Wall Interactions**:
  - Wall Slide: 50% gravity when touching walls
  - Wall Jump: 80% horizontal, 100% vertical force

#### 3.1.2 Abilities
- **Sticky Surface Adhesion**: Stick to specially marked surfaces
- **Beat Dash**: Quick dash synchronized to beat (unlockable)
- **Echo Mode**: Leave musical trail for puzzle solving (unlockable)

### 3.2 Level Elements

#### 3.2.1 Collectibles
- **Music Notes**:
  - Types: Quarter notes, Eighth notes, Whole notes
  - Each adds a layer to the soundtrack
  - Visual: Glowing, pulsing to beat
  - Optional vs Required for progression
- **Beat Coins**:
  - Hidden collectibles for 100% completion
  - Unlock bonus content and editor assets

#### 3.2.2 Platforms
- **Static Platforms**: Standard collision surfaces
- **Moving Platforms**: Move in patterns synced to BPM
- **Disappearing Platforms**: Appear/disappear on beat
- **Bouncy Platforms**: Launch player on beat intervals
- **Sticky Surfaces**: Allow wall-crawling

#### 3.2.3 Hazards
- **Beat Hazards**: Activate on specific beats
  - Spikes: Extend/retract
  - Lasers: Fire in patterns
  - Crushers: Move vertically/horizontally
- **Enemy Types**:
  - Patrollers: Move back and forth to rhythm
  - Chasers: Follow player on beat intervals
  - Shooters: Fire projectiles on beat

#### 3.2.4 Interactive Elements
- **Switches**: Activate doors, platforms, or music changes
- **Portals**: Transport between level sections
- **Music Modifiers**: Change tempo, pitch, or instrument

### 3.3 Scoring System
- **Note Collection**: Points per note type
- **Time Bonus**: Complete level under par time
- **Death Penalty**: -10% score per death
- **Combo System**: Continuous collection multiplier
- **Perfect Run**: No deaths bonus

## 4. Level Design

### 4.1 World Structure
- **5 Main Worlds**: Each with unique theme and mechanics
  1. **Electronic Gardens**: Tutorial world, basic mechanics
  2. **Percussion Factory**: Industrial theme, timing challenges
  3. **Melody Meadows**: Nature theme, flowing platforming
  4. **Bass Depths**: Underwater theme, altered physics
  5. **Harmony Heights**: Sky theme, advanced challenges

### 4.2 Level Progression
- **10 Levels per World**
- **3 Difficulty Tiers**: 
  - Bronze: Complete level
  - Silver: Collect 75% notes
  - Gold: 100% notes + time challenge
- **Boss Levels**: Musical boss encounters every 10 levels

### 4.3 Level Editor

#### 4.3.1 Creation Tools
- **Grid System**: 32x32 pixel grid for precise placement
- **Layer System**:
  - Background layer
  - Platform layer
  - Interactive layer
  - Hazard layer
  - Music layer
- **Music Sequencer**:
  - 16-beat patterns
  - Multiple instrument tracks
  - BPM adjustment (60-180)
  - Key/scale selection

#### 4.3.2 Asset Library
- **Platforms**: 20+ types
- **Hazards**: 15+ types
- **Decorations**: 50+ visual elements
- **Sound Samples**: 100+ instruments/effects
- **Backgrounds**: 10+ themes

#### 4.3.3 Testing Tools
- **Play Mode**: Instant testing
- **Beat Visualizer**: See beat grid
- **Collision Viewer**: Debug mode
- **Path Recorder**: Create moving platform paths

### 4.4 Sharing System
- **Level Codes**: Shareable alphanumeric codes
- **Online Gallery**: Browse community creations
- **Rating System**: 5-star ratings
- **Categories**: Difficulty, style, length
- **Featured Levels**: Curated weekly selections

## 5. Technical Specifications

### 5.1 PhaserJS Implementation

#### 5.1.1 Scene Structure
```
- BootScene (Asset preloading)
- MenuScene (Main menu, options)
- WorldSelectScene
- LevelSelectScene  
- GameScene (Main gameplay)
- EditorScene (Level creator)
- PauseScene (Overlay)
- ResultsScene (Level complete)
```

#### 5.1.2 Physics Configuration
- **Arcade Physics**: For performance
- **Gravity**: 800 (adjustable per level)
- **Tile-based Collision**: Efficient detection
- **Custom Hitboxes**: Per sprite precision

### 5.2 Audio Implementation Options

#### 5.2.1 Howler.js Integration
- **Why Howler.js**: More robust audio handling than Phaser's built-in audio
- **Features to Utilize**:
  - Spatial audio for positional sounds
  - Audio sprites for efficient loading
  - Precise timing control for beat synchronization
  - Cross-browser compatibility
  - Mobile audio unlock handling

#### 5.2.2 Alternative: Tone.js
- **For Advanced Music Generation**: If you want procedural music
- **Features**:
  - Synthesizers for generating sounds
  - Sequencers for pattern-based music
  - Effects chain (reverb, delay, etc.)
  - Precise scheduling for rhythm games

#### 5.2.3 Hybrid Approach (Recommended)
- **Phaser Audio**: Basic SFX (jump, collect, menu)
- **Howler.js**: Music playback and layering
- **Web Audio API**: Direct access for visualizations

#### 5.2.4 Audio Architecture
```javascript
// Example structure
AudioManager = {
  bgmLayers: [], // Multiple music tracks
  sfxPool: {},   // Reusable sound effects
  beatSync: {    // Timing management
    bpm: 120,
    nextBeat: 0,
    subdivision: 16
  }
}
```

### 5.2 Data Management

#### 5.2.1 Save System
- **LocalStorage**: Progress, settings
- **IndexedDB**: Custom levels
- **Cloud Save**: Optional user accounts

#### 5.2.2 Level Data Format
```json
{
  "version": "1.0",
  "metadata": {
    "name": "Level Name",
    "author": "Creator",
    "bpm": 120,
    "key": "C major"
  },
  "grid": [[]],
  "entities": [],
  "music": {
    "tracks": [],
    "patterns": []
  }
}
```

### 5.3 Performance Targets
- **FPS**: Stable 60fps on mid-range devices
- **Load Time**: <3 seconds per level
- **Memory**: <200MB RAM usage
- **Battery**: Optimized for mobile play

## 6. User Interface

### 6.1 Menu System
- **Main Menu**:
  - Play Campaign
  - Level Editor
  - Community Levels
  - Settings
  - Credits

### 6.2 HUD Elements
- **Score Display**: Current points
- **Note Counter**: X/Y collected
- **Timer**: Speed run tracking
- **Beat Indicator**: Visual metronome
- **Lives/Health**: If applicable

### 6.3 Controls

#### 6.3.1 Keyboard
- **Arrow Keys/WASD**: Movement
- **Space/W/Up**: Jump
- **Shift**: Dash (when unlocked)
- **R**: Quick restart
- **ESC**: Pause menu
- **M**: Mute/unmute music
- **Enter**: Confirm in menus

#### 6.3.2 Gamepad (Xbox Series S Controller Support)
```javascript
// Gamepad mapping for Xbox controllers
const XBOX_MAPPING = {
  // Buttons
  A: 0,          // Jump
  B: 1,          // Cancel/Back in menus
  X: 2,          // Dash (when unlocked)
  Y: 3,          // Quick restart
  LB: 4,         // Previous level
  RB: 5,         // Next level
  LT: 6,         // Zoom out in editor
  RT: 7,         // Zoom in in editor
  BACK: 8,       // Return to menu
  START: 9,      // Pause
  LS: 10,        // (Left stick click) - Toggle debug
  RS: 11,        // (Right stick click) - Center camera
  UP: 12,        // Menu navigation
  DOWN: 13,      // Menu navigation
  LEFT: 14,      // Menu navigation
  RIGHT: 15,     // Menu navigation
  XBOX: 16       // Home button (if accessible)
};

// Analog sticks
const AXES = {
  LEFT_X: 0,     // Movement (-1 to 1)
  LEFT_Y: 1,     // Crouch/Look up (-1 to 1)
  RIGHT_X: 2,    // Camera pan in editor
  RIGHT_Y: 3,    // Camera pan in editor
  LT: 4,         // Analog trigger (-1 to 1)
  RT: 5          // Analog trigger (-1 to 1)
};
```

**Implementation Details**:
- **Dead Zone**: 0.15 for analog sticks
- **Vibration**: 
  - Light pulse on note collection
  - Strong burst on death
  - Rhythmic vibration on beat in certain areas
- **Button Prompts**: Automatically switch UI prompts when gamepad detected
- **Hot-Swapping**: Support switching between keyboard and gamepad mid-game
- **Multiple Controllers**: Support up to 4 controllers for future multiplayer

#### 6.3.3 Touch (Mobile)
- **Virtual Joystick**: Left side
- **Jump Button**: Right side
- **Swipe Up**: Jump alternative
- **Two-finger Tap**: Pause
- **Pinch**: Zoom in editor

### 6.4 Input System Architecture
```javascript
// Unified input handler example
class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keyboard = scene.input.keyboard;
    this.gamepad = null;
    this.touch = scene.input.touch;
    
    // State tracking
    this.actions = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      dash: false,
      pause: false
    };
  }
  
  update() {
    // Update from all input sources
    this.updateKeyboard();
    this.updateGamepad();
    this.updateTouch();
  }
}
```

## 7. Progression System

### 7.1 Unlockables
- **New Worlds**: Complete previous world
- **Editor Assets**: Find in levels
- **Music Samples**: Achievement rewards
- **Character Skins**: Collection milestones
- **Abilities**: Boss defeats

### 7.2 Achievements
- **Collector**: 100% notes in world
- **Speedrunner**: Beat time challenges
- **Creator**: Share 10 levels
- **Perfectionist**: No death full game
- **Musician**: Create popular level

## 8. Monetization (Optional)

### 8.1 Free Model
- **Full Campaign**: All 50 levels
- **Basic Editor**: Core tools
- **Community Access**: Play shared levels

### 8.2 Premium Features
- **Advanced Editor**: More assets/tools
- **Cloud Save**: Cross-device progress
- **Early Access**: New content
- **Cosmetics**: Character/UI themes
- **Ad Removal**: If applicable

## 9. Development Roadmap

### 9.1 Phase 1: Core (Months 1-3)
- Basic movement and physics
- Level loading system
- Music synchronization
- 10 tutorial levels

### 9.2 Phase 2: Content (Months 4-6)
- Full 50 level campaign
- All player abilities
- Complete enemy/hazard set
- Polish and balancing

### 9.3 Phase 3: Editor (Months 7-8)
- Level editor interface
- Saving/loading system
- Music sequencer
- Testing tools

### 9.4 Phase 4: Community (Months 9-10)
- Sharing system
- Online features
- User accounts
- Social features

### 9.5 Phase 5: Polish (Months 11-12)
- Performance optimization
- Bug fixes
- Additional content
- Marketing preparation

## 10. Success Metrics

### 10.1 Engagement KPIs
- **Daily Active Users**: Target 10k
- **Session Length**: Average 20 minutes
- **Retention**: 40% day 7, 20% day 30
- **Levels Created**: 1000+ monthly

### 10.2 Quality Metrics
- **Load Time**: <3 seconds
- **Crash Rate**: <0.1%
- **Frame Rate**: 60fps on 80% devices
- **User Rating**: 4.5+ stars

## 11. Risk Mitigation

### 11.1 Technical Risks
- **Performance**: Aggressive optimization, feature scaling
- **Browser Compatibility**: Extensive testing, polyfills
- **Audio Latency**: Multiple sync methods, calibration

### 11.2 Design Risks
- **Difficulty Curve**: Extensive playtesting
- **Tutorial Clarity**: Multiple onboarding paths
- **Editor Complexity**: Progressive disclosure

## 12. Appendices

### 12.1 Visual Asset Requirements
- **Geometric Shapes Only**:
  - No sprite images needed
  - All visuals created with Phaser.Graphics
  - Use gradients, glows, and shadows for depth
  - Particle effects using colored squares/circles

### 12.2 Shape Definitions
- **Player Character**:
  - Main: Circle (radius: 16px)
  - Trail: Fading circles or lines
  - State indicators: Color changes
  
- **Platforms**:
  - Static: Rectangles (various sizes)
  - Moving: Rectangles with motion trails
  - Bouncy: Rounded rectangles with squash/stretch
  
- **Collectibles**:
  - Notes: Pulsing circles (radius: 8-12px)
  - Beat Coins: Rotating diamonds
  - Power-ups: Triangles or stars
  
- **Enemies**:
  - Patroller: Square with eyes (two small circles)
  - Chaser: Triangle pointing at player
  - Shooter: Pentagon with rotating center

### 12.3 Visual Effects (No Sprites)
- **Particle Systems**: 
  - Death: Exploding circles
  - Collection: Radial burst of small squares
  - Trail: Fading geometric shapes
  
- **Animations**:
  - Scale tweening for pulse effects
  - Rotation for dynamic movement
  - Color lerping for state changes
  - Geometric morphing (circle to square)

### 12.4 Third-Party Dependencies
- **PhaserJS**: Game engine (required)
- **Howler.js**: Audio playback and management (recommended)
- **Optional Audio Libraries**:
  - Tone.js: For procedural music generation
  - Pizzicato.js: Lightweight audio effects
- **LocalForage**: Storage abstraction
- **No Image Assets Required**: Everything rendered programmatically

## 13. Implementation Guide for Claude Code

### 13.1 Project Structure
```
sound-shapes-clone/
├── index.html
├── src/
│   ├── main.js           // Phaser game config
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   ├── EditorScene.js
│   │   └── PauseScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Platform.js
│   │   ├── Note.js
│   │   └── Enemy.js
│   ├── managers/
│   │   ├── InputManager.js
│   │   ├── AudioManager.js
│   │   ├── LevelManager.js
│   │   └── SaveManager.js
│   └── utils/
│       ├── GeometryFactory.js
│       ├── BeatSync.js
│       └── Constants.js
└── assets/
    └── audio/
        ├── music/
        └── sfx/
```

### 13.2 Core Implementation Steps

#### Step 1: Basic Setup
1. Initialize Phaser with arcade physics
2. Set up scene flow
3. Create geometric shape factories
4. Implement input manager with gamepad support

#### Step 2: Player Implementation
1. Create player as Phaser.Graphics circle
2. Implement physics body
3. Add movement with acceleration
4. Implement variable jump
5. Add trail effect

#### Step 3: Level System
1. Create tile-based level loader
2. Implement platform generation
3. Add note placement system
4. Create beat-synced hazards

#### Step 4: Audio System
1. Set up Howler.js
2. Create audio manager
3. Implement beat detection
4. Add layer system for dynamic music

#### Step 5: Game Polish
1. Add particle effects
2. Implement UI/HUD
3. Create menu system
4. Add gamepad vibration

### 13.3 Key Code Snippets to Start

```javascript
// Game config
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  input: {
    gamepad: true
  },
  scene: [BootScene, MenuScene, GameScene]
};

// Geometric player creation
createPlayer() {
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
  
  this.player = this.physics.add.sprite(100, 400, 'player');
}

// Gamepad detection
setupGamepad() {
  this.input.gamepad.once('connected', pad => {
    this.gamepad = pad;
    console.log('Xbox controller connected');
  });
}
```

### 13.4 Critical Implementation Notes

1. **Phaser Version**: Use Phaser 3.70.0 or later for best gamepad support
2. **Audio Timing**: Account for ~50ms audio latency in beat sync
3. **Performance**: Limit particle effects on mobile
4. **Geometric Rendering**: Cache generated textures for repeated shapes
5. **Level Data**: Use JSON for easy level editing/sharing
