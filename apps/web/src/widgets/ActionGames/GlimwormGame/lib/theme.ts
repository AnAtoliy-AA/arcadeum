import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToGlimworm } from './theme-adapter';

export interface GlimwormTheme {
  background: string;
  gridColor: string;
  snakeHeadColor: string;
  snakeBodyColor: string;
  snakeGlowColor: string;
  foodColor: string;
  foodGlowColor: string;
  boundaryColor: string;
  textColor: string;
  bgImage?: string;
}

const DEFAULT_THEME = sharedThemeToGlimworm(SHARED_THEMES[0]);

export function getGlimwormTheme(variant?: string): GlimwormTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToGlimworm(shared);
  return DEFAULT_THEME;
}
