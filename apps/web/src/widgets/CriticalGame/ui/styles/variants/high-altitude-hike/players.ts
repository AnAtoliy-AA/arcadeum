import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const playersStyles = {
  getCardBackground: (
    isCurrentTurn?: boolean,
    isCurrentUser?: boolean,
    isAlive?: boolean,
  ) => {
    if (!isAlive) return 'rgba(15, 23, 42, 0.4)';
    if (isCurrentTurn) return `${COLORS.secondary}ee`;
    if (isCurrentUser) return `${COLORS.secondary}cc`;
    return `${COLORS.secondary}99`;
  },
  getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => {
    if (isCurrentTurn) return COLORS.accent;
    if (isCurrentUser) return `${COLORS.primary}80`;
    return `${COLORS.primary}2a`;
  },
  getCardShadow: (isCurrentTurn?: boolean, _isCurrentUser?: boolean) => {
    if (isCurrentTurn) return `0 0 25px ${COLORS.primary}40`;
    return '0 8px 32px rgba(0, 0, 0, 0.4)';
  },
  getCardGap: () => '0.4rem',
  getCardPadding: () => '0.75rem',
  getCardBorderRadius: () => '8px',
  getCardClipPath: () => 'none',
  getCardDimensions: () => ({ minWidth: '95px', maxWidth: '125px' }),
  getAvatarBackground: (isCurrentTurn?: boolean, _theme?: TamaguiTheme) =>
    isCurrentTurn ? COLORS.primary : 'rgba(2, 6, 23, 0.6)',
  getAvatarBorder: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? '#fff' : `${COLORS.primary}4d`,
  getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean) => {
    if (isEliminated) return '2px solid rgba(255, 255, 255, 0.1)';
    if (isCurrentTurn) return `3px solid ${COLORS.primary}`;
    return `1px solid ${COLORS.primary}4d`;
  },
  getAvatarShadow: (isCurrentTurn: boolean) =>
    isCurrentTurn ? `0 0 15px ${COLORS.primary}66` : 'none',
  getNameShadow: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? `0 0 10px ${COLORS.primary}` : 'none',
  getTurnIndicatorGlow: () =>
    `radial-gradient(circle at center, ${COLORS.primary} 0%, transparent 70%)`,
  getAvatarStyles: () => ({
    borderRadius: 8,
    borderWidth: 2,
    backdropFilter: 'blur(8px)',
  }),
  getNameStyles: () => ({
    fontFamily: 'sans-serif',
    fontWeight: '700',
    fontSize: '0.8rem',
    color: '#f8fafc',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  }),
  getCardCountStyles: (isCurrentTurn?: boolean) => ({
    background: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 4,
    padding: '0.2rem 0.5rem',
    border: `1px solid ${COLORS.primary}4d`,
    color: isCurrentTurn ? COLORS.primary : '#94a3b8',
  }),
  getTurnIndicatorStyles: () => ({
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    boxShadow: `0 0 15px #fff, 0 0 30px ${COLORS.primary}`,
    animation: 'pulse 2s infinite',
  }),
};
