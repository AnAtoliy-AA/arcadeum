import { VARIANT_COLORS } from '../../variant-palette';

export const cardsStyles = {
  glowEffect: `0 0 20px ${VARIANT_COLORS.underwater.primary}80`,
  borderEffect: `2px solid ${VARIANT_COLORS.underwater.primary}`,
  deckBorderColor: VARIANT_COLORS.underwater.primary,
  getHoverGlow: () => `0 0 30px ${VARIANT_COLORS.underwater.primary}`,
  getCardNameColor: () => '#fff',
  getCardSpriteUrl: () => '/images/cards/underwater_sprites.png',
  getDecorationBackground: () => 'rgba(8, 51, 68, 0.4)',
  getDecorationBorder: () => `1px solid ${VARIANT_COLORS.underwater.primary}66`,
  getDecorationEffects: () => ({
    backdropFilter: 'blur(4px)',
    borderRadius: '8px',
  }),
  getDisabledOverlay: () => 'rgba(2, 6, 23, 0.6)',
  getCardNameStyles: () => ({
    fontWeight: '800',
    fontSize: '1rem',
    textShadow: `0 0 12px ${VARIANT_COLORS.underwater.primary}`,
  }),
  getCardDescriptionStyles: () => ({
    color: '#e0f2fe',
    fontSize: '0.8rem',
    lineHeight: '1.2',
  }),
};
