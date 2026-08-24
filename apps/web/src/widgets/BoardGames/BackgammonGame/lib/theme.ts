import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToBackgammon } from './theme-adapter';

export interface BackgammonTheme {
  background: string;
  boardBackground: string;
  pointLight: string;
  pointDark: string;
  whitePiece: string;
  whitePieceBorder: string;
  blackPiece: string;
  blackPieceBorder: string;
  selectedPiece: string;
  validMoveIndicator: string;
  barBackground: string;
  barBorder: string;
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
