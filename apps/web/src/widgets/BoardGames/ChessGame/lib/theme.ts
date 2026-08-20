import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToChess } from './theme-adapter';

export interface ChessTheme {
  background: string;
  boardBackground: string;
  lightSquare: string;
  darkSquare: string;
  lightPieceColor: string;
  darkPieceColor: string;
  selectedSquare: string;
  lastMoveSquare: string;
  validMoveDot: string;
  checkSquare: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

const DEFAULT_THEME = sharedThemeToChess(SHARED_THEMES[0]);

export function getChessTheme(variant?: string): ChessTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToChess(shared);
  return DEFAULT_THEME;
}
