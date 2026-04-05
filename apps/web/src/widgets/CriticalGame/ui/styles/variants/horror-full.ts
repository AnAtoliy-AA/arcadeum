// apps/web/src/widgets/CriticalGame/ui/styles/variants/horror-full.ts
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';
import { horrorVariantStyles } from './horror';

const C = VARIANT_COLORS.horror;

export const horrorFullVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      before: {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, ${C.primary}08 0%, transparent 60%)`,
        animation: 'ambientGlow 8s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      },
    }),
    getRoomBackground: () => `
      radial-gradient(ellipse at 20% 0%, ${C.primary}0f 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, ${C.primary}0a 0%, transparent 50%),
      linear-gradient(165deg, ${C.background} 0%, #010410 100%)
    `,
    getRoomBorder: (isMyTurn) =>
      isMyTurn ? `3px solid ${C.primary}cc` : `1px solid ${C.primary}2a`,
    getRoomShadow: (isMyTurn) =>
      isMyTurn
        ? `0 0 20px ${C.primary}66, 0 0 40px ${C.primary}33, inset 0 0 20px ${C.primary}1a`
        : `0 25px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)`,
  },

  header: {
    getBackground: () =>
      `linear-gradient(135deg, ${C.background}f5, ${C.secondary}e8)`,
    getBorder: () => `${C.primary}2a`,
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${C.primary}80 25%, ${C.primary}40 50%, ${C.primary}80 75%, transparent 100%)`,
    getLineShadow: () => `0 0 10px ${C.primary}66, 0 0 20px ${C.primary}33`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${C.primary} 0%, #059669 50%, #34d399 100%)`,
    getTitleTextStyles: () => ({}),
  },

  table: {
    getBackground: () =>
      `linear-gradient(180deg, ${C.background} 0%, ${C.secondary} 50%, ${C.background} 100%)`,
    getBorder: () => `1px solid ${C.primary}33`,
    getShadow: () =>
      `0 20px 60px rgba(0,0,0,0.9), inset 0 0 60px ${C.primary}08`,
    center: {
      getBackground: () => `linear-gradient(145deg, ${C.secondary}, #0a1628)`,
      getBorder: () => `2px solid ${C.primary}4d`,
      getShadow: () =>
        `0 12px 40px rgba(0,0,0,0.7), inset 0 0 20px ${C.primary}0d`,
      getGlow: () => `conic-gradient(
        from 0deg,
        ${C.primary}99 0deg,
        #0f172a 60deg,
        ${C.primary}66 120deg,
        ${C.primary}4d 180deg,
        #0f172a 240deg,
        ${C.primary}80 300deg,
        ${C.primary}99 360deg
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
      if (isCurrentTurn) return `linear-gradient(145deg, #0a2a1e, #051a10)`;
      if (isCurrentUser)
        return `linear-gradient(145deg, ${C.secondary}, ${C.background})`;
      return `linear-gradient(145deg, #0d1f17, ${C.background})`;
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
    getCardBorderRadius: () => '4px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '85px', maxWidth: '105px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? C.secondary : theme?.background?.val || 'inherit',
    getAvatarBorder: (isCurrentTurn) =>
      isCurrentTurn ? C.primary : `${C.primary}50`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 8px ${C.primary}99` : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255,255,255,0.06)';
      if (isCurrentTurn) return `3px solid ${C.primary}`;
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? `0 0 15px ${C.primary}80` : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${C.primary}99 0%, transparent 70%)`,
    getTurnIndicatorStyles: () => ({
      background: `linear-gradient(135deg, ${C.primary}, #059669)`,
      border: '2px solid rgba(255,255,255,0.6)',
      boxShadow: `0 0 10px ${C.primary}99`,
      animation: 'bounce 1s ease-in-out infinite',
    }),
    getCardCountStyles: () => null,
  },

  tableInfo: {
    getBackground: () =>
      `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getBorder: () => `${C.primary}33`,
    getShadow: () =>
      `0 8px 32px rgba(0,0,0,0.6), inset 0 0 0 1px ${C.primary}1a`,
    getTextGlow: () => C.primary,
    getStatValueColor: (isWarning) => (isWarning ? '#ef4444' : C.primary),
    getInfoCardBackground: () =>
      `linear-gradient(135deg, ${C.background}e6, ${C.secondary}d9)`,
    getInfoCardBorder: () => `${C.primary}33`,
    getInfoCardShadow: () => `0 8px 32px rgba(0,0,0,0.5)`,
    getInfoCardPattern: () =>
      `radial-gradient(circle at 50% 50%, ${C.primary}0d 0%, transparent 60%)`,
  },

  chat: {
    getBackground: () => `${C.secondary}cc`,
    getBorder: () => `1px solid ${C.primary}2a`,
    getShadow: () => 'none',
    getInputBackground: () => `${C.secondary}cc`,
    getInputBorder: () => `${C.primary}2a`,
    getInputFocusBorder: () => C.primary,
    getInputFocusShadow: () => `0 0 10px ${C.primary}4d`,
  },

  cards: horrorVariantStyles.cards!,
};
