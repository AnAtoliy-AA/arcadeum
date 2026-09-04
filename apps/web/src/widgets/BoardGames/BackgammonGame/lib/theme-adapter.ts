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

  const p0 = theme.colors.playerPalette[1] ?? theme.colors.accent;
  const p1 = theme.colors.playerPalette[0] ?? theme.colors.primary;

  return {
    id: theme.id,
    background:
      theme.gradient ||
      `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    frameBackground: theme.colors.surface,
    boardBackground: theme.colors.background,
    frameBorder: theme.colors.border,
    pointLight: `rgba(${rgb(theme.colors.text)}, 0.16)`,
    pointDark: `rgba(${rgb(theme.colors.primary)}, 0.32)`,
    pointSelected: `rgba(${rgb(theme.colors.glow)}, 0.65)`,
    whitePiece: p0,
    whitePieceBorder: theme.colors.highlight,
    whitePieceInner: `rgba(${rgb(p0)}, 0.35)`,
    whitePieceText: theme.colors.background,
    blackPiece: p1,
    blackPieceBorder: theme.colors.border,
    blackPieceInner: `rgba(${rgb(p1)}, 0.35)`,
    blackPieceText: theme.colors.text,
    selectedPiece: `rgba(${rgb(theme.colors.glow)}, 0.7)`,
    validMoveIndicator: 'rgba(34, 197, 94, 0.5)',
    barBackground: theme.colors.background,
    barBorder: theme.colors.border,
    bearOffBackground: theme.colors.background,
    bearOffBorder: theme.colors.border,
    hudBackground: `rgba(${rgb(theme.colors.surface)}, 0.85)`,
    hudBorder: theme.colors.border,
    diceBackground: theme.colors.surface,
    diceDot: theme.colors.highlight,
    diceBorder: theme.colors.border,
    textColor: theme.colors.text,
    borderRadius: '12px',
    bgImage: theme.bgImage,
  };
}
