import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToBackgammon } from './theme-adapter';

export interface BackgammonTheme {
  id: string;
  background: string;
  frameBackground: string;
  boardBackground: string;
  frameBorder: string;
  pointLight: string;
  pointDark: string;
  pointSelected: string;
  whitePiece: string;
  whitePieceBorder: string;
  whitePieceInner: string;
  whitePieceText: string;
  blackPiece: string;
  blackPieceBorder: string;
  blackPieceInner: string;
  blackPieceText: string;
  selectedPiece: string;
  validMoveIndicator: string;
  barBackground: string;
  barBorder: string;
  bearOffBackground: string;
  bearOffBorder: string;
  hudBackground: string;
  hudBorder: string;
  diceBackground: string;
  diceDot: string;
  diceBorder: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

const DEFAULT_THEME = sharedThemeToBackgammon(SHARED_THEMES[0]);

export function getBackgammonTheme(variant?: string): BackgammonTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToBackgammon(shared);
  return DEFAULT_THEME;
}
