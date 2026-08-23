import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { PachisiTheme } from './theme';

export function sharedThemeToPachisi(theme: GameTheme): PachisiTheme {
  const rgb = (hex: string): string => {
    const clean = hex.replace('#', '');
    const value =
      clean.length === 3
        ? clean
            .split('')
            .map((c) => c + c)
            .join('')
        : clean;
    const num = Number.parseInt(value, 16);
    if (Number.isNaN(num)) return '99, 102, 241';
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  return {
    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    boardBackground: `rgba(${rgb(theme.colors.surface)}, 0.9)`,
    cellBackground: `rgba(${rgb(theme.colors.text)}, 0.08)`,
    cellBorder: theme.colors.border,
    laneBackground: `rgba(${rgb(theme.colors.primary)}, 0.25)`,
    yardBackground: `rgba(${rgb(theme.colors.primary)}, 0.12)`,
    yardBorder: theme.colors.border,
    centerHome: `rgba(${rgb(theme.colors.glow)}, 0.35)`,
    seatColors: [
      theme.colors.playerPalette[0] ?? '#ef4444',
      theme.colors.playerPalette[1] ?? '#22c55e',
      theme.colors.playerPalette[2] ?? '#eab308',
      theme.colors.playerPalette[3] ?? '#3b82f6',
    ],
    tokenBorder: `rgba(${rgb(theme.colors.text)}, 0.85)`,
    movableRing: `rgba(${rgb(theme.colors.glow)}, 0.95)`,
    safeStar: `rgba(${rgb(theme.colors.highlight)}, 0.5)`,
    textColor: theme.colors.text,
    diceFace: theme.colors.surface,
    diceDot: theme.colors.highlight,
    diceBorder: theme.colors.border,
    borderRadius: '12px',
    bgImage: theme.bgImage,
  };
}
