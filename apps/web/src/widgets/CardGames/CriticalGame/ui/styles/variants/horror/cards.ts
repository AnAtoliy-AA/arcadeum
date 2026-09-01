import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.horror;

export const cardsStyles = {
  glowEffect: `0 0 25px ${C.primary}80`,
  borderEffect: `1px solid ${C.primary}`,
  deckBorderColor: C.primary,
  getCardSpriteUrl: () => '/images/cards/horror_sprites.webp',
};
