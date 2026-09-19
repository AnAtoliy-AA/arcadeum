import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { PachisiTheme } from './theme';

const THEME_SEAT_COLORS: Record<string, [string, string, string, string]> = {
  fantasy: ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'],
  cyberpunk: ['#ff007f', '#00f0ff', '#ffe600', '#a855f7'],
  underwater: ['#f43f5e', '#10b981', '#fbbf24', '#0284c7'],
  adventure: ['#ff4d4d', '#22c55e', '#fbbf24', '#38bdf8'],
  crime: ['#dc2626', '#10b981', '#f59e0b', '#2563eb'],
  horror: ['#ef4444', '#22c55e', '#eab308', '#a855f7'],
  'high-altitude-hike': ['#f43f5e', '#10b981', '#fbbf24', '#0284c7'],
  galaxy: ['#f43f5e', '#10b981', '#fbbf24', '#38bdf8'],
  western: ['#dc2626', '#16a34a', '#f59e0b', '#0891b2'],
  egypt: ['#ef4444', '#10b981', '#f59e0b', '#2563eb'],
  steampunk: ['#ef4444', '#10b981', '#f59e0b', '#2563eb'],
  zen: ['#e11d48', '#10b981', '#f59e0b', '#6366f1'],
};

export function getPachisiSeatColors(
  theme: GameTheme,
): [string, string, string, string] {
  const curated = THEME_SEAT_COLORS[theme.id];
  if (curated) return curated;
  return [
    theme.colors.playerPalette[0] ?? '#ef4444',
    theme.colors.playerPalette[1] ?? '#10b981',
    theme.colors.playerPalette[2] ?? '#f59e0b',
    theme.colors.playerPalette[3] ?? '#3b82f6',
  ];
}

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
    seatColors: getPachisiSeatColors(theme),
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
