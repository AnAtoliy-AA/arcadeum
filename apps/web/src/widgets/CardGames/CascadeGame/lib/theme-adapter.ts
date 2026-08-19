import type { GameTheme } from '@/features/games/lib/shared-themes';
import { THEMES, type CascadeThemeTokens } from './theme';

/**
 * Maps a shared visual theme (from `@/features/games/lib/shared-themes`) onto
 * the Cascade theme token shape. Shared themes that Cascade has no dedicated
 * variant for fall back to the cosmic symbols/palette while still adopting the
 * shared theme's colors.
 */
export function sharedThemeToCascade(theme: GameTheme): CascadeThemeTokens {
  const base = THEMES.cosmic;
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
    palette: base.palette,
    colorNames: base.colorNames,
    symbols: base.symbols,
  };
}
