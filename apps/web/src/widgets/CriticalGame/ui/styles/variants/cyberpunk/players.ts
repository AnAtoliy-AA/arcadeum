import { TamaguiTheme } from '../types';
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
  getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => {
    if (isCurrentTurn) return `${VARIANT_COLORS.cyberpunk.secondary}99`;
    if (isCurrentUser) return `${VARIANT_COLORS.cyberpunk.primary}80`;
    return `${VARIANT_COLORS.cyberpunk.secondary}40`;
  },
  getCardShadow: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => {
    if (isCurrentTurn)
      return `0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px ${VARIANT_COLORS.cyberpunk.secondary}80`;
    if (isCurrentUser)
      return `0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px ${VARIANT_COLORS.cyberpunk.primary}4d`;
    return `0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px ${VARIANT_COLORS.cyberpunk.secondary}26`;
  },
  getCardGap: () => '0.2rem',
  getCardPadding: () => '0.85rem 0.75rem',
  getCardBorderRadius: () => '0',
  getCardClipPath: () =>
    'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
  getCardDimensions: () => ({ minWidth: '95px', maxWidth: '115px' }),
  getAvatarBackground: (
    isCurrentTurn?: boolean,
    theme?: TamaguiTheme,
  ): string =>
    isCurrentTurn
      ? '#fff'
      : (theme?.background as { val: string })?.val || 'inherit',
  getAvatarBorder: (isCurrentTurn?: boolean, theme?: TamaguiTheme): string =>
    isCurrentTurn
      ? '#fff'
      : (theme?.borderColor as { val: string })?.val || 'inherit',
  getNameShadow: (isCurrentTurn?: boolean): string =>
    isCurrentTurn
      ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
      : 'none',
  getStyles: () => ({
    background: 'rgba(10, 5, 16, 0.6)',
    borderWidth: 0,
    borderRadius: 0,
    position: 'relative',
    padding: '1rem 0.5rem',
    gap: '0.25rem',

    before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'transparent',
      background: `
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
          100% 100%
      `,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '10px 10px',
      pointerEvents: 'none',
    },

    after: {
      content: '""',
      position: 'absolute',
      inset: 2,
      background: `repeating-linear-gradient(
        0deg,
        ${VARIANT_COLORS.cyberpunk.secondary}0d 0px,
        ${VARIANT_COLORS.cyberpunk.secondary}0d 1px,
        transparent 1px,
        transparent 3px
      )`,
      pointerEvents: 'none',
      zIndex: -1,
    },

    hoverStyle: {
      transform: [{ translateY: -2 }],
      before: {
        opacity: 1,
        boxShadow: `0 0 15px ${VARIANT_COLORS.cyberpunk.secondary}66`,
        backgroundSize: '12px 12px',
        borderColor: `${VARIANT_COLORS.cyberpunk.secondary}1a`,
      },
    },
  }),
  getAvatarStyles: () => ({
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    borderWidth: 0,
    borderRadius: 0,
    background: '#000',

    after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: `${VARIANT_COLORS.cyberpunk.primary}cc`,
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      pointerEvents: 'none',
    },

    before: {
      content: '""',
      position: 'absolute',
      inset: -4,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: `${VARIANT_COLORS.cyberpunk.primary}4d`,
      borderRadius: '50%',
      animation: 'spinAvatar 10s linear infinite',
    },
  }),
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
  ) => ({
    borderRadius: 2,
    fontFamily: '"Courier New", monospace',
    letterSpacing: '0.5px',
    padding: '0.2rem 0.4rem',
    textShadow: '0 0 5px currentColor',

    ...(!type && {
      background: 'rgba(0, 0, 0, 0.6)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: `${VARIANT_COLORS.cyberpunk.primary}66`,
      borderLeftWidth: 3,
      borderLeftColor: `${VARIANT_COLORS.cyberpunk.primary}cc`,
      color: VARIANT_COLORS.cyberpunk.primary,

      ...(isCurrentTurn && {
        color: '#fff',
        borderColor: `${VARIANT_COLORS.cyberpunk.secondary}99`,
        borderLeftColor: VARIANT_COLORS.cyberpunk.secondary,
        background: `${VARIANT_COLORS.cyberpunk.secondary}1a`,
      }),
    }),

    ...(type === 'stash' && {
      background: 'rgba(234, 179, 8, 0.1)',
      color: '#eab308',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(234, 179, 8, 0.4)',
      borderLeftWidth: 3,
      borderLeftColor: '#eab308',
    }),

    ...(type === 'marked' && {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      borderLeftWidth: 3,
      borderLeftColor: '#ef4444',
    }),
  }),
  getTurnIndicatorStyles: () => ({
    width: 30,
    height: 30,
    top: -12,
    right: -12,
    background: 'transparent',
    borderWidth: 0,

    before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: VARIANT_COLORS.cyberpunk.danger,
      borderRadius: '50%',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      animation: 'reticleSpin 2s linear infinite',
    },

    after: {
      content: '""',
      position: 'absolute',
      inset: 8,
      background: VARIANT_COLORS.cyberpunk.danger,
      borderRadius: '50%',
      animation: 'reticlePulse 1s ease-in-out infinite',
    },
  }),
};
