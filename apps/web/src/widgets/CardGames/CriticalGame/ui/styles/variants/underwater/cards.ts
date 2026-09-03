import { VARIANT_COLORS } from '../../variant-palette';

export const cardsStyles = {
  glowEffect: `0 0 20px ${VARIANT_COLORS.underwater.primary}80`,
  borderEffect: `2px solid ${VARIANT_COLORS.underwater.primary}`,
  deckBorderColor: VARIANT_COLORS.underwater.primary,
  getCardSpriteUrl: () => '/images/cards/underwater_sprites.webp',
};
