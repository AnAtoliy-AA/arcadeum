import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.adventure;

export const cardsStyles = {
  glowEffect: `0 0 20px ${C.primary}80`,
  borderEffect: `2px solid ${C.primary}`,
  deckBorderColor: C.primary,
  getHoverGlow: () => `0 0 30px ${C.primary}`,
  getCardNameColor: () => '#fff',
  getCardSpriteUrl: () => '/images/cards/adventure_sprites.png',
  getDecorationBackground: () => 'rgba(69, 26, 3, 0.4)',
  getDecorationBorder: () => `1px solid ${C.primary}66`,
  getDecorationEffects: () => ({
    borderRadius: 8,
    backdropFilter: 'blur(4px)',
  }),
  getDisabledOverlay: () => 'rgba(28, 25, 23, 0.7)',
  getCardNameStyles: () => ({
    fontWeight: '800',
    fontFamily: 'serif',
    letterSpacing: '2px',
    color: '#fef3c7',
    textShadow: `0 0 10px ${C.primary}80`,
  }),
  getCardDescriptionStyles: () => ({
    color: '#d6d3d1',
    fontFamily: 'serif',
    fontSize: '0.8rem',
  }),
};
