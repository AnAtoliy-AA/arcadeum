import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { TicTacToeThemeTokens } from './theme';

export function sharedThemeToTicTacToe(theme: GameTheme): TicTacToeThemeTokens {
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
    gridLine: theme.colors.border,
    cellBg: `rgba(${rgb(theme.colors.surface)}, 0.65)`,
    cellHoverBg: `rgba(${rgb(theme.colors.glow)}, 0.25)`,
    xColor: theme.colors.playerPalette[0] ?? theme.colors.primary,
    oColor: theme.colors.playerPalette[1] ?? theme.colors.accent,
    triangleColor: theme.colors.highlight,
    squareColor: '#eab308',
    winningCellBg: `rgba(${rgb(theme.colors.highlight)}, 0.45)`,
    markFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    textColor: theme.colors.text,
    borderRadius: '10px',
    bgImage: theme.bgImage,
  };
}
