import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToCatDash } from './theme-adapter';

export interface CatDashThemeTokens {
  background: string;
  track: string;
  trackBorder: string;
  normalSpace: string;
  obstacleSpace: string;
  bonusSpace: string;
  forkSpace: string;
  player: string;
  playerBorder: string;
  dice: string;
  diceBorder: string;
  text: string;
  textSecondary: string;
  bgImage?: string;
}

const DEFAULT_THEME = sharedThemeToCatDash(SHARED_THEMES[0]);

export function getTheme(variant?: string): CatDashThemeTokens {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToCatDash(shared);
  return DEFAULT_THEME;
}
