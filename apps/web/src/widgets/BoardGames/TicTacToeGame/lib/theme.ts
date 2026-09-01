import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToTicTacToe } from './theme-adapter';

export interface TicTacToeThemeTokens {
  background: string;
  boardBackground: string;
  gridLine: string;
  cellBg: string;
  cellHoverBg: string;
  xColor: string;
  oColor: string;
  triangleColor: string;
  squareColor: string;
  winningCellBg: string;
  markFont: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

const DEFAULT_THEME = sharedThemeToTicTacToe(SHARED_THEMES[0]);

export function getTicTacToeTheme(variant?: string): TicTacToeThemeTokens {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToTicTacToe(shared);
  return DEFAULT_THEME;
}
