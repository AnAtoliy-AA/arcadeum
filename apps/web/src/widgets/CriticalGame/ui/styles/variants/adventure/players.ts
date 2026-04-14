import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const C = VARIANT_COLORS.adventure;

export const playersStyles = {
  getCardBackground: (
    isCurrentTurn?: boolean,
    isCurrentUser?: boolean,
    isAlive?: boolean,
  ) => {
    if (!isAlive) return 'rgba(28, 25, 23, 0.4)';
    if (isCurrentTurn) return '#451a03';
    if (isCurrentUser) return '#292524';
    return '#1c1917';
  },
  getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => {
    if (isCurrentTurn) return C.primary;
    if (isCurrentUser) return `${C.primary}99`;
    return `${C.primary}33`;
  },
  getCardShadow: (isCurrentTurn?: boolean, _isCurrentUser?: boolean) => {
    if (isCurrentTurn) return `0 0 30px ${C.primary}40`;
    return '0 8px 32px rgba(0, 0, 0, 0.5)';
  },
  getCardGap: () => '0.5rem',
  getCardPadding: () => '1rem',
  getCardBorderRadius: () => '12px',
  getCardClipPath: () => 'none',
  getCardDimensions: () => ({ minWidth: '100px', maxWidth: '140px' }),
  getAvatarBackground: (isCurrentTurn?: boolean, _theme?: TamaguiTheme) =>
    isCurrentTurn ? C.primary : 'rgba(12, 10, 9, 0.6)',
  getAvatarBorder: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? '#fff' : `${C.primary}4d`,
  getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean) => {
    if (isEliminated) return '2px solid rgba(255, 255, 255, 0.1)';
    if (isCurrentTurn) return `3px solid ${C.primary}`;
    return `1px solid ${C.primary}4d`;
  },
  getAvatarShadow: (isCurrentTurn: boolean) =>
    isCurrentTurn ? `0 0 20px ${C.primary}80` : 'none',
  getNameShadow: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? `0 0 10px ${C.primary}` : 'none',
  getTurnIndicatorGlow: () =>
    `radial-gradient(circle at center, ${C.primary} 0%, transparent 70%)`,
  getAvatarStyles: () => ({
    borderRadius: 8,
    borderWidth: 2,
    backdropFilter: 'blur(4px)',
  }),
  getNameStyles: () => ({
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: '0.875rem',
    color: '#fef3c7',
    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
  }),
  getCardCountStyles: (isCurrentTurn?: boolean) => ({
    background: 'rgba(12, 10, 9, 0.8)',
    borderRadius: 8,
    padding: '0.2rem 0.6rem',
    border: `1px solid ${C.primary}4d`,
    color: isCurrentTurn ? C.primary : '#d6d3d1',
    fontFamily: 'serif',
  }),
  getTurnIndicatorStyles: () => ({
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    boxShadow: `0 0 15px #fff, 0 0 30px ${C.primary}`,
    animation: 'pulse 2s infinite',
  }),
};
