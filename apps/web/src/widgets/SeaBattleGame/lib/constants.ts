// Sea Battle game constants and configuration

// Game variants/themes
export const SEA_BATTLE_VARIANTS = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional battleship theme',
  },
  { id: 'modern', name: 'Modern', description: 'Modern naval warfare' },
  { id: 'pixel', name: 'Pixel Art', description: 'Retro pixel art style' },
  { id: 'cartoon', name: 'Cartoon', description: 'Fun cartoon characters' },
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
