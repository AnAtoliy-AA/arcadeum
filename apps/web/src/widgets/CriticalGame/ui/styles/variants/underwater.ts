import { css } from 'styled-components';
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';

export const underwaterVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => css`
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          105deg,
          transparent 40%,
          rgba(34, 211, 238, 0.03) 45%,
          transparent 50%,
          rgba(34, 211, 238, 0.02) 55%,
          transparent 60%
        );
        filter: blur(8px);
        transform-origin: top left;
        animation: sunbeamSway 10s ease-in-out infinite alternate;
        pointer-events: none;
      }
    `,
    getRoomBackground: () => `
      radial-gradient(
        ellipse at 50% 100%,
        rgba(34, 211, 238, 0.15) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse at 50% 0%,
        rgba(8, 51, 68, 0.2) 0%,
        transparent 70%
      ),
      linear-gradient(
        180deg,
        #082f49 0%,
        ${VARIANT_COLORS.underwater.background} 100%
      )
    `,
    getRoomBorder: (isMyTurn) => {
      if (isMyTurn) return `3px solid ${VARIANT_COLORS.underwater.primary}cc`;
      return `1px solid ${VARIANT_COLORS.underwater.primary}33`;
    },
    getRoomShadow: (isMyTurn) => {
      if (isMyTurn) {
        return `0 0 20px rgba(34, 197, 94, 0.4),
            0 0 40px rgba(34, 197, 94, 0.2),
            inset 0 0 20px rgba(34, 197, 94, 0.1)`;
      }
      return `0 25px 80px rgba(0, 0, 0, 0.4),
          0 10px 30px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)`;
    },
  },
  table: {
    getBackground: () =>
      `linear-gradient(180deg, #040b15 0%, ${VARIANT_COLORS.underwater.secondary} 50%, #040b15 100%)`,
    getBorder: () => '2px solid',
    getShadow: () => `0 20px 80px rgba(0, 0, 0, 0.8),
           0 0 40px ${VARIANT_COLORS.underwater.accent}1a,
           inset 0 0 120px ${VARIANT_COLORS.underwater.primary}0d,
           inset 0 0 60px rgba(0, 0, 0, 0.5)`,
    center: {
      getBackground: () =>
        `linear-gradient(145deg, ${VARIANT_COLORS.underwater.secondary}, #155e75)`,
      getBorder: () => `2px solid ${VARIANT_COLORS.underwater.primary}4d`,
      getShadow: () => `0 12px 40px rgba(0, 0, 0, 0.5),
           inset 0 2px 4px ${VARIANT_COLORS.underwater.primary}1a,
           inset 0 -2px 8px rgba(0, 0, 0, 0.3),
           0 0 25px ${VARIANT_COLORS.underwater.primary}33`,
      getGlow: () => `conic-gradient(
              from 0deg,
              ${VARIANT_COLORS.underwater.primary}99 0deg,
              #164e63 60deg,
              ${VARIANT_COLORS.underwater.primary}66 120deg,
              ${VARIANT_COLORS.underwater.primary}4d 180deg,
              #164e63 240deg,
              ${VARIANT_COLORS.underwater.primary}80 300deg,
              ${VARIANT_COLORS.underwater.primary}99 360deg
            )`,
    },
  },
  header: {
    getBackground: () =>
      `linear-gradient(135deg, ${VARIANT_COLORS.underwater.secondary}f2, #164e63e6)`,
    getBorder: () => 'rgba(255, 255, 255, 0.1)',
    getLineBackground: () =>
      `linear-gradient(90deg, transparent 0%, ${VARIANT_COLORS.underwater.primary}99 25%, ${VARIANT_COLORS.underwater.secondary}99 50%, ${VARIANT_COLORS.underwater.primary}99 75%, transparent 100%)`,
    getLineShadow: () =>
      `0 0 10px ${VARIANT_COLORS.underwater.primary}80, 0 0 20px ${VARIANT_COLORS.underwater.secondary}4d`,
    getTitleBackground: () =>
      `linear-gradient(135deg, ${VARIANT_COLORS.underwater.primary} 0%, #0891b2 50%, ${VARIANT_COLORS.underwater.secondary} 100%)`,
    getTitleTextStyles: () => css`
      text-shadow: 0 0 10px ${VARIANT_COLORS.underwater.primary}66;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          transparent 0%,
          ${VARIANT_COLORS.underwater.primary}1a 50%,
          transparent 100%
        );
        background-size: 100% 200%;
        animation: waterReflect 3s infinite linear;
        pointer-events: none;
      }
    `,
  },
  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser, isAlive) => {
      if (!isAlive) return 'rgba(8, 51, 68, 0.4)';
      if (isCurrentTurn) return `${VARIANT_COLORS.underwater.secondary}cc`;
      if (isCurrentUser) return `${VARIANT_COLORS.underwater.secondary}99`;
      return `${VARIANT_COLORS.underwater.secondary}66`;
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return VARIANT_COLORS.underwater.primary;
      if (isCurrentUser) return `${VARIANT_COLORS.underwater.primary}99`;
      return `${VARIANT_COLORS.underwater.primary}4d`;
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn)
        return `0 0 20px ${VARIANT_COLORS.underwater.primary}66`;
      if (isCurrentUser) return '0 6px 20px rgba(0, 0, 0, 0.35)';
      return '0 4px 16px rgba(0, 0, 0, 0.25)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '4px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '80px', maxWidth: '100px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? '#fff' : theme?.background.base || 'inherit',
    getAvatarBorder: (isCurrentTurn, _theme) =>
      isCurrentTurn ? '#fff' : `${VARIANT_COLORS.underwater.primary}80`,
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn
        ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
        : 'none',
    getAvatarStyles: () => css`
      border-radius: 4px;
      background: rgba(4, 11, 21, 0.4);
      border-color: ${VARIANT_COLORS.underwater.primary}66;
      &::after {
        content: '+';
        position: absolute;
        top: -8px;
        right: -8px;
        width: 16px;
        height: 16px;
        background: ${VARIANT_COLORS.underwater.primary};
        color: #040b15;
        border-radius: 50%;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
    `,
    getNameStyles: () => css`
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #a5f3fc;
      background: rgba(4, 11, 21, 0.4);
      padding: 2px 4px;
      border-radius: 2px;
    `,
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255, 255, 255, 0.1)';
      if (isCurrentTurn)
        return `3px solid ${VARIANT_COLORS.underwater.primary}`;
      return `${VARIANT_COLORS.underwater.primary}4d`;
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn
        ? `0 0 15px ${VARIANT_COLORS.underwater.primary}99`
        : 'none',
    getTurnIndicatorGlow: () =>
      `radial-gradient(circle at center, ${VARIANT_COLORS.underwater.primary}99 0%, transparent 70%)`,
    getCardCountStyles: (isCurrentTurn?: boolean) => css`
      background: rgba(4, 11, 21, 0.6);
      border: 1px solid ${VARIANT_COLORS.underwater.primary}66;
      border-radius: 4px;
      color: #a5f3fc;
      padding: 0.15rem 0.4rem;
      font-family: 'Courier New', monospace;

      &::before {
        content: '🎴';
        font-size: 0.8rem;
        margin-right: 0.2rem;
        opacity: 0.7;
      }

      ${isCurrentTurn &&
      css`
        background: ${VARIANT_COLORS.underwater.primary}26;
        border-color: ${VARIANT_COLORS.underwater.primary};
        color: #fff;
      `}
    `,
    getTurnIndicatorStyles: () => css`
      background: radial-gradient(circle at 30% 30%, #67e8f9, #0891b2);
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 10px ${VARIANT_COLORS.underwater.primary}99;
      animation: bubbleFloat 2s ease-in-out infinite;

      @keyframes bubbleFloat {
        0%,
        100% {
          transform: translateY(0) scale(1.05);
        }
        50% {
          transform: translateY(-4px) scale(0.95);
        }
      }
    `,
  },
  tableInfo: {
    getBackground: () =>
      `linear-gradient(135deg, #083344e6, ${VARIANT_COLORS.underwater.secondary}d9)`,
    getBorder: () => `${VARIANT_COLORS.underwater.primary}4d`,
    getShadow: () =>
      `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px ${VARIANT_COLORS.underwater.primary}33`,
    getTextGlow: () => VARIANT_COLORS.underwater.primary,
    getStatValueColor: (isWarning) =>
      isWarning ? '#f43f5e' : VARIANT_COLORS.underwater.primary,
    getInfoCardBackground: () =>
      `linear-gradient(135deg, #083344e6, ${VARIANT_COLORS.underwater.secondary}d9)`,
    getInfoCardBorder: () => `${VARIANT_COLORS.underwater.primary}4d`,
    getInfoCardShadow: () =>
      `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px ${VARIANT_COLORS.underwater.primary}33`,
    getInfoCardPattern: () => `radial-gradient(
      circle at 50% 50%,
      ${VARIANT_COLORS.underwater.primary}0d 0%,
      transparent 60%
    )`,
    getStyles: () => css`
      background: rgba(4, 11, 21, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid ${VARIANT_COLORS.underwater.primary}33;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      padding: 0;
      border-radius: 8px;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          45deg,
          transparent 40%,
          ${VARIANT_COLORS.underwater.primary}08 45%,
          rgba(103, 232, 249, 0.07) 50%,
          ${VARIANT_COLORS.underwater.primary}08 55%,
          transparent 60%
        );
        background-size: 200% 200%;
        mix-blend-mode: overlay;
        animation: waterFlow 8s linear infinite;
        pointer-events: none;
      }
    `,
    getTableStatStyles: () => css`
      background: ${VARIANT_COLORS.underwater.secondary}66;
      border: 1px solid ${VARIANT_COLORS.underwater.primary}4d;
      border-radius: 8px;
      padding: 0.4rem 0.6rem;
      box-shadow: inset 0 0 10px #08334480;

      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &:hover {
        background: ${VARIANT_COLORS.underwater.primary}33;
        border-color: #67e8f9cc;
        box-shadow:
          0 0 15px ${VARIANT_COLORS.underwater.primary}40,
          inset 0 0 10px ${VARIANT_COLORS.underwater.primary}1a;
        transform: translateY(-2px) scale(1.02);

        > div:last-child {
          text-shadow:
            0 0 8px #67e8f9cc,
            0 0 12px ${VARIANT_COLORS.underwater.primary}66;
        }
      }

      &::before {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        width: 4px;
        height: 4px;
        background: rgba(165, 243, 252, 0.6);
        border-radius: 50%;
        opacity: 0;
      }

      &:hover::before {
        animation: bubbleRise 1.5s ease-out infinite;
      }

      > div:first-child {
        background: ${VARIANT_COLORS.underwater.primary}40 !important;
        color: #a5f3fc;
        box-shadow: 0 0 10px ${VARIANT_COLORS.underwater.primary}33;
      }

      > div:last-child {
        font-family: 'Courier New', monospace;
        letter-spacing: 0.5px;
        text-shadow: 0 0 4px ${VARIANT_COLORS.underwater.primary}66;
      }
    `,
    getInfoCardStyles: () => css`
      background: rgba(4, 11, 21, 0.7);
      border: 1px solid ${VARIANT_COLORS.underwater.primary}26;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    `,
  },
  chat: {
    getBackground: () => `${VARIANT_COLORS.underwater.secondary}cc`,
    getBorder: () => `1px solid ${VARIANT_COLORS.underwater.secondary}cc`,
    getShadow: () => 'none',
    getInputBackground: () => `${VARIANT_COLORS.underwater.secondary}cc`,
    getInputBorder: () => `${VARIANT_COLORS.underwater.secondary}cc`,
    getInputFocusBorder: () => VARIANT_COLORS.underwater.primary,
    getInputFocusShadow: () =>
      `0 0 10px ${VARIANT_COLORS.underwater.primary}4d`,
    getInputStyles: () => css`
      font-family: 'Courier New', monospace;
      border-radius: 8px;
      color: #a5f3fc;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

      &:focus {
        background: ${VARIANT_COLORS.underwater.secondary}f2;
      }
    `,
    getTurnStatusStyles: () => css`
      background: linear-gradient(
        90deg,
        #083344e6,
        ${VARIANT_COLORS.underwater.secondary}99
      );
      border: 1px solid ${VARIANT_COLORS.underwater.primary}4d;
      border-left: 3px solid ${VARIANT_COLORS.underwater.primary};
      font-family: 'Courier New', monospace;
      color: #a5f3fc;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    `,
  },
  cards: {
    glowEffect: `0 0 15px ${VARIANT_COLORS.underwater.primary}80`,
    borderEffect: `2px solid ${VARIANT_COLORS.underwater.primary}`,
    getCardSpriteUrl: () => '/images/cards/underwater_sprites.png',
    getDeckBackground: () =>
      "url('/images/cards/underwater_sprites.png') 0% 0% / 800% 800% no-repeat",
    getDeckBorder: () => VARIANT_COLORS.underwater.primary,
    getDecorationBackground: () => '#083344e6',
    getDecorationBorder: () =>
      `1px solid ${VARIANT_COLORS.underwater.primary}99`,
    getDecorationEffects: () => css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          45deg,
          transparent 0%,
          ${VARIANT_COLORS.underwater.primary}1a 50%,
          transparent 100%
        );
        animation: waterReflect 3s infinite linear;
        pointer-events: none;
      }
    `,
    getDisabledOverlay: () => '#083344b3',
    getCardNameStyles: () => css`
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
      background: #083344d9;
      border: 1px solid ${VARIANT_COLORS.underwater.primary};
      border-radius: 8px;
      color: #a5f3fc;
      text-shadow: 0 0 5px ${VARIANT_COLORS.underwater.primary}99;
      padding: 0.3rem 0.6rem;
      box-shadow: 0 0 10px ${VARIANT_COLORS.underwater.primary}4d;

      &::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 10px;
        background: radial-gradient(
          circle at center,
          transparent 30%,
          ${VARIANT_COLORS.underwater.primary}4d 100%
        );
        z-index: -1;
      }
    `,
    getCardDescriptionStyles: () => css`
      font-family: 'Courier New', monospace;
      font-size: 0.65rem;
      color: #ecfeff;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
    `,
  },
};
