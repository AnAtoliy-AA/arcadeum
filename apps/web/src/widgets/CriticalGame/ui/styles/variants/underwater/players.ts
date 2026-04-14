import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

export const playersStyles = {
  getCardBackground: (
    isCurrentTurn?: boolean,
    isCurrentUser?: boolean,
    isAlive?: boolean,
  ) => {
    if (!isAlive) return 'rgba(15, 23, 42, 0.4)';
    if (isCurrentTurn) return `${VARIANT_COLORS.underwater.secondary}ee`;
    if (isCurrentUser) return `${VARIANT_COLORS.underwater.secondary}cc`;
    return `${VARIANT_COLORS.underwater.secondary}99`;
  },
  getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => {
    if (isCurrentTurn) return VARIANT_COLORS.underwater.primary;
    if (isCurrentUser) return `${VARIANT_COLORS.underwater.primary}99`;
    return `${VARIANT_COLORS.underwater.primary}33`;
  },
  getCardShadow: (isCurrentTurn?: boolean, _isCurrentUser?: boolean) => {
    if (isCurrentTurn) return `0 0 25px ${VARIANT_COLORS.underwater.primary}40`;
    return '0 8px 32px rgba(0, 0, 0, 0.4)';
  },
  getCardGap: () => '0.5rem',
  getCardPadding: () => '1rem',
  getCardBorderRadius: () => '12px',
  getCardClipPath: () => 'none',
  getCardDimensions: () => ({ minWidth: '100px', maxWidth: '140px' }),
  getAvatarBackground: (isCurrentTurn?: boolean, _theme?: TamaguiTheme) =>
    isCurrentTurn ? VARIANT_COLORS.underwater.primary : 'rgba(2, 6, 23, 0.6)',
  getAvatarBorder: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? '#fff' : `${VARIANT_COLORS.underwater.primary}4d`,
  getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean) => {
    if (isEliminated) return '2px solid rgba(255, 255, 255, 0.1)';
    if (isCurrentTurn) return `3px solid ${VARIANT_COLORS.underwater.primary}`;
    return `1px solid ${VARIANT_COLORS.underwater.primary}4d`;
  },
  getAvatarShadow: (isCurrentTurn: boolean) =>
    isCurrentTurn ? `0 0 20px ${VARIANT_COLORS.underwater.primary}80` : 'none',
  getNameShadow: (isCurrentTurn?: boolean) =>
    isCurrentTurn ? `0 0 10px ${VARIANT_COLORS.underwater.primary}` : 'none',
  getTurnIndicatorGlow: () =>
    `radial-gradient(circle at center, ${VARIANT_COLORS.underwater.primary} 0%, transparent 70%)`,
  getAvatarStyles: () => ({
    borderRadius: '50%',
    backdropFilter: 'blur(8px)',
    borderWidth: 2,
  }),
  getNameStyles: () => ({
    fontFamily: 'unset',
    fontWeight: '700',
    fontSize: '0.875rem',
    color: '#f0f9ff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  }),
  getCardCountStyles: (isCurrentTurn?: boolean) => ({
    background: 'rgba(2, 6, 23, 0.8)',
    borderRadius: '20px',
    padding: '0.2rem 0.6rem',
    border: `1px solid ${VARIANT_COLORS.underwater.primary}4d`,
    boxShadow: isCurrentTurn
      ? `0 0 10px ${VARIANT_COLORS.underwater.primary}40`
      : 'none',
  }),
  getTurnIndicatorStyles: () => ({
    width: 12,
    height: 12,
    borderRadius: 6,
    background: '#fff',
    boxShadow: `0 0 15px #fff, 0 0 30px ${VARIANT_COLORS.underwater.primary}`,
    animation: 'pulseGlow 2s infinite',
  }),
};
