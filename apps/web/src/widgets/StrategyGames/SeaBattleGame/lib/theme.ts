import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToSeaBattle } from './theme-adapter';

export interface SeaBattleTheme {
  gameBackground: string;
  boardBackground: string;
  gridColor: string;
  cellBorder: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderRadius: string;
  borderWidth?: string;
  shipColor: string;
  hitColor: string;
  missColor: string;
  fontFamily?: string;
  cellEmpty: string;
  cellHover: string;
  boxShadow?: string;
  bgImage?: string;
  teamPalette: readonly string[];
  playerPalette: readonly string[];
}

const DEFAULT_THEME = sharedThemeToSeaBattle(SHARED_THEMES[0]);

export const getTheme = (variant?: string): SeaBattleTheme => {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToSeaBattle(shared);
  return DEFAULT_THEME;
};
