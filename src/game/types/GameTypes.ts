export interface LevelData {
  version: string;
  metadata: {
    name: string;
    author: string;
    bpm: number;
    key: string;
  };
  grid: number[][];
  entities: EntityData[];
  music: {
    tracks: string[];
    patterns: PatternData[];
  };
}

export interface EntityData {
  type: 'platform' | 'note' | 'enemy' | 'hazard';
  x: number;
  y: number;
  width?: number;
  height?: number;
  properties?: Record<string, any>;
}

export interface PatternData {
  track: number;
  beats: boolean[];
  instrument: string;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  dash: boolean;
  pause: boolean;
}

export interface AudioLayer {
  name: string;
  sound: any; // Using any instead of Howl to avoid circular import
  volume: number;
  active: boolean;
}

export interface BeatSyncData {
  bpm: number;
  nextBeat: number;
  currentBeat: number;
  subdivision: number;
  timeSignature: number;
}

export type SceneKey = 
  | 'BootScene' 
  | 'MenuScene' 
  | 'GameScene' 
  | 'EditorScene' 
  | 'PauseScene' 
  | 'ResultsScene';

export interface GameStats {
  score: number;
  notesCollected: number;
  totalNotes: number;
  deaths: number;
  timeElapsed: number;
  combo: number;
}

export interface PlayerAbilities {
  wallSlide: boolean;
  wallJump: boolean;
  beatDash: boolean;
  echoMode: boolean;
}