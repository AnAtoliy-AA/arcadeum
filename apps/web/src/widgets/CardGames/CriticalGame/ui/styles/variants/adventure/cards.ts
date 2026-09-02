import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.adventure;

export const cardsStyles = {
  glowEffect: `0 0 20px ${C.primary}80`,
  borderEffect: `2px solid ${C.primary}`,
  deckBorderColor: C.primary,
  getCardSpriteUrl: () => '/images/cards/adventure_sprites.webp',
};
