/**
 * Shared visual themes shared across all games. These are pure visual skins
 * (card backs, board palettes, backgrounds) and are deliberately separate
 * from game-specific rule variants (modes).
 */
export const SHARED_VISUAL_THEMES = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
  'random',
] as const;

export type SharedVisualTheme = (typeof SHARED_VISUAL_THEMES)[number];
