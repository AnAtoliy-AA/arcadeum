// apps/web/src/widgets/CriticalGame/ui/styles/variants/adventure-full.ts
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';
import { adventureVariantStyles } from './adventure';

const C = VARIANT_COLORS.adventure;

export const adventureFullVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      before: {
        content: '""',
        position: 'absolute',
        top: '-60%',
        left: '-60%',
        width: '220%',
        height: '220%',
        background: `radial-gradient(circle at 30% 30%, rgba(245,158,11,0.1) 0%, transparent 35%),
                     radial-gradient(circle at 70% 70%, rgba(120,53,15,0.12) 0%, transparent 35%)`,
        animation: 'ambientGlow 12s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      },
    }),
    getRoomBackground: () => `
      radial-gradient(ellipse at 20% 0%, rgba(245,158,11,0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(120,53,15,0.2) 0%, transparent 50%),
      linear-gradient(165deg, ${C.background} 0%, #1a0a00 100%)
    `,
    getRoomBorder: (isMyTurn) =>
      isMyTurn ? `3px solid ${C.primary}cc` : `1px solid ${C.primary}33`,
    getRoomShadow: (isMyTurn) =>
      isMyTurn
        ? `0 0 20px ${C.primary}66, 0 0 40px ${C.primary}33, inset 0 0 20px ${C.primary}1a`
        : `0 25px 80px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
  },

  header: {
    getBackground: () =>
      `linear-gradient(135deg, ${C.background}f2, #1a0a00e6)`,
    getBorder: () => `${C.primary}33`,
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${C.primary}99 25%, #d97706 50%, ${C.primary}99 75%, transparent 100%)`,
    getLineShadow: () => `0 0 8px ${C.primary}66, 0 0 16px ${C.primary}33`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${C.primary} 0%, #d97706 50%, #fbbf24 100%)`,
    getTitleTextStyles: () => ({}),
  },

  table: {
    getBackground: () =>
      `linear-gradient(180deg, #1a0a00 0%, ${C.secondary} 50%, #1a0a00 100%)`,
    getBorder: () => `1px solid ${C.primary}4d`,
    getShadow: () =>
      `0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,158,11,0.06)`,
    center: {
      getBackground: () => `linear-gradient(145deg, ${C.secondary}, #3d1f00)`,
      getBorder: () => `2px solid ${C.primary}4d`,
      getShadow: () =>
        `0 12px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(245,158,11,0.08)`,
      getGlow: () => `conic-gradient(
        from 0deg,
        ${C.primary}80 0deg,
        #d9770660 60deg,
        ${C.primary}4d 120deg,
        ${C.secondary} 180deg,
        #d9770640 240deg,
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
      if (!isAlive) return `${C.secondary}66`;
      if (isCurrentTurn) return `linear-gradient(145deg, #5a2800, #3d1f00)`;
      if (isCurrentUser)
        return `linear-gradient(145deg, ${C.secondary}, ${C.background})`;
      return `linear-gradient(145deg, #2d1500, ${C.background})`;
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return C.primary;
      if (isCurrentUser) return `${C.primary}80`;
      return `${C.primary}2a`;
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn)
        return `0 0 20px ${C.primary}66, 0 8px 24px rgba(0,0,0,0.5)`;
      if (isCurrentUser) return '0 6px 20px rgba(0,0,0,0.4)';
      return '0 4px 16px rgba(0,0,0,0.3)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '8px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '85px', maxWidth: '105px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? C.secondary : theme?.background?.val || 'inherit',
    getAvatarBorder: (isCurrentTurn) =>
      isCurrentTurn ? C.primary : `${C.primary}50`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn
        ? `0 1px 3px rgba(0,0,0,0.8), 0 0 8px ${C.primary}66`
        : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255,255,255,0.08)';
      if (isCurrentTurn) return `3px solid ${C.primary}`;
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 15px ${C.primary}80` : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${C.primary}99 0%, transparent 70%)`,
    getTurnIndicatorStyles: () => ({
      background: `linear-gradient(135deg, ${C.primary}, #d97706)`,
      border: '2px solid rgba(255,255,255,0.7)',
      boxShadow: `0 0 8px ${C.primary}99`,
      animation: 'bounce 1s ease-in-out infinite',
    }),
    getCardCountStyles: () => null,
  },

  tableInfo: {
    getBackground: () =>
      `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getBorder: () => `${C.primary}33`,
    getShadow: () =>
      `0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(245,158,11,0.06)`,
    getTextGlow: () => C.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : C.primary),
    getInfoCardBackground: () =>
      `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getInfoCardBorder: () => `${C.primary}33`,
    getInfoCardShadow: () => `0 8px 24px rgba(0,0,0,0.4)`,
    getInfoCardPattern: () => `repeating-linear-gradient(
      45deg, transparent, transparent 10px,
      rgba(245,158,11,0.025) 10px, rgba(245,158,11,0.025) 20px
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

  cards: adventureVariantStyles.cards!,
};
