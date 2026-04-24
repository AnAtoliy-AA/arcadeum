import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';
import { VARIANT_COLORS } from '../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const highAltitudeHikeVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      before: {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(
          circle at 50% -20%,
          rgba(255, 255, 255, 0.15) 0%,
          transparent 60%
        )`,
        pointerEvents: 'none',
      },
    }),
    getRoomBackground: () => `
      linear-gradient(
        180deg,
        ${COLORS.background} 0%,
        ${COLORS.secondary} 100%
      )
    `,
    getRoomBorder: (isMyTurn) => {
      if (isMyTurn) return `3px solid ${COLORS.primary}`;
      return `1px solid ${COLORS.secondary}66`;
    },
    getRoomShadow: (isMyTurn) => {
      if (isMyTurn) {
        return `0 0 30px ${COLORS.primary}4d, inset 0 0 20px ${COLORS.primary}1a`;
      }
      return '0 25px 80px rgba(0, 0, 0, 0.4)';
    },
  },
  table: {
    getBackground: () =>
      `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.secondary} 100%)`,
    getBorder: () => `1px solid ${COLORS.primary}33`,
    getShadow: () => '0 20px 60px rgba(0, 0, 0, 0.5)',
    center: {
      getBackground: () =>
        `linear-gradient(145deg, ${COLORS.secondary}, ${COLORS.background})`,
      getBorder: () => `2px solid ${COLORS.primary}4d`,
      getShadow: () =>
        `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${COLORS.primary}1a`,
      getGlow: () => `conic-gradient(
        from 0deg,
        ${COLORS.primary}99 0deg,
        ${COLORS.secondary}80 180deg,
        ${COLORS.primary}99 360deg
      )`,
    },
  },
  header: {
    getBackground: () =>
      `linear-gradient(135deg, ${COLORS.background}f2, ${COLORS.secondary}e6)`,
    getBorder: () => `${COLORS.primary}33`,
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${COLORS.primary}66 50%, transparent 100%)`,
    getLineShadow: () => `0 0 15px ${COLORS.primary}33`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
  },
  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn)
        return `linear-gradient(145deg, ${COLORS.primary}, ${COLORS.secondary})`;
      if (isCurrentUser)
        return `linear-gradient(145deg, ${COLORS.secondary}, ${COLORS.background})`;
      return `linear-gradient(145deg, ${COLORS.secondary}cc, ${COLORS.background}cc)`;
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return COLORS.accent;
      if (isCurrentUser) return `${COLORS.primary}80`;
      return `${COLORS.primary}33`;
    },
    getCardShadow: (isCurrentTurn) => {
      if (isCurrentTurn) return `0 0 25px ${COLORS.primary}66`;
      return '0 4px 16px rgba(0, 0, 0, 0.25)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '8px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '95px', maxWidth: '115px' }),
    getAvatarBackground: (isCurrentTurn) =>
      isCurrentTurn ? COLORS.accent : 'inherit',
    getAvatarBorder: (isCurrentTurn) =>
      isCurrentTurn ? COLORS.accent : `${COLORS.primary}4d`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 8px ${COLORS.primary}80` : 'none',
    getAvatarRing: (isCurrentTurn) =>
      isCurrentTurn
        ? `3px solid ${COLORS.primary}`
        : `3px solid ${COLORS.primary}33`,
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 20px ${COLORS.primary}4d` : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${COLORS.primary}99 0%, transparent 70%)`,
    getTurnIndicatorStyles: () => ({
      borderRadius: '50%',
      background: `linear-gradient(
        135deg,
        ${COLORS.primary},
        ${COLORS.secondary}
      )`,
      border: `2px solid ${COLORS.accent}`,
      animation: 'bounce 1s ease-in-out infinite',
    }),
  },
  tableInfo: {
    getBackground: () => `${COLORS.background}cc`,
    getBorder: () => `${COLORS.primary}33`,
    getShadow: () => '0 12px 32px rgba(0, 0, 0, 0.4)',
    getTextGlow: () => COLORS.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : COLORS.primary),
    getInfoCardBackground: () =>
      `linear-gradient(135deg, ${COLORS.background}f2, ${COLORS.secondary}e6)`,
    getInfoCardBorder: () => `${COLORS.primary}33`,
    getInfoCardShadow: () => '0 8px 24px rgba(0, 0, 0, 0.2)',
    getInfoCardPattern: () =>
      `repeating-linear-gradient(45deg, transparent, transparent 10px, ${COLORS.primary}05 10px, ${COLORS.primary}05 20px)`,
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
  chat: {
    getBackground: () => `${COLORS.background}cc`,
    getBorder: () => `${COLORS.secondary}cc`,
    getShadow: () => 'none',
    getInputBackground: () => COLORS.background,
    getInputBorder: () => `${COLORS.primary}33`,
    getInputFocusBorder: () => COLORS.primary,
    getInputFocusShadow: () => `0 0 0 3px ${COLORS.primary}33`,
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
