import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.crime;

export const cardsStyles = {
  glowEffect: `0 0 20px ${C.primary}cc`,
  borderEffect: `2px solid ${C.primary}`,
  deckBorderColor: C.primary,
  getHoverGlow: () => `0 0 30px ${C.primary}`,
  getCardNameColor: () => '#fff',
  getCardSpriteUrl: () => '/images/cards/crime_sprites.png',
  getDecorationBackground: () => 'rgba(0, 0, 0, 0.6)',
  getDecorationBorder: () => `1px solid ${C.primary}66`,
  getDecorationEffects: () => ({
    borderRadius: 2,
    backdropFilter: 'blur(4px)',
  }),
  getDisabledOverlay: () => 'rgba(0, 0, 0, 0.7)',
  getCardNameStyles: () => ({
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    color: C.primary,
    textShadow: `0 0 10px ${C.primary}40`,
  }),
  getCardDescriptionStyles: () => ({
    color: '#d4d4d8',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
  }),
};
