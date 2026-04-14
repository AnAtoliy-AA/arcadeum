import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const C = VARIANT_COLORS.horror;

export const playersStyles = {
  getCardBackground: (
    isCurrentTurn?: boolean,
    isCurrentUser?: boolean,
    isAlive?: boolean,
  ) => {
    if (!isAlive) return 'rgba(2, 6, 23, 0.4)';
    if (isCurrentTurn) return '#051a10';
    if (isCurrentUser) return '#020617';
    return '#000000';
  },
  getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => {
    if (isCurrentTurn) return C.primary;
    if (isCurrentUser) return `${C.primary}80`;
    return `${C.primary}1a`;
  },
  getCardShadow: (isCurrentTurn?: boolean, _isCurrentUser?: boolean) => {
    if (isCurrentTurn) return `0 0 30px ${C.primary}33`;
    return '0 8px 32px rgba(0, 0, 0, 0.8)';
  },
  getCardGap: () => '0.5rem',
  getCardPadding: () => '1rem',
  getCardBorderRadius: () => '2px', // Very sharp
  getCardClipPath: () => 'none',
  getCardDimensions: () => ({ minWidth: '95px', maxWidth: '125px' }),
  getAvatarBackground: (isCurrentTurn?: boolean, _theme?: TamaguiTheme) =>
    isCurrentTurn ? C.primary : '#000',
  getAvatarBorder: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? '#fff' : `${C.primary}33`,
  getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean) => {
    if (isEliminated) return '2px solid rgba(255, 255, 255, 0.05)';
    if (isCurrentTurn) return `3px solid ${C.primary}`;
    return `1px solid ${C.primary}2a`;
  },
  getAvatarShadow: (isCurrentTurn: boolean) =>
    isCurrentTurn ? `0 0 15px ${C.primary}40` : 'none',
  getNameShadow: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? `0 0 10px ${C.primary}` : 'none',
  getTurnIndicatorGlow: () =>
    `radial-gradient(circle at center, ${C.accent} 0%, transparent 70%)`,
  getAvatarStyles: () => ({
    borderRadius: 0,
    borderWidth: 1,
    boxShadow: `inset 0 0 10px rgba(0,0,0,0.8)`,
  }),
  getNameStyles: () => ({
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: '0.8rem',
    color: '#d1d5db',
    textTransform: 'uppercase' as const,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: '4px 6px',
    letterSpacing: '2px',
  }),
  getCardCountStyles: (isCurrentTurn?: boolean) => ({
    background: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 0,
    padding: '0.15rem 0.5rem',
    border: `1px solid ${C.primary}40`,
    color: isCurrentTurn ? C.primary : '#9ca3af',
    fontFamily: 'serif',
  }),
  getTurnIndicatorStyles: () => ({
    width: 12,
    height: 12,
    backgroundColor: C.accent,
    boxShadow: `0 0 15px ${C.accent}, 0 0 30px ${C.accent}80`,
    animation: 'breathingGlow 3s ease-in-out infinite',
  }),
};
