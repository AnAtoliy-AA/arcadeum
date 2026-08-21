import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToCheckers } from './theme-adapter';

export interface CheckersTheme {
  background: string;
  boardBackground: string;
  lightSquare: string;
  darkSquare: string;
  lightPiece: string;
  lightPieceBorder: string;
  darkPiece: string;
  darkPieceBorder: string;
  selectedPiece: string;
  validMoveIndicator: string;
  captureIndicator: string;
  kingCrown: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

const DEFAULT_THEME = sharedThemeToCheckers(SHARED_THEMES[0]);

export function getCheckersTheme(variant?: string): CheckersTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToCheckers(shared);
  return DEFAULT_THEME;
}
