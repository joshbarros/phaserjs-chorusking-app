export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  PHYSICS: {
    GRAVITY: 800,
    DEBUG: false
  }
} as const;

export const PLAYER_CONFIG = {
  SPEED: 300,
  RADIUS: 16,
  JUMP_FORCE: -400,
  ACCELERATION: 0.2,
  DECELERATION: 0.1,
  AIR_CONTROL: 0.75,
  WALL_SLIDE_GRAVITY: 0.5
} as const;

export const AUDIO_CONFIG = {
  DEFAULT_BPM: 120,
  AUDIO_LATENCY: 50,
  BEAT_SUBDIVISION: 16
} as const;

export const COLORS = {
  PLAYER: 0x00ff88,
  PLATFORM: 0xff6b35,
  NOTE: 0xffff00,
  BACKGROUND: 0x1a0d40,
  UI: 0xffffff,
  ENEMY: 0xff3366,
  HAZARD: 0xff0066,
  PARTICLE: 0x00ffff,
  TRAIL: 0x88ff00,
  WALL: 0x9333ea,
  MOVING_PLATFORM: 0x06d6a0,
  BOUNCY_PLATFORM: 0xf59e0b,
  COLLECTIBLE: 0xfbbf24,
  ENEMY_PROJECTILE: 0xdc2626
} as const;

export const COLOR_PALETTES = {
  NEON: [0xff006e, 0x8338ec, 0x3a86ff, 0x06ffa5, 0xffbe0b],
  SYNTHWAVE: [0xff007f, 0xff8c00, 0xffff00, 0x00ff7f, 0x0080ff],
  CYBERPUNK: [0xff0080, 0x8000ff, 0x0080ff, 0x00ff80, 0xff8000],
  VAPORWAVE: [0xff71ce, 0x01cdfe, 0x05ffa1, 0xb967db, 0xfffb96]
} as const;

export const LAYERS = {
  BACKGROUND: 0,
  PLATFORMS: 1,
  ENTITIES: 2,
  PLAYER: 3,
  EFFECTS: 4,
  UI: 5
} as const;

export const XBOX_MAPPING = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  LS: 10,
  RS: 11,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
  XBOX: 16
} as const;

export const AXES = {
  LEFT_X: 0,
  LEFT_Y: 1,
  RIGHT_X: 2,
  RIGHT_Y: 3,
  LT: 4,
  RT: 5
} as const;