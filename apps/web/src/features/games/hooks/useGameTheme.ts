import {
  getThemeById,
  SHARED_THEMES,
  type GameTheme,
} from '@/features/games/lib/shared-themes';

/**
 * Resolves a shared visual theme by id. Falls back to the first theme
 * (cyberpunk) when the id is unknown.
 */
export function useGameTheme(themeId: string | undefined | null): GameTheme {
  if (!themeId) return SHARED_THEMES[0];
  return getThemeById(themeId) ?? SHARED_THEMES[0];
}
