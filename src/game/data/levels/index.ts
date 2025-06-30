// Level index - manages all available levels
export const LEVEL_LIST = [
  'level1',
  'level2', 
  'level3',
  'level4',
  'level5',
  'level6'
] as const;

export type LevelId = typeof LEVEL_LIST[number];

export const LEVEL_METADATA = {
  level1: {
    id: 'level1',
    name: 'Rhythm Awakening',
    description: 'Your first steps into the musical world',
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    theme: 'Synthwave'
  },
  level2: {
    id: 'level2', 
    name: 'Neon Cascade',
    description: 'Flowing melodies and cascading platforms',
    difficulty: 'Easy-Medium',
    estimatedTime: '3-4 minutes',
    theme: 'Neon Flow'
  },
  level3: {
    id: 'level3',
    name: 'Crystal Harmonics', 
    description: 'Shimmering crystals create resonant melodies',
    difficulty: 'Medium',
    estimatedTime: '4-5 minutes',
    theme: 'Crystal Cave'
  },
  level4: {
    id: 'level4',
    name: 'Cyber Storm',
    description: 'Navigate through electric storms and digital chaos',
    difficulty: 'Medium-Hard',
    estimatedTime: '5-6 minutes', 
    theme: 'Cyberpunk'
  },
  level5: {
    id: 'level5',
    name: 'Vaporwave Sunset',
    description: 'Drift through retro-futuristic landscapes',
    difficulty: 'Hard',
    estimatedTime: '6-7 minutes',
    theme: 'Vaporwave'
  },
  level6: {
    id: 'level6',
    name: 'Cosmic Finale',
    description: 'The ultimate test in the depths of space',
    difficulty: 'Expert',
    estimatedTime: '8-10 minutes',
    theme: 'Cosmic'
  }
} as const;

/**
 * Import level data using explicit imports
 */
export async function loadLevelData(levelId: LevelId) {
  try {
    let levelData;
    
    switch (levelId) {
      case 'level1':
        levelData = await import('./level1.json');
        break;
      case 'level2':
        levelData = await import('./level2.json');
        break;
      case 'level3':
        levelData = await import('./level3.json');
        break;
      case 'level4':
        levelData = await import('./level4.json');
        break;
      case 'level5':
        levelData = await import('./level5.json');
        break;
      case 'level6':
        levelData = await import('./level6.json');
        break;
      default:
        console.error(`Unknown level ID: ${levelId}`);
        return null;
    }
    
    return levelData.default;
  } catch (error) {
    console.error(`Failed to load level ${levelId}:`, error);
    return null;
  }
}

/**
 * Get level metadata without loading the full level data
 */
export function getLevelMetadata(levelId: LevelId) {
  return LEVEL_METADATA[levelId];
}

/**
 * Get the next level ID in sequence
 */
export function getNextLevelId(currentLevelId: LevelId): LevelId | null {
  const currentIndex = LEVEL_LIST.indexOf(currentLevelId);
  if (currentIndex === -1 || currentIndex === LEVEL_LIST.length - 1) {
    return null; // No next level
  }
  return LEVEL_LIST[currentIndex + 1];
}

/**
 * Get the previous level ID in sequence
 */
export function getPreviousLevelId(currentLevelId: LevelId): LevelId | null {
  const currentIndex = LEVEL_LIST.indexOf(currentLevelId);
  if (currentIndex === -1 || currentIndex === 0) {
    return null; // No previous level
  }
  return LEVEL_LIST[currentIndex - 1];
}

/**
 * Check if a level ID is valid
 */
export function isValidLevelId(levelId: string): levelId is LevelId {
  return LEVEL_LIST.includes(levelId as LevelId);
}