// apps/web/src/widgets/CriticalGame/ui/styles/variants/crime-full.ts
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';
import { crimeVariantStyles } from './crime';

const C = VARIANT_COLORS.crime;

export const crimeFullVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      after: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(220,38,38,0.015) 2px,
          rgba(220,38,38,0.015) 3px
        )`,
        pointerEvents: 'none',
        zIndex: 0,
      },
    }),
    getRoomBackground: () => `
      radial-gradient(ellipse at 30% 0%, rgba(220,38,38,0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 100%, rgba(39,39,42,0.4) 0%, transparent 50%),
      linear-gradient(165deg, ${C.background} 0%, #0f0f0f 100%)
    `,
    getRoomBorder: (isMyTurn) =>
      isMyTurn ? `3px solid ${C.primary}cc` : `1px solid ${C.primary}33`,
    getRoomShadow: (isMyTurn) =>
      isMyTurn
        ? `0 0 20px ${C.primary}66, 0 0 40px ${C.primary}33, inset 0 0 20px ${C.primary}1a`
        : `0 25px 80px rgba(0,0,0,0.7), 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
  },

  header: {
    getBackground: () =>
      `linear-gradient(135deg, ${C.background}f2, #0f0f0fe6)`,
    getBorder: () => `${C.primary}33`,
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${C.primary}99 25%, #f59e0b66 50%, ${C.primary}99 75%, transparent 100%)`,
    getLineShadow: () => `0 0 8px ${C.primary}66, 0 0 16px ${C.primary}33`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${C.primary} 0%, #f97316 50%, #f59e0b 100%)`,
    getTitleTextStyles: () => ({}),
  },

  table: {
    getBackground: () =>
      `linear-gradient(180deg, #0f0f0f 0%, ${C.secondary} 50%, #0f0f0f 100%)`,
    getBorder: () => `1px solid ${C.primary}4d`,
    getShadow: () =>
      `0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.3)`,
    center: {
      getBackground: () => `linear-gradient(145deg, #1a1a1a, ${C.secondary})`,
      getBorder: () => `2px solid ${C.primary}4d`,
      getShadow: () =>
        `0 12px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.03), inset 0 -2px 8px rgba(0,0,0,0.4)`,
      getGlow: () => `conic-gradient(
        from 0deg,
        ${C.primary}80 0deg,
        #f59e0b66 60deg,
        ${C.primary}4d 120deg,
        ${C.primary}33 180deg,
        #27272a 240deg,
        ${C.primary}66 300deg,
        ${C.primary}80 360deg
      )`,
    },
    actions: {
      getContainerStyles: () => ({}),
      getTitleStyles: () => ({}),
      getButtonStyles: () => ({}),
    },
  },

  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser, isAlive) => {
      if (!isAlive) return 'rgba(39,39,42,0.4)';
      if (isCurrentTurn) return `linear-gradient(145deg, #3f0a0a, #1a0000)`;
      if (isCurrentUser) return `linear-gradient(145deg, #27272a, #18181b)`;
      return `linear-gradient(145deg, #1f1f1f, #18181b)`;
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return C.primary;
      if (isCurrentUser) return `${C.primary}80`;
      return `${C.primary}2a`;
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn)
        return `0 0 20px ${C.primary}66, 0 8px 28px rgba(0,0,0,0.5)`;
      if (isCurrentUser) return '0 6px 20px rgba(0,0,0,0.5)';
      return '0 4px 16px rgba(0,0,0,0.35)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '4px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '85px', maxWidth: '105px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? C.secondary : theme?.background?.val || 'inherit',
    getAvatarBorder: (isCurrentTurn) =>
      isCurrentTurn ? C.primary : `${C.primary}50`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn
        ? '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)'
        : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255,255,255,0.08)';
      if (isCurrentTurn) return `3px solid ${C.primary}`;
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 14px ${C.primary}80` : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${C.primary}99 0%, transparent 70%)`,
    getTurnIndicatorStyles: () => ({
      background: `linear-gradient(135deg, ${C.primary}, #f97316)`,
      border: '2px solid rgba(255,255,255,0.7)',
      boxShadow: `0 0 8px ${C.primary}99`,
      animation: 'bounce 1s ease-in-out infinite',
    }),
    getCardCountStyles: () => null,
  },

  tableInfo: {
    getBackground: () => `linear-gradient(135deg, #1a1a1ae6, ${C.secondary}d9)`,
    getBorder: () => `${C.primary}33`,
    getShadow: () =>
      `0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
    getTextGlow: () => C.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : C.primary),
    getInfoCardBackground: () =>
      `linear-gradient(135deg, #1a1a1ae6, ${C.secondary}d9)`,
    getInfoCardBorder: () => `${C.primary}33`,
    getInfoCardShadow: () =>
      `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
    getInfoCardPattern: () => `repeating-linear-gradient(
      45deg, transparent, transparent 10px,
      rgba(220,38,38,0.02) 10px, rgba(220,38,38,0.02) 20px
    )`,
  },

  chat: {
    getBackground: () => `${C.secondary}cc`,
    getBorder: () => `1px solid ${C.primary}33`,
    getShadow: () => 'none',
    getInputBackground: () => `${C.secondary}cc`,
    getInputBorder: () => `${C.primary}33`,
    getInputFocusBorder: () => C.primary,
    getInputFocusShadow: () => `0 0 10px ${C.primary}4d`,
  },

  cards: crimeVariantStyles.cards!,
};
