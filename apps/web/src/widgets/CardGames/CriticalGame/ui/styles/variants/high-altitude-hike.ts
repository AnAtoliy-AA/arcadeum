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
  },
  cards: {
    glowEffect: `0 0 30px ${COLORS.primary}99`,
    borderEffect: `2px solid ${COLORS.primary}`,
    deckBorderColor: COLORS.primary,
    getCardSpriteUrl: () => '/images/cards/high_altitude_hike_sprites.webp',
  },
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(125, 211, 252, 0.24) 0%, rgba(5, 15, 40, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    sceneBackgroundImage: '/images/variants/high-altitude-hike_bg.webp',
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
