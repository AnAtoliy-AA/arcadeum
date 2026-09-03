import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { ChessTheme } from './theme';

export function sharedThemeToChess(theme: GameTheme): ChessTheme {
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
    boardBackground: `rgba(${rgb(theme.colors.surface)}, 0.95)`,
    lightSquare: '#edeed1',
    darkSquare: '#779952',
    lightPieceColor: theme.colors.playerPalette[1] ?? theme.colors.text,
    darkPieceColor: theme.colors.playerPalette[0] ?? theme.colors.primary,
    selectedSquare: `rgba(245, 158, 11, 0.65)`,
    lastMoveSquare: `rgba(205, 210, 106, 0.8)`,
    validMoveDot: `rgba(34, 197, 94, 0.7)`,
    checkSquare: `rgba(239, 68, 68, 0.75)`,
    textColor: theme.colors.text,
    borderRadius: '12px',
    bgImage: theme.bgImage,
  };
}
