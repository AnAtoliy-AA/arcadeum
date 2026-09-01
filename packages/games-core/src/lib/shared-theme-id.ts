/**
 * Canonical shared visual theme identifiers used across all games.
 *
 * These map 1-to-1 with the `SHARED_THEMES` array on the web frontend
 * and `SHARED_VISUAL_THEMES` on the backend. Games should use this type
 * (or `string` for maximum flexibility) instead of maintaining their own
 * per-game visual-variant lists.
 */
export const SHARED_THEME_IDS = [
  'adventure',
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
] as const;

export type ThemeId = (typeof SHARED_THEME_IDS)[number];
