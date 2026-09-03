import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export const SEA_BATTLE_THEMES = SHARED_THEMES.map((theme) => ({
  id: theme.id,
  name: theme.nameKey,
  description: theme.descriptionKey,
  emoji: theme.emoji,
  gradient: theme.gradient,
  bgImage: theme.bgImage,
  lightGradient: `linear-gradient(90deg, #fff 0%, ${theme.colors.primary} 40%, ${theme.colors.accent} 80%, #fff 100%)`,
}));

export type SeaBattleTheme = (typeof SEA_BATTLE_THEMES)[number]['id'];

export const DEFAULT_GAME_OPTIONS = {
  variant: 'cyberpunk' as SeaBattleTheme,
  showTurnTimer: false,
  turnTimeLimit: 60,
};

export const BOARD_CONFIG = {
  size: 10,
  cellSize: 36,
  gap: 2,
};

export const ANIMATION_DURATIONS = {
  explosion: 800,
  splash: 600,
  shipSink: 1200,
  turnTransition: 300,
};

export const GAME_COLORS = {
  cellEmpty: 'var(--color-surface)',
  cellShip: 'var(--color-primary)',
  cellHit: 'var(--color-error)',
  cellMiss: 'var(--color-text-secondary)',
  cellHighlight: 'var(--color-primary-light)',
  boardGrid: 'var(--color-border)',
  boardBackground: 'var(--color-background)',
};
