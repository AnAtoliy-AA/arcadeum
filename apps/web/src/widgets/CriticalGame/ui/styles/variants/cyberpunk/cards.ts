import { VARIANT_COLORS } from '../../variant-palette';

export const cardsStyles = {
  glowEffect: `0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}cc`,
  borderEffect: `2px solid ${VARIANT_COLORS.cyberpunk.secondary}`,
  deckBorderColor: VARIANT_COLORS.cyberpunk.secondary,
  getHoverGlow: (): string => `0 0 24px ${VARIANT_COLORS.cyberpunk.primary}cc`,
  getCardNameColor: (): string => VARIANT_COLORS.cyberpunk.accent,
  getCardSpriteUrl: (): string => '/images/cards/cyberpunk_sprites.png',
  getDecorationBackground: (): string =>
    `${VARIANT_COLORS.cyberpunk.background}e6`,
  getDecorationBorder: (): string =>
    `1px solid ${VARIANT_COLORS.cyberpunk.primary}80`,
  getDisabledOverlay: (): string => `${VARIANT_COLORS.cyberpunk.background}b3`,
  getCardNameStyles: () => ({
    fontFamily: '"Courier New", monospace',
    letterSpacing: 2,
    color: VARIANT_COLORS.cyberpunk.accent,
    textShadow: `0 0 10px ${VARIANT_COLORS.cyberpunk.secondary}`,
    padding: '0.1rem 0',
    position: 'relative',

    before: {
      content: '""',
      position: 'absolute',
      bottom: -2,
      left: '10%',
      right: '10%',
      height: 1,
      backgroundColor: VARIANT_COLORS.cyberpunk.primary,
      boxShadow: `0 0 5px ${VARIANT_COLORS.cyberpunk.primary}`,
    },
  }),
  getCardDescriptionStyles: () => ({
    fontFamily: '"Courier New", monospace',
    fontSize: '0.7rem',
    letterSpacing: '0.5px',
    color: '#fff',
    textShadow: '0 0 5px rgba(0, 0, 0, 1), 0 0 2px rgba(255, 255, 255, 0.3)',
  }),
};
