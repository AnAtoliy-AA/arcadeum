// Sea Battle game constants and configuration

// Game variants/themes
export const SEA_BATTLE_VARIANTS = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional battleship theme',
    emoji: '🚢',
    gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 50%, #1abc9c 100%)',
  },
  {
    id: 'modern',
    name: 'Modern II',
    description: 'Modern naval warfare',
    emoji: '🚁',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
  },
  {
    id: 'pixel',
    name: 'Pixel Art',
    description: 'Retro pixel art style',
    emoji: '👾',
    gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)',
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    description: 'Fun cartoon characters',
    emoji: '🐙',
    gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
  },
] as const;

export type SeaBattleVariant = (typeof SEA_BATTLE_VARIANTS)[number]['id'];

// Default game options
export const DEFAULT_GAME_OPTIONS = {
  variant: 'classic' as SeaBattleVariant,
  showTurnTimer: false,
  turnTimeLimit: 60, // seconds
};

// Board configuration
export const BOARD_CONFIG = {
  size: 10,
  cellSize: 36, // pixels
  gap: 2, // pixels
};

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  explosion: 800,
  splash: 600,
  shipSink: 1200,
  turnTransition: 300,
};

// Colors for game elements (references to palette)
export const GAME_COLORS = {
  cellEmpty: 'var(--color-surface)',
  cellShip: 'var(--color-primary)',
  cellHit: 'var(--color-error)',
  cellMiss: 'var(--color-text-secondary)',
  cellHighlight: 'var(--color-primary-light)',
  boardGrid: 'var(--color-border)',
  boardBackground: 'var(--color-background)',
};
