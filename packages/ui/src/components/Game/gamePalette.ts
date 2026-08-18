import type { GameVariant } from '../Button/types';

/**
 * Per-game variant colors and Tailwind background classes. Single source of
 * truth for the variant palette — GameContainer, GameLayout, Progress and
 * other consumers import from here instead of re-declaring hexes.
 *
 * Background classes are written as full string literals on purpose —
 * Tailwind's scanner only emits CSS for classes that appear verbatim in
 * source files (packages/ui/src is covered by the content globs).
 */
export const GAME_ACCENT_COLORS: Partial<Record<GameVariant, string>> = {
  cyberpunk: '#06b6d4',
  underwater: '#22d3ee',
  crime: '#dc2626',
  horror: '#10b981',
  adventure: '#f59e0b',
  'high-altitude-hike': '#38bdf8',
};

export const GAME_BG_CLASSES: Partial<Record<GameVariant, string>> = {
  cyberpunk: 'bg-[#0f0518]',
  underwater: 'bg-[#040b15]',
  crime: 'bg-[#18181b]',
  horror: 'bg-[#020617]',
  adventure: 'bg-[#451a03]',
  'high-altitude-hike': 'bg-[#020617]',
};
