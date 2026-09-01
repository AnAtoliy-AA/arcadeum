import { VariantStyleConfig } from './types';
import { GAME_VARIANT } from '../../../lib/constants';
import { VARIANT_COLORS } from '../variant-palette';

export const baseVariantStyles: VariantStyleConfig = {
  tableInfo: {
    getBackground: () => 'rgba(15, 23, 42, 0.85)',
    getBorder: () => '1px solid transparent',
    getShadow: () =>
      '0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
    getTextGlow: () => 'inherit',
    getStatValueColor: (isWarning) => (isWarning ? '#DC2626' : 'inherit'),
  },
  cards: {
    glowEffect: `${VARIANT_COLORS.default.primary}`,
    borderEffect: `2px solid ${VARIANT_COLORS.default.primary}`,
    deckBorderColor: VARIANT_COLORS.default.primary,
    getCardSpriteUrl: (variant) => {
      if (variant === GAME_VARIANT.CRIME)
        return '/images/cards/crime_sprites.webp';
      if (variant === GAME_VARIANT.HORROR)
        return '/images/cards/horror_sprites.webp';
      if (variant === GAME_VARIANT.ADVENTURE)
        return '/images/cards/adventure_sprites.webp';
      return undefined;
    },
  },
  scene: {
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(120, 0, 220, 0.18) 0%, rgba(15, 5, 24, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(168, 85, 247, 0.28)',
    gridLineColorB: 'rgba(236, 72, 153, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.9) 25%, rgba(236, 72, 153, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(168, 85, 247, 0.32)',
    vignetteColor: 'rgba(0, 0, 0, 0.75)',
    particleColors: [
      'rgba(236, 72, 153, 0.85)',
      'rgba(168, 85, 247, 0.75)',
      'rgba(99, 102, 241, 0.6)',
    ],
    ambientGlowColorA: 'rgba(99, 102, 241, 0.12)',
    ambientGlowColorB: 'rgba(236, 72, 153, 0.1)',

    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(168, 85, 247, 1), rgba(236, 72, 153, 1))',
    turnBannerDotColor: 'rgba(236, 72, 153, 1)',
    turnBannerShadow:
      '0 0 24px rgba(168, 85, 247, 0.6), 0 0 48px rgba(236, 72, 153, 0.35)',
    opponentTurnRingColor: 'rgba(236, 72, 153, 1)',
    opponentTurnHaloColor: 'rgba(236, 72, 153, 0.35)',
    youAvatarGradient: 'linear-gradient(135deg, #f5c56a 0%, #c4902f 100%)',
    deckGradient:
      'linear-gradient(160deg, rgba(30, 15, 55, 1) 0%, rgba(12, 5, 22, 1) 100%)',
    deckGlow:
      '0 6px 20px rgba(168, 85, 247, 0.35), inset 0 0 12px rgba(236, 72, 153, 0.25)',
    discardGradient:
      'linear-gradient(160deg, rgba(13, 52, 64, 1) 0%, rgba(5, 22, 30, 1) 100%)',
    discardGlow:
      '0 6px 20px rgba(20, 184, 166, 0.35), inset 0 0 12px rgba(56, 189, 248, 0.2)',
    lastPlayedGradient:
      'linear-gradient(160deg, rgba(236, 72, 153, 1) 0%, rgba(168, 85, 247, 1) 55%, rgba(99, 102, 241, 1) 100%)',
    lastPlayedHaloColor: 'rgba(245, 197, 106, 0.5)',
    handBackground:
      'linear-gradient(180deg, rgba(15, 5, 24, 0.92) 0%, rgba(0, 0, 0, 0.98) 100%)',
    handColorByRole: {
      attack:
        'linear-gradient(160deg, rgba(236, 72, 153, 1) 0%, rgba(139, 28, 98, 1) 100%)',
      defuse:
        'linear-gradient(160deg, rgba(34, 197, 94, 1) 0%, rgba(6, 95, 70, 1) 100%)',
      skip: 'linear-gradient(160deg, rgba(239, 68, 68, 1) 0%, rgba(127, 29, 29, 1) 100%)',
      nope: 'linear-gradient(160deg, rgba(100, 116, 139, 1) 0%, rgba(30, 41, 59, 1) 100%)',
      favor:
        'linear-gradient(160deg, rgba(249, 115, 22, 1) 0%, rgba(154, 52, 18, 1) 100%)',
      see: 'linear-gradient(160deg, rgba(56, 189, 248, 1) 0%, rgba(12, 74, 110, 1) 100%)',
      combo:
        'linear-gradient(160deg, rgba(168, 85, 247, 1) 0%, rgba(76, 29, 149, 1) 100%)',
      special:
        'linear-gradient(160deg, rgba(245, 197, 106, 1) 0%, rgba(146, 96, 20, 1) 100%)',
    },
  },
};
