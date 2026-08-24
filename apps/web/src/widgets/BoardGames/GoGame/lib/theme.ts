import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToGo } from './theme-adapter';
import type { GoTheme } from './theme-adapter';

const DEFAULT_THEME = sharedThemeToGo(SHARED_THEMES[0]);

export function getGoTheme(variant?: string): GoTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToGo(shared);
  return DEFAULT_THEME;
}
