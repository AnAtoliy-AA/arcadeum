import type { SpadesVariant } from '../types';
import { isSpadesVariant } from '../types';
import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToSpades } from './theme-adapter';

export interface SpadesThemeTokens {
  variant: SpadesVariant;
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

export const THEMES: Record<SpadesVariant, SpadesThemeTokens> =
  Object.fromEntries(
    SHARED_THEMES.filter((t) => t.id !== 'random').map((t) => [
      t.id as SpadesVariant,
      sharedThemeToSpades(t),
    ]),
  ) as Record<SpadesVariant, SpadesThemeTokens>;

export function getTheme(variant?: string): SpadesThemeTokens {
  if (variant && variant in THEMES) {
    return THEMES[variant as SpadesVariant];
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
export function resolveSpadesVariant(raw: unknown): SpadesVariant {
  const r = (raw ?? {}) as Partial<{ theme: string; variant: string }>;
  const candidate = r.theme ?? r.variant;
  return isSpadesVariant(candidate) ? candidate : 'cyberpunk';
}
