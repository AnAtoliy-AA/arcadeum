import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { CascadeThemeTokens } from './theme';

export function sharedThemeToCascade(theme: GameTheme): CascadeThemeTokens {
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
    if (Number.isNaN(num)) return '255, 0, 128';
    return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
  };

  return {
    variant: theme.id as CascadeThemeTokens['variant'],
    emoji: theme.emoji,
    background: `radial-gradient(circle at 20% 20%, ${theme.colors.surface} 0%, ${theme.colors.background} 60%, #050314 100%)`,
    surface: `${theme.colors.surface}29`,
    cardBorder: `${theme.colors.textSecondary}2e`,
    cardText: theme.colors.text,
    accent: theme.colors.primary,
    accentRGB: rgb(theme.colors.primary),
    palette: {
      R: theme.colors.playerPalette[0] ?? '#ef4444',
      Y: theme.colors.playerPalette[1] ?? '#fbbf24',
      G: theme.colors.playerPalette[2] ?? '#10b981',
      B: theme.colors.playerPalette[3] ?? '#3b82f6',
      W: theme.colors.surface ?? '#1f1b3d',
    },
    colorNames: {
      R: 'Red',
      Y: 'Yellow',
      G: 'Green',
      B: 'Blue',
      W: 'Wild',
    },
    symbols: {
      SKIP: '⊘',
      REVERSE: '↺',
      DRAW_TWO: '+2',
      WILD: '★',
      WILD_DRAW_FOUR: '+4',
    },
    bgImage: theme.bgImage,
  };
}
