import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import type { ArcadePetThemeTokens } from '../types';
import { sharedThemeToArcadePet } from './theme-adapter';

export type { ArcadePetThemeTokens };

export function getArcadePetTheme(themeId?: string): ArcadePetThemeTokens {
  const fallback = SHARED_THEMES[0];
  const matched = themeId ? getThemeById(themeId) : undefined;
  return sharedThemeToArcadePet(matched ?? fallback);
}
