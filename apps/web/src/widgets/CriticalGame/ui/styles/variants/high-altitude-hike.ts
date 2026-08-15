import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';
import { VARIANT_COLORS } from '../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const highAltitudeHikeVariantStyles: Partial<VariantStyleConfig> = {
  tableInfo: {
    getBackground: () => `${COLORS.background}cc`,
    getBorder: () => `${COLORS.primary}33`,
    getShadow: () => '0 12px 32px rgba(0, 0, 0, 0.4)',
    getTextGlow: () => COLORS.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : COLORS.primary),
    getStyles: () => ({
      before: {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 12,
        padding: 1,
        background: `linear-gradient(
          135deg,
          ${COLORS.primary}99,
          ${COLORS.secondary}66
        )`,
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      },
    }),
  },
  cards: {
    glowEffect: `0 0 30px ${COLORS.primary}99`,
    borderEffect: `2px solid ${COLORS.primary}`,
    deckBorderColor: COLORS.primary,
    getHoverGlow: () => `0 0 24px ${COLORS.primary}cc`,
    getCardNameColor: () => COLORS.accent,
    getCardSpriteUrl: () => '/images/cards/high_altitude_hike_sprites.png',
    getCardNameStyles: () => ({
      fontFamily: '"Inter", sans-serif',
      fontWeight: 900,
      letterSpacing: '1px',
      color: COLORS.accent,
      textShadow: `0 0 10px ${COLORS.primary}`,
      padding: '0.1rem 0',

      before: {
        content: '""',
        position: 'absolute',
        top: -1,
        left: '20%',
        right: '20%',
        height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
        pointerEvents: 'none',
      },
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
  },
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(125, 211, 252, 0.24) 0%, rgba(5, 15, 40, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(125, 211, 252, 0.28)',
    gridLineColorB: 'rgba(30, 58, 138, 0.35)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(125, 211, 252, 0.9) 25%, rgba(30, 58, 138, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(125, 211, 252, 0.32)',
    particleColors: [
      'rgba(125, 211, 252, 0.85)',
      'rgba(30, 58, 138, 0.75)',
      'rgba(186, 230, 253, 0.6)',
    ],
    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(125, 211, 252, 1), rgba(30, 58, 138, 1))',
    turnBannerDotColor: 'rgba(125, 211, 252, 1)',
  },
};
