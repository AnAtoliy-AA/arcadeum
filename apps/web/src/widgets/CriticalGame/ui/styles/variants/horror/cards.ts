import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.horror;

export const cardsStyles = {
  glowEffect: `0 0 25px ${C.primary}80`,
  borderEffect: `1px solid ${C.primary}`,
  deckBorderColor: C.primary,
  getHoverGlow: () => `0 0 35px ${C.primary}`,
  getCardNameColor: () => '#fff',
  getCardSpriteUrl: () => '/images/cards/horror_sprites.png',
  getDecorationBackground: () => 'rgba(0, 0, 0, 0.8)',
  getDecorationBorder: () => `1px solid ${C.primary}4d`,
  getDecorationEffects: () => ({
    borderRadius: 0,
    boxShadow: `inset 0 0 10px ${C.primary}26`,
  }),
  getDisabledOverlay: () => 'rgba(2, 6, 23, 0.75)',
  getCardNameStyles: () => ({
    fontWeight: '800',
    fontFamily: 'serif',
    letterSpacing: '3px',
    color: C.primary,
    textShadow: `0 0 10px ${C.primary}80`,
  }),
  getCardDescriptionStyles: () => ({
    color: '#9ca3af',
    fontFamily: 'serif',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  }),
};
