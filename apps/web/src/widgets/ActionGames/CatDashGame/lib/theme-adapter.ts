import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { CatDashThemeTokens } from './theme';

export function sharedThemeToCatDash(theme: GameTheme): CatDashThemeTokens {
  return {
    background: theme.colors.background,
    track: theme.colors.surface,
    trackBorder: theme.colors.border,
    normalSpace: `${theme.colors.surface}`,
    obstacleSpace: '#dc2626',
    bonusSpace: '#f59e0b',
    forkSpace: theme.colors.highlight,
    player: theme.colors.playerPalette[0] ?? theme.colors.primary,
    playerBorder: theme.colors.glow,
    dice: theme.colors.playerPalette[0] ?? theme.colors.primary,
    diceBorder: theme.colors.glow,
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    bgImage: theme.bgImage,
  };
}
