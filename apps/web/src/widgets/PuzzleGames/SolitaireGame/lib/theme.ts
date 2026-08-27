import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToSolitaire } from './theme-adapter';
import type { SolitaireTheme } from './theme-adapter';

export type { SolitaireTheme };

const DEFAULT_THEME = sharedThemeToSolitaire(SHARED_THEMES[0]);

export function getSolitaireTheme(variant?: string): SolitaireTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToSolitaire(shared);
  return DEFAULT_THEME;
}
