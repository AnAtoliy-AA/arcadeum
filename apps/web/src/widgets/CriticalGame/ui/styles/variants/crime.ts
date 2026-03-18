import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';

const C = VARIANT_COLORS.crime;

export const crimeVariantStyles: Partial<VariantStyleConfig> = {
  cards: {
    glowEffect: `0 0 20px ${C.primary}cc`,
    borderEffect: `2px solid ${C.primary}`,
    deckBorderColor: C.primary,
    getCardSpriteUrl: () => '/images/cards/crime_sprites.png',
    getHoverGlow: () => `0 0 24px ${C.primary}cc`,
    getCardNameColor: () => '#fca5a5',
  },
};
