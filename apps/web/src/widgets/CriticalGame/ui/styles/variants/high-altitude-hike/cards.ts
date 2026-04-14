import { VARIANT_COLORS } from '../../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const cardsStyles = {
  glowEffect: `0 0 25px ${COLORS.primary}80`,
  borderEffect: `1px solid ${COLORS.primary}`,
  deckBorderColor: COLORS.primary,
  getHoverGlow: () => `0 0 35px ${COLORS.primary}`,
  getCardNameColor: () => '#fff',
  getCardSpriteUrl: () => '/images/cards/high_altitude_hike_sprites.png',
  getDecorationBackground: () => 'rgba(12, 74, 110, 0.4)',
  getDecorationBorder: () => `1px solid ${COLORS.primary}66`,
  getDecorationEffects: () => ({
    borderRadius: 8,
    backdropFilter: 'blur(4px)',
  }),
  getDisabledOverlay: () => 'rgba(2, 6, 23, 0.7)',
  getCardNameStyles: () => ({
    fontWeight: '900',
    fontFamily: 'sans-serif',
    letterSpacing: '2px',
    color: '#fff',
    textShadow: `0 0 10px ${COLORS.primary}80`,
  }),
  getCardDescriptionStyles: () => ({
    color: '#e0f2fe',
    fontFamily: 'sans-serif',
    fontSize: '0.8rem',
  }),
  getCardInnerStyles: () => ({
    after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1) 20%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.1) 80%,
        transparent
      )`,
      animation: 'icyShimmer 4s ease-in-out infinite',
      pointerEvents: 'none',
      zIndex: 5,
    },
  }),
};
