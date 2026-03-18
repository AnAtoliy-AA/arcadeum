import { VARIANT_COLORS } from '../../variant-palette';

export const cardsStyles = {
  glowEffect: `0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}cc`,
  borderEffect: `2px solid ${VARIANT_COLORS.cyberpunk.secondary}`,
  getCardSpriteUrl: (): string => '/images/cards/cyberpunk_sprites.png',
  getDeckBackground: (): string =>
    "url('/images/cards/cyberpunk_sprites.png') 0% 0% / 700% 700% no-repeat",
  getDeckBorder: (): string => VARIANT_COLORS.cyberpunk.secondary,
  getDecorationBackground: (): string =>
    `${VARIANT_COLORS.cyberpunk.background}e6`,
  getDecorationBorder: (): string =>
    `1px solid ${VARIANT_COLORS.cyberpunk.primary}80`,
  getDisabledOverlay: (): string => `${VARIANT_COLORS.cyberpunk.background}b3`,
  getCardNameStyles: () => ({
    fontFamily: '"Courier New", monospace',
    letterSpacing: 1,
    background: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: VARIANT_COLORS.cyberpunk.secondary,
    borderRadius: 4,
    color: VARIANT_COLORS.cyberpunk.accent,
    textShadow: `0 0 5px ${VARIANT_COLORS.cyberpunk.secondary}99`,
    clipPath:
      'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
    padding: '0.3rem 0.6rem',

    before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 8,
      height: 8,
      borderTopWidth: 2,
      borderTopStyle: 'solid',
      borderTopColor: VARIANT_COLORS.cyberpunk.primary,
      borderLeftWidth: 2,
      borderLeftStyle: 'solid',
      borderLeftColor: VARIANT_COLORS.cyberpunk.primary,
    },

    after: {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 8,
      height: 8,
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      borderBottomColor: VARIANT_COLORS.cyberpunk.primary,
      borderRightWidth: 2,
      borderRightStyle: 'solid',
      borderRightColor: VARIANT_COLORS.cyberpunk.primary,
    },
  }),
  getCardDescriptionStyles: () => ({
    fontFamily: '"Courier New", monospace',
    fontSize: '0.6rem',
    letterSpacing: '0.5px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 1)',
  }),
};
