import { css } from 'styled-components';
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const highAltitudeHikeVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at 50% -20%,
          rgba(255, 255, 255, 0.15) 0%,
          transparent 60%
        );
        pointer-events: none;
      }
    `,
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
    getTurnIndicatorStyles: () => css`
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        ${COLORS.primary},
        ${COLORS.secondary}
      );
      border: 2px solid ${COLORS.accent};
      animation: bounce 1s ease-in-out infinite;
    `,
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
    getStyles: () => css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 12px;
        padding: 1px;
        background: linear-gradient(
          135deg,
          ${COLORS.primary}99,
          ${COLORS.secondary}66
        );
        -webkit-mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }
    `,
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
    getCardSpriteUrl: () => '/images/cards/high-altitude-hike_sprites.png',
    getDeckBackground: () =>
      `url('/images/cards/high-altitude-hike_sprites.png') 0% 0% / 800% 800% no-repeat`,
    getDeckBorder: () => COLORS.primary,
    getCardNameStyles: () => css`
      font-family: 'Inter', sans-serif;
      font-weight: 900;
      letter-spacing: 0.5px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid ${COLORS.primary};
      border-radius: 6px;
      color: ${COLORS.accent};
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
      padding: 0.25rem 0.6rem;
      box-shadow: 0 0 12px ${COLORS.primary}33;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 5px;
        border-top: 2px solid rgba(255, 255, 255, 0.4);
        pointer-events: none;
      }
    `,
    getCardInnerStyles: () => css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1) 20%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0.1) 80%,
          transparent
        );
        animation: icyShimmer 4s ease-in-out infinite;
        pointer-events: none;
        z-index: 5;
      }
    `,
  },
};
