import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { GlimwormTheme } from './theme';

export function sharedThemeToGlimworm(theme: GameTheme): GlimwormTheme {
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
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  return {
    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    gridColor: theme.colors.border,
    snakeHeadColor: theme.colors.playerPalette[0] ?? theme.colors.primary,
    snakeBodyColor: theme.colors.playerPalette[1] ?? theme.colors.accent,
    snakeGlowColor: `rgba(${rgb(theme.colors.glow)}, 0.7)`,
    foodColor: theme.colors.highlight,
    foodGlowColor: `rgba(${rgb(theme.colors.highlight)}, 0.85)`,
    boundaryColor: theme.colors.border,
    textColor: theme.colors.text,
    bgImage: theme.bgImage,
  };
}
