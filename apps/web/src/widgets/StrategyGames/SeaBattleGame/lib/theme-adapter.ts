import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { SeaBattleTheme } from './theme';

export function sharedThemeToSeaBattle(theme: GameTheme): SeaBattleTheme {
  return {
    gameBackground: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    boardBackground: `rgba(${hexToRgb(theme.colors.surface)}, 0.85)`,
    gridColor: theme.colors.border,
    cellBorder: theme.colors.border,
    primaryColor: theme.colors.primary,
    accentColor: theme.colors.accent,
    textColor: theme.colors.text,
    textSecondaryColor: theme.colors.textSecondary,
    borderRadius: '8px',
    shipColor: theme.colors.playerPalette[0] ?? theme.colors.primary,
    hitColor: '#ef4444',
    missColor: `rgba(${hexToRgb(theme.colors.muted)}, 0.6)`,
    cellEmpty: `rgba(${hexToRgb(theme.colors.surface)}, 0.7)`,
    cellHover: `rgba(${hexToRgb(theme.colors.glow)}, 0.3)`,
    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4)`,
    bgImage: theme.bgImage,
    teamPalette: theme.colors.teamPalette,
    playerPalette: theme.colors.playerPalette,
  };
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const value =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return '15, 23, 42';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
