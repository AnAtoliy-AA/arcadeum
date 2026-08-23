import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { SpadesThemeTokens } from './theme';

export function sharedThemeToSpades(theme: GameTheme): SpadesThemeTokens {
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
    if (Number.isNaN(num)) return '32, 74, 248';
    return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
  };

  return {
    variant: theme.id as SpadesThemeTokens['variant'],
    emoji: theme.emoji,
    background: `radial-gradient(circle at 20% 20%, ${theme.colors.surface} 0%, ${theme.colors.background} 60%, #050314 100%)`,
    surface: `${theme.colors.surface}29`,
    cardBorder: `${theme.colors.textSecondary}2e`,
    cardText: theme.colors.text,
    accent: theme.colors.primary,
    accentRGB: rgb(theme.colors.primary),
    heartColor: '#dc2626',
    spadeColor: '#1e293b',
    diamondColor: '#f59e0b',
    clubColor: '#374151',
    bgImage: theme.bgImage,
  };
}
