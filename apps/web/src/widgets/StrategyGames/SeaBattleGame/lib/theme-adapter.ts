import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { SeaBattleTheme } from './theme';

/**
 * Maps a shared visual theme (from `@/features/games/lib/shared-themes`) onto
 * the Sea Battle theme shape. Falls back to the game's own classic palette
 * when the shared theme id is unknown.
 */
export function sharedThemeToSeaBattle(theme: GameTheme): SeaBattleTheme {
  return {
    gameBackground: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    boardBackground: theme.colors.surface,
    gridColor: `${theme.colors.primary}66`,
    cellBorder: `${theme.colors.primary}aa`,
    primaryColor: theme.colors.primary,
    accentColor: theme.colors.accent,
    textColor: theme.colors.text,
    textSecondaryColor: theme.colors.textSecondary,
    borderRadius: '8px',
    shipColor: theme.colors.accent,
    hitColor: '#ef4444',
    missColor: `${theme.colors.textSecondary}88`,
    cellEmpty: theme.colors.surface,
    cellHover: `${theme.colors.primary}55`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  };
}
