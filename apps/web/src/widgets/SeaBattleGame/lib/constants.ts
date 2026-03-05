// Sea Battle game constants and configuration

// Game variants/themes
export const SEA_BATTLE_VARIANTS = [
  {
    id: 'classic',
    name: 'games.sea_battle_v1.variants.classic.name',
    description: 'games.sea_battle_v1.variants.classic.description',
    emoji: '🚢',
    gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 50%, #1abc9c 100%)',
  },
  {
    id: 'modern',
    name: 'games.sea_battle_v1.variants.modern.name',
    description: 'games.sea_battle_v1.variants.modern.description',
    emoji: '🛡️',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
  },
  {
    id: 'pixel',
    name: 'games.sea_battle_v1.variants.pixel.name',
    description: 'games.sea_battle_v1.variants.pixel.description',
    emoji: '👾',
    gradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #16a085 100%)',
  },
  {
    id: 'cartoon',
    name: 'games.sea_battle_v1.variants.cartoon.name',
    description: 'games.sea_battle_v1.variants.cartoon.description',
    emoji: '🐙',
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #d35400 100%)',
  },
  {
    id: 'cyber',
    name: 'games.sea_battle_v1.variants.cyber.name',
    description: 'games.sea_battle_v1.variants.cyber.description',
    emoji: '🧬',
    gradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 50%, #2980b9 100%)',
  },
  {
    id: 'vintage',
    name: 'games.sea_battle_v1.variants.vintage.name',
    description: 'games.sea_battle_v1.variants.vintage.description',
    emoji: '📜',
    gradient: 'linear-gradient(135deg, #d35400 0%, #e67e22 50%, #f1c40f 100%)',
  },
  {
    id: 'nebula',
    name: 'games.sea_battle_v1.variants.nebula.name',
    description: 'games.sea_battle_v1.variants.nebula.description',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #1abc9c 0%, #16a085 50%, #2c3e50 100%)',
  },
  {
    id: 'forest',
    name: 'games.sea_battle_v1.variants.forest.name',
    description: 'games.sea_battle_v1.variants.forest.description',
    emoji: '🌲',
    gradient: 'linear-gradient(135deg, #27ae60 0%, #16a085 50%, #2c3e50 100%)',
  },
  {
    id: 'sunset',
    name: 'games.sea_battle_v1.variants.sunset.name',
    description: 'games.sea_battle_v1.variants.sunset.description',
    emoji: '🌅',
    gradient: 'linear-gradient(135deg, #f1c40f 0%, #e67e22 50%, #e74c3c 100%)',
  },
  {
    id: 'monochrome',
    name: 'games.sea_battle_v1.variants.monochrome.name',
    description: 'games.sea_battle_v1.variants.monochrome.description',
    emoji: '🖤',
    gradient: 'linear-gradient(135deg, #7f8c8d 0%, #34495e 50%, #2c3e50 100%)',
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
