import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.crime;

export const cardsStyles = {
  glowEffect: `0 0 20px ${C.primary}cc`,
  borderEffect: `2px solid ${C.primary}`,
  deckBorderColor: C.primary,
  getCardSpriteUrl: () => '/images/cards/crime_sprites.webp',
};
