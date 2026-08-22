import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { BackgammonTheme } from './theme';

export function sharedThemeToBackgammon(theme: GameTheme): BackgammonTheme {
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
    pointLight: `rgba(${rgb(theme.colors.text)}, 0.15)`,
    pointDark: `rgba(${rgb(theme.colors.primary)}, 0.35)`,
    whitePiece: theme.colors.playerPalette[1] ?? theme.colors.accent,
    whitePieceBorder: theme.colors.highlight,
    blackPiece: theme.colors.playerPalette[0] ?? theme.colors.primary,
    blackPieceBorder: theme.colors.border,
    selectedPiece: `rgba(${rgb(theme.colors.glow)}, 0.7)`,
    validMoveIndicator: 'rgba(34, 197, 94, 0.5)',
    barBackground: `rgba(${rgb(theme.colors.surface)}, 0.95)`,
    barBorder: theme.colors.border,
    diceBackground: theme.colors.surface,
    diceDot: theme.colors.highlight,
    diceBorder: theme.colors.border,
    textColor: theme.colors.text,
    borderRadius: '12px',
    bgImage: theme.bgImage,
  };
}
