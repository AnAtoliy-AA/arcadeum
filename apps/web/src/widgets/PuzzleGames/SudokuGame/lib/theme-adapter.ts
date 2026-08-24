import type { GameTheme } from '@/features/games/lib/shared-themes';

export interface SudokuTheme {
  /** Page backdrop behind the whole board. */
  background: string;
  /** Panel the grid sits on. */
  boardBackground: string;
  boardBorder: string;
  /** Grid lines: thin cell borders and thick 3×3 separators. */
  lineThin: string;
  lineThick: string;
  /** Fill of the selected cell / its row-col-box peers. */
  selectedCell: string;
  peerCell: string;
  sameNumberCell: string;
  conflictColor: string;
  givenColor: string;
  playerValueColor: string;
  noteColor: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

export function sharedThemeToSudoku(theme: GameTheme): SudokuTheme {
  return {
    background: `linear-gradient(160deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    boardBackground: `rgba(${hexToRgb(theme.colors.surface)}, 0.85)`,
    boardBorder: theme.colors.border,
    lineThin: `rgba(${hexToRgb(theme.colors.text)}, 0.18)`,
    lineThick: `rgba(${hexToRgb(theme.colors.text)}, 0.55)`,
    selectedCell: `rgba(${hexToRgb(theme.colors.highlight)}, 0.35)`,
    peerCell: `rgba(${hexToRgb(theme.colors.primary)}, 0.12)`,
    sameNumberCell: `rgba(${hexToRgb(theme.colors.glow)}, 0.3)`,
    conflictColor: '#ef4444',
    givenColor: theme.colors.text,
    playerValueColor: theme.colors.primary,
    noteColor: `rgba(${hexToRgb(theme.colors.text)}, 0.55)`,
    textColor: theme.colors.text,
    borderRadius: '10px',
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
