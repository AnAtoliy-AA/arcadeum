import type { HeartsVariant } from '../types';
import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToHearts } from './theme-adapter';

export interface HeartsThemeTokens {
  variant: HeartsVariant;
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

export const THEMES: Record<HeartsVariant, HeartsThemeTokens> =
  Object.fromEntries(
    SHARED_THEMES.filter((t) => t.id !== 'random').map((t) => [
      t.id as HeartsVariant,
      sharedThemeToHearts(t),
    ]),
  ) as Record<HeartsVariant, HeartsThemeTokens>;

export function getTheme(variant?: string): HeartsThemeTokens {
  if (variant && variant in THEMES) {
    return THEMES[variant as HeartsVariant];
  }
  if (variant) {
    const shared = getThemeById(variant);
    if (shared) {
      return sharedThemeToHearts(shared);
    }
  }
  return THEMES.cyberpunk;
}
