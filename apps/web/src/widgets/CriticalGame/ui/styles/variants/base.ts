import { css } from 'styled-components';
import { VariantStyleConfig } from './types';
import { GAME_VARIANT } from '../../../lib/constants';
import { VARIANT_COLORS } from '../variant-palette';

export const baseVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => css`
      &::before {
        content: '';
        position: absolute;
        top: -60%;
        left: -60%;
        width: 220%;
        height: 220%;
        background: radial-gradient(
            circle at 30% 30%,
            rgba(99, 102, 241, 0.12) 0%,
            transparent 35%
          ),
          radial-gradient(
            circle at 70% 70%,
            rgba(236, 72, 153, 0.1) 0%,
            transparent 35%
          );
        animation: ambientGlow 12s ease-in-out infinite;
        pointer-events: none;
        z-index: 0;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(99, 102, 241, 0.8) 15%,
          rgba(236, 72, 153, 0.8) 50%,
          rgba(16, 185, 129, 0.8) 85%,
          transparent 100%
        );
        box-shadow:
          0 0 30px rgba(99, 102, 241, 0.5),
          0 0 60px rgba(236, 72, 153, 0.3);
        animation: shimmer 6s ease-in-out infinite;
      }
    `,
    getRoomBackground: (themeBase, themeCardBg) => `
      radial-gradient(
        ellipse at 20% 0%,
        rgba(99, 102, 241, 0.15) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 100%,
        rgba(236, 72, 153, 0.12) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 50% 50%,
        rgba(16, 185, 129, 0.08) 0%,
        transparent 60%
      ),
      linear-gradient(
        165deg,
        ${themeBase} 0%,
        ${themeCardBg} 100%
      )
    `,
    getRoomBorder: (isMyTurn, themeBorder) => {
      if (isMyTurn) return '3px solid rgba(34, 197, 94, 0.8)';
      return `1px solid ${themeBorder}`;
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
      `linear-gradient(180deg, ${VARIANT_COLORS.default.secondary} 0%, #1e1b4b 50%, ${VARIANT_COLORS.default.secondary} 100%)`,
    getBorder: () => `1px solid ${VARIANT_COLORS.default.primary}`,
    getShadow: () => `0 20px 60px rgba(0, 0, 0, 0.4),
           inset 0 1px 0 rgba(255, 255, 255, 0.05),
           inset 0 -1px 0 rgba(0, 0, 0, 0.2)`,
    center: {
      getBackground: () => 'linear-gradient(145deg, #1e293b, #0f172a)',
      getBorder: () => '2px solid rgba(99, 102, 241, 0.3)',
      getShadow: () => `0 12px 40px rgba(0, 0, 0, 0.4),
           inset 0 2px 4px rgba(255, 255, 255, 0.05),
           inset 0 -2px 8px rgba(0, 0, 0, 0.3)`,
      getGlow: () => `conic-gradient(
        from 0deg,
        rgba(99, 102, 241, 0.6) 0deg,
        rgba(168, 85, 247, 0.5) 60deg,
        rgba(236, 72, 153, 0.4) 120deg,
        rgba(99, 102, 241, 0.3) 180deg,
        rgba(16, 185, 129, 0.4) 240deg,
        rgba(59, 130, 246, 0.5) 300deg,
        rgba(99, 102, 241, 0.6) 360deg
      )`,
    },
    actions: {
      getContainerStyles: () => css``,
      getTitleStyles: () => css``,
      getButtonStyles: () => css``,
    },
  },
  header: {
    getBackground: (theme) =>
      `linear-gradient(135deg, ${theme.surfaces.card.background}f5, ${theme.surfaces.panel.background}e8)`,
    getBorder: (theme) => `${theme.surfaces.card.border}40`,
    getLineBackground: () =>
      'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.4) 25%, rgba(236, 72, 153, 0.4) 50%, rgba(16, 185, 129, 0.4) 75%, transparent 100%)',
    getLineShadow: () => 'none',
    getTitleBackground: () =>
      'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #10b981 100%)',
  },
  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser, isAlive) => {
      if (!isAlive) return 'linear-gradient(145deg, #374151, #1f2937)';
      if (isCurrentTurn) return 'linear-gradient(145deg, #4f46e5, #7c3aed)';
      if (isCurrentUser) return 'linear-gradient(145deg, #1e40af, #1e293b)';
      return 'linear-gradient(145deg, #334155, #1e293b)';
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return 'rgba(255, 255, 255, 0.4)';
      if (isCurrentUser) return 'rgba(99, 102, 241, 0.6)';
      return 'rgba(255, 255, 255, 0.15)';
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn)
        return '0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.5)';
      if (isCurrentUser) return '0 6px 20px rgba(0, 0, 0, 0.35)';
      return '0 4px 16px rgba(0, 0, 0, 0.25)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '14px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '95px', maxWidth: '115px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? '#fff' : theme?.background.base || 'inherit',
    getAvatarBorder: (isCurrentTurn, theme) =>
      isCurrentTurn ? '#fff' : theme?.surfaces.card.border || 'inherit',
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn
        ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
        : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255, 255, 255, 0.1)';
      if (isCurrentTurn) return '3px solid #10b981';
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
    getTurnIndicatorGlow: () =>
      'radial-gradient(circle at center, rgba(16, 185, 129, 0.8) 0%, transparent 70%)',
    getCardCountStyles: () => null,
    getTurnIndicatorStyles: () => css`
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #ffa500);
      border: 2px solid white;
      font-size: 0.75rem;
      animation: bounce 1s ease-in-out infinite;
    `,
  },
  tableInfo: {
    getBackground: () => 'rgba(15, 23, 42, 0.85)',
    getBorder: () => '1px solid transparent',
    getShadow: () =>
      '0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
    getTextGlow: () => 'inherit',
    getStatValueColor: (isWarning) => (isWarning ? '#DC2626' : 'inherit'),
    getInfoCardBackground: (theme) =>
      `linear-gradient(135deg, ${theme?.surfaces.panel.background}ee, ${theme?.surfaces.card.background}dd)`,
    getInfoCardBorder: (theme) => theme?.surfaces.panel.border || 'inherit',
    getInfoCardShadow: () =>
      '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    getInfoCardPattern: () => `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.02) 10px,
      rgba(255, 255, 255, 0.02) 20px
    )`,
    getStyles: () => css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 16px;
        padding: 1px;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.6),
          rgba(168, 85, 247, 0.4),
          rgba(236, 72, 153, 0.3),
          rgba(99, 102, 241, 0.6)
        );
        -webkit-mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: shimmer 3s ease-in-out infinite;
      }
    `,
  },
  chat: {
    getBackground: () => 'inherit',
    getBorder: () => 'inherit',
    getShadow: () => 'none',
    getInputBackground: (theme) => theme.background.base,
    getInputBorder: (theme) => theme.surfaces.card.border,
    getInputFocusBorder: (theme) => theme.buttons.primary.gradientStart,
    getInputFocusShadow: () => '0 0 0 3px rgba(59, 130, 246, 0.2)',
  },
  cards: {
    glowEffect: `${VARIANT_COLORS.default.primary}`,
    borderEffect: `2px solid ${VARIANT_COLORS.default.primary}`,
    getCardSpriteUrl: (variant) => {
      if (variant === GAME_VARIANT.CRIME)
        return '/images/cards/crime_sprites.png';
      if (variant === GAME_VARIANT.HORROR)
        return '/images/cards/horror_sprites.png';
      if (variant === GAME_VARIANT.ADVENTURE)
        return '/images/cards/adventure_sprites.png';
      return undefined;
    },
    getDeckBackground: (variant) => {
      if (variant === GAME_VARIANT.CRIME)
        return 'linear-gradient(135deg, #18181b 0%, #27272a 100%)';
      if (variant === GAME_VARIANT.HORROR)
        return 'linear-gradient(135deg, #020617 0%, #0f172a 100%)';
      if (variant === GAME_VARIANT.ADVENTURE)
        return 'linear-gradient(135deg, #451a03 0%, #78350f 100%)';
      return `linear-gradient(135deg, ${VARIANT_COLORS.default.background} 0%, ${VARIANT_COLORS.default.secondary} 100%)`;
    },
    getDeckBorder: (variant) => {
      if (variant === GAME_VARIANT.CRIME) return VARIANT_COLORS.crime.primary;
      if (variant === GAME_VARIANT.HORROR) return VARIANT_COLORS.horror.primary;
      if (variant === GAME_VARIANT.ADVENTURE)
        return VARIANT_COLORS.adventure.primary;
      return VARIANT_COLORS.default.primary;
    },
  },
};
