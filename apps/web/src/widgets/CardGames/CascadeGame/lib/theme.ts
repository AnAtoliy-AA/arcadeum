import type { ActiveColor, CardColor, CascadeVariant } from '../types';
import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToCascade } from './theme-adapter';

export interface CardPalette {
  R: string;
  Y: string;
  G: string;
  B: string;
  W: string;
}

export interface CascadeThemeTokens {
  variant: CascadeVariant;
  emoji: string;
  background: string;
  surface: string;
  cardBorder: string;
  cardText: string;
  accent: string;
  accentRGB: string;
  palette: CardPalette;
  colorNames: CardPalette;
  symbols: {
    SKIP: string;
    REVERSE: string;
    DRAW_TWO: string;
    WILD: string;
    WILD_DRAW_FOUR: string;
  };
  bgImage?: string;
}

export const THEMES: Record<CascadeVariant, CascadeThemeTokens> =
  Object.fromEntries(
    SHARED_THEMES.filter((t) => t.id !== 'random').map((t) => [
      t.id as CascadeVariant,
      sharedThemeToCascade(t),
    ]),
  ) as Record<CascadeVariant, CascadeThemeTokens>;

export function getTheme(variant?: string): CascadeThemeTokens {
  if (variant && variant in THEMES) {
    return THEMES[variant as CascadeVariant];
  }
  if (variant) {
    const shared = getThemeById(variant);
    if (shared) {
      return sharedThemeToCascade(shared);
    }
  }
  return THEMES.cyberpunk;
}

export function colorHex(
  variant: CascadeVariant,
  color: CardColor | ActiveColor,
): string {
  return getTheme(variant).palette[color as CardColor] ?? '#ffffff';
}
