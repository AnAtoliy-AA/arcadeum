import type { GameTheme } from '@/features/games/lib/shared-themes';

export interface MinesweeperTheme {
  /** Page backdrop behind the whole board. */
  background: string;
  /** Panel the grid sits on. */
  boardBackground: string;
  boardBorder: string;
  /** Hidden (unrevealed) cell. */
  cellHidden: string;
  cellHiddenBorder: string;
  cellHiddenHover: string;
  /** Revealed empty/numbered cell. */
  cellRevealed: string;
  cellRevealedBorder: string;
  /** Flagged cell accent. */
  flagColor: string;
  /** Detonated mine color. */
  mineColor: string;
  /** Number glyph colors, indexed 1–8 (index 0 unused). */
  numberColors: readonly [string, string, string, string, string, string, string, string];
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

const NUMBER_COLORS = [
  '#2563eb', // 1 blue
  '#16a34a', // 2 green
  '#dc2626', // 3 red
  '#7c3aed', // 4 purple
  '#b45309', // 5 amber
  '#0d9488', // 6 teal
  '#111827', // 7 near-black
  '#9ca3af', // 8 gray
] as const;

export function sharedThemeToMinesweeper(theme: GameTheme): MinesweeperTheme {
  return {
    background: `linear-gradient(160deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    boardBackground: `rgba(${hexToRgb(theme.colors.surface)}, 0.85)`,
    boardBorder: theme.colors.border,
    cellHidden: `linear-gradient(180deg, ${theme.colors.primary} 0%, ${theme.colors.glow} 100%)`,
    cellHiddenBorder: `rgba(${hexToRgb(theme.colors.text)}, 0.25)`,
    cellHiddenHover: `rgba(${hexToRgb(theme.colors.highlight)}, 0.35)`,
    cellRevealed: `rgba(${hexToRgb(theme.colors.text)}, 0.08)`,
    cellRevealedBorder: `rgba(${hexToRgb(theme.colors.text)}, 0.15)`,
    flagColor: theme.colors.highlight,
    mineColor: '#ef4444',
    numberColors: NUMBER_COLORS,
    textColor: theme.colors.text,
    borderRadius: '8px',
    bgImage: theme.bgImage,
  };
}

function hexToRgb(hex: string): string {
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
}
