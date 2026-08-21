import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { CheckersTheme } from './theme';

export function sharedThemeToCheckers(theme: GameTheme): CheckersTheme {
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
    boardBackground: `rgba(${rgb(theme.colors.surface)}, 0.85)`,
    lightSquare: `rgba(${rgb(theme.colors.text)}, 0.15)`,
    darkSquare: `rgba(${rgb(theme.colors.primary)}, 0.35)`,
    lightPiece: theme.colors.playerPalette[1] ?? theme.colors.accent,
    lightPieceBorder: theme.colors.highlight,
    darkPiece: theme.colors.playerPalette[0] ?? theme.colors.primary,
    darkPieceBorder: theme.colors.border,
    selectedPiece: `rgba(${rgb(theme.colors.glow)}, 0.6)`,
    validMoveIndicator: `rgba(34, 197, 94, 0.4)`,
    captureIndicator: `rgba(239, 68, 68, 0.5)`,
    kingCrown: theme.colors.highlight,
    textColor: theme.colors.text,
    borderRadius: '10px',
    bgImage: theme.bgImage,
  };
}
