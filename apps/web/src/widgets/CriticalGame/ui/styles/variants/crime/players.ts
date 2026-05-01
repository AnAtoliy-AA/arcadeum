import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const C = VARIANT_COLORS.crime;

export const playersStyles = {
  getCardBackground: (
    isCurrentTurn?: boolean,
    isCurrentUser?: boolean,
    isAlive?: boolean,
  ) => {
    if (!isAlive) return 'rgba(24, 24, 27, 0.4)';
    if (isCurrentTurn) return '#1a1a1a';
    if (isCurrentUser) return '#111111';
    return '#09090b';
  },
  getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => {
    if (isCurrentTurn) return C.primary;
    if (isCurrentUser) return `${C.primary}99`;
    return `${C.primary}33`;
  },
  getCardShadow: (isCurrentTurn?: boolean, _isCurrentUser?: boolean) => {
    if (isCurrentTurn) return `0 0 20px ${C.primary}40`;
    return '0 8px 32px rgba(0, 0, 0, 0.6)';
  },
  getCardGap: () => '0.4rem',
  getCardPadding: () => '0.75rem',
  getCardBorderRadius: () => '4px',
  getCardClipPath: () => 'none',
  getCardDimensions: () => ({ minWidth: '90px', maxWidth: '120px' }),
  getAvatarBackground: (isCurrentTurn?: boolean, _theme?: TamaguiTheme) =>
    isCurrentTurn ? C.primary : 'rgba(0, 0, 0, 0.6)',
  getAvatarBorder: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? '#fff' : `${C.primary}4d`,
  getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean) => {
    if (isEliminated) return '2px solid rgba(255, 255, 255, 0.05)';
    if (isCurrentTurn) return `3px solid ${C.primary}`;
    return `1px solid ${C.primary}4d`;
  },
  getAvatarShadow: (isCurrentTurn: boolean) =>
    isCurrentTurn ? `0 0 15px ${C.primary}66` : 'none',
  getNameShadow: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? `0 0 8px ${C.primary}` : 'none',
  getTurnIndicatorGlow: () =>
    `radial-gradient(circle at center, ${C.primary} 0%, transparent 70%)`,
  getAvatarStyles: () => ({
    borderRadius: 4,
    borderWidth: 2,
    background: '#000',
  }),
  getNameStyles: () => ({
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '0.75rem',
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: '2px 4px',
  }),
  getCardCountStyles: (isCurrentTurn?: boolean) => ({
    background: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 2,
    padding: '0.1rem 0.4rem',
    border: `1px solid ${C.primary}66`,
    color: isCurrentTurn ? C.primary : '#fff',
    fontFamily: 'monospace',
  }),
  getTurnIndicatorStyles: () => ({
    width: 10,
    height: 10,
    backgroundColor: C.primary,
    boxShadow: `0 0 10px ${C.primary}, 0 0 20px ${C.primary}80`,
    animation: 'pulse 1.5s infinite',
  }),
};
