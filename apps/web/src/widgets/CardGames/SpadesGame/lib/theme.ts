import type { SpadesTheme } from '../types';
import { isSpadesTheme } from '../types';
import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToSpades } from './theme-adapter';

export interface SpadesThemeTokens {
  variant: SpadesTheme;
  emoji: string;
  background: string;
  surface: string;
  cardBorder: string;
  cardText: string;
  accent: string;
  accentRGB: string;
  heartColor: string;
  spadeColor: string;
  diamondColor: string;
  clubColor: string;
  bgImage?: string;
}

export const THEMES: Record<SpadesTheme, SpadesThemeTokens> =
  Object.fromEntries(
    SHARED_THEMES.filter((t) => t.id !== 'random').map((t) => [
      t.id as SpadesTheme,
      sharedThemeToSpades(t),
    ]),
  ) as Record<SpadesTheme, SpadesThemeTokens>;

export function getTheme(variant?: string): SpadesThemeTokens {
  if (variant && variant in THEMES) {
    return THEMES[variant as SpadesTheme];
  }
  if (variant) {
    const shared = getThemeById(variant);
    if (shared) {
      return sharedThemeToSpades(shared);
    }
  }
  return THEMES.cyberpunk;
}

/**
 * Resolve a room's `gameOptions` to a known visual variant. Rooms persist
 * the shared theme id under `theme`; unknown or missing values (legacy
 * rooms, hand-edited options) fall back to cyberpunk.
 */
export function resolveSpadesTheme(raw: unknown): SpadesTheme {
  const r = (raw ?? {}) as Partial<{ theme: string; variant: string }>;
  const candidate = r.theme ?? r.variant;
  return isSpadesTheme(candidate) ? candidate : 'cyberpunk';
}
