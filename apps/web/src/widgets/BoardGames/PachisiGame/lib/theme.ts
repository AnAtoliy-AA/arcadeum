import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToPachisi } from './theme-adapter';

export interface PachisiTheme {
  background: string;
  boardBackground: string;
  cellBackground: string;
  cellBorder: string;
  laneBackground: string;
  yardBackground: string;
  yardBorder: string;
  centerHome: string;
  /** Per-seat token colors (red, green, yellow, blue order). */
  seatColors: [string, string, string, string];
  tokenBorder: string;
  movableRing: string;
  safeStar: string;
  textColor: string;
  diceFace: string;
  diceDot: string;
  diceBorder: string;
  borderRadius: string;
  bgImage?: string;
}

const DEFAULT_THEME = sharedThemeToPachisi(SHARED_THEMES[0]);

export function getPachisiTheme(variant?: string): PachisiTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToPachisi(shared);
  return DEFAULT_THEME;
}
