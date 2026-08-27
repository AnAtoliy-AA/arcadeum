import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToGame2048 } from './theme-adapter';
import type { Game2048Theme } from './theme-adapter';

export type { Game2048Theme };

const DEFAULT_THEME = sharedThemeToGame2048(SHARED_THEMES[0]);

export function getGame2048Theme(variant?: string): Game2048Theme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToGame2048(shared);
  return DEFAULT_THEME;
}
