import type { CSSProperties } from 'react';
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

export function boardVars(theme: PachisiTheme): CSSProperties {
  return {
    '--pachisi-board-bg': theme.boardBackground,
    '--pachisi-yard-bg': theme.yardBackground,
    '--pachisi-yard-border': theme.yardBorder,
    '--pachisi-cell-bg': theme.cellBackground,
    '--pachisi-cell-border': theme.cellBorder,
    '--pachisi-lane-bg': theme.laneBackground,
    '--pachisi-center-home': theme.centerHome,
    '--pachisi-safe-star': theme.safeStar,
    '--pachisi-token-border': theme.tokenBorder,
    '--pachisi-movable-ring': theme.movableRing,
    '--pachisi-dice-face': theme.diceFace,
    '--pachisi-dice-dot': theme.diceDot,
    '--pachisi-dice-border': theme.diceBorder,
    '--pachisi-seat-0': theme.seatColors[0],
    '--pachisi-seat-1': theme.seatColors[1],
    '--pachisi-seat-2': theme.seatColors[2],
    '--pachisi-seat-3': theme.seatColors[3],
  } as CSSProperties;
}
