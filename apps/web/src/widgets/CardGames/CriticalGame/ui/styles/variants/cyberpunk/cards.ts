import { VARIANT_COLORS } from '../../variant-palette';

export const cardsStyles = {
  glowEffect: `0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}cc`,
  borderEffect: `2px solid ${VARIANT_COLORS.cyberpunk.secondary}`,
  deckBorderColor: VARIANT_COLORS.cyberpunk.secondary,
  getCardSpriteUrl: (): string => '/images/cards/cyberpunk_sprites.webp',
};
