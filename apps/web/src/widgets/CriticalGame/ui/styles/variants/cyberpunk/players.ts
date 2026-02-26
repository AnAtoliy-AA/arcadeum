import { css, RuleSet, DefaultTheme } from 'styled-components';
import { VARIANT_COLORS } from '../../variant-palette';

export const playersStyles = {
  getCardBackground: (
    isCurrentTurn?: boolean,
    isCurrentUser?: boolean,
    isAlive?: boolean,
  ): string => {
    if (!isAlive) return 'linear-gradient(145deg, #2d1f3d, #1a1025)';
    if (isCurrentTurn)
      return `linear-gradient(145deg, ${VARIANT_COLORS.cyberpunk.secondary}, #7c3aed)`;
    if (isCurrentUser)
      return `linear-gradient(145deg, #701a75, ${VARIANT_COLORS.cyberpunk.background})`;
    return `linear-gradient(145deg, #3d1a4a, ${VARIANT_COLORS.cyberpunk.background})`;
  },
  getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean): string => {
    if (isCurrentTurn) return `${VARIANT_COLORS.cyberpunk.secondary}99`;
    if (isCurrentUser) return `${VARIANT_COLORS.cyberpunk.primary}80`;
    return `${VARIANT_COLORS.cyberpunk.secondary}40`;
  },
  getCardShadow: (isCurrentTurn?: boolean, isCurrentUser?: boolean): string => {
    if (isCurrentTurn)
      return `0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px ${VARIANT_COLORS.cyberpunk.secondary}80`;
    if (isCurrentUser)
      return `0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px ${VARIANT_COLORS.cyberpunk.primary}4d`;
    return `0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px ${VARIANT_COLORS.cyberpunk.secondary}26`;
  },
  getCardGap: (): string => '0.2rem',
  getCardPadding: (): string => '0.85rem 0.75rem',
  getCardBorderRadius: (): string => '0',
  getCardClipPath: (): string =>
    'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
  getCardDimensions: () => ({ minWidth: '95px', maxWidth: '115px' }),
  getAvatarBackground: (
    isCurrentTurn?: boolean,
    theme?: DefaultTheme,
  ): string => (isCurrentTurn ? '#fff' : theme?.background.base || 'inherit'),
  getAvatarBorder: (isCurrentTurn?: boolean, theme?: DefaultTheme): string =>
    isCurrentTurn ? '#fff' : theme?.surfaces.card.border || 'inherit',
  getNameShadow: (isCurrentTurn?: boolean): string =>
    isCurrentTurn
      ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
      : 'none',
  getStyles: (): RuleSet<object> => css`
    background: rgba(10, 5, 16, 0.6);
    border: none;
    border-radius: 0;
    clip-path: none;
    position: relative;
    overflow: visible;
    box-shadow: none;
    padding: 1rem 0.5rem;
    gap: 0.25rem;
    transition: all 0.2s ease-out;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 1px solid transparent;
      background:
        linear-gradient(
            to right,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          0 0,
        linear-gradient(
            to bottom,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          0 0,
        linear-gradient(
            to left,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          100% 0,
        linear-gradient(
            to bottom,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          100% 0,
        linear-gradient(
            to right,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          0 100%,
        linear-gradient(
            to top,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          0 100%,
        linear-gradient(
            to left,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          100% 100%,
        linear-gradient(
            to top,
            ${VARIANT_COLORS.cyberpunk.secondary} 2px,
            transparent 2px
          )
          100% 100%;
      background-repeat: no-repeat;
      background-size: 10px 10px;
      pointer-events: none;
      transition: all 0.3s ease;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: repeating-linear-gradient(
        0deg,
        ${VARIANT_COLORS.cyberpunk.secondary}0d 0px,
        ${VARIANT_COLORS.cyberpunk.secondary}0d 1px,
        transparent 1px,
        transparent 3px
      );
      pointer-events: none;
      z-index: -1;
    }

    &:hover {
      transform: translateY(-2px);
      &::before {
        opacity: 1;
        box-shadow: 0 0 15px ${VARIANT_COLORS.cyberpunk.secondary}66;
        background-size: 12px 12px;
        border-color: ${VARIANT_COLORS.cyberpunk.secondary}1a;
      }
    }
  `,
  getAvatarStyles: (): RuleSet<object> => css`
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    border: none;
    border-radius: 0;
    background: #000;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid ${VARIANT_COLORS.cyberpunk.primary}cc;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      pointer-events: none;
    }

    &::before {
      content: '';
      position: absolute;
      inset: -4px;
      border: 1px dashed ${VARIANT_COLORS.cyberpunk.primary}4d;
      border-radius: 50%;
      animation: spinAvatar 10s linear infinite;
    }

    @keyframes spinAvatar {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
  getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean): string => {
    if (isEliminated) return `${VARIANT_COLORS.cyberpunk.secondary}4d`;
    if (isCurrentTurn) return `3px solid ${VARIANT_COLORS.cyberpunk.primary}`;
    return `${VARIANT_COLORS.cyberpunk.secondary}33`;
  },
  getAvatarShadow: (isCurrentTurn: boolean): string =>
    isCurrentTurn ? `0 0 15px ${VARIANT_COLORS.cyberpunk.primary}80` : 'none',
  getTurnIndicatorGlow: (): string =>
    `radial-gradient(circle at center, ${VARIANT_COLORS.cyberpunk.primary}80 0%, transparent 70%)`,
  getCardCountStyles: (
    isCurrentTurn?: boolean,
    type?: 'default' | 'stash' | 'marked',
  ): RuleSet<object> => css`
    border-radius: 2px;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.5px;
    padding: 0.2rem 0.4rem;
    text-shadow: 0 0 5px currentColor;

    ${!type &&
    css`
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid ${VARIANT_COLORS.cyberpunk.primary}66;
      border-left: 3px solid ${VARIANT_COLORS.cyberpunk.primary}cc;
      color: ${VARIANT_COLORS.cyberpunk.primary};

      ${isCurrentTurn &&
      css`
        color: #fff;
        border-color: ${VARIANT_COLORS.cyberpunk.secondary}99;
        border-left-color: ${VARIANT_COLORS.cyberpunk.secondary};
        background: ${VARIANT_COLORS.cyberpunk.secondary}1a;
      `}
    `}

    ${type === 'stash' &&
    css`
      background: rgba(234, 179, 8, 0.1);
      color: #eab308;
      border: 1px solid rgba(234, 179, 8, 0.4);
      border-left: 3px solid #eab308;
    `}

    ${type === 'marked' &&
    css`
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-left: 3px solid #ef4444;
    `}
  `,
  getTurnIndicatorStyles: (): RuleSet<object> => css`
    width: 30px;
    height: 30px;
    top: -12px;
    right: -12px;
    background: transparent;
    border: none;
    font-size: 0;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 2px solid ${VARIANT_COLORS.cyberpunk.danger};
      border-radius: 50%;
      border-left-color: transparent;
      border-right-color: transparent;
      animation: reticleSpin 2s linear infinite;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 8px;
      background: ${VARIANT_COLORS.cyberpunk.danger};
      border-radius: 50%;
      animation: reticlePulse 1s ease-in-out infinite;
    }
  `,
};
