import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';

export const getTableBackground = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `linear-gradient(180deg, #0a0a0f 0%, ${VARIANT_COLORS.cyberpunk.cardBack} 50%, #0a0a0f 100%)`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return 'linear-gradient(180deg, #040b15 0%, #061828 50%, #040b15 100%)';
  }
  return 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)';
};

export const getTableBorder = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `1px solid ${VARIANT_COLORS.cyberpunk.secondary}4D`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return '2px solid';
  }
  return '1px solid rgba(99, 102, 241, 0.2)';
};

export const getTableShadow = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `0 20px 60px rgba(0, 0, 0, 0.5),
         inset 0 1px 0 ${VARIANT_COLORS.cyberpunk.secondary}14,
         inset 0 -1px 0 rgba(0, 0, 0, 0.3)`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return `0 20px 80px rgba(0, 0, 0, 0.8),
           0 0 40px ${VARIANT_COLORS.underwater.accent}1A,
           inset 0 0 120px ${VARIANT_COLORS.underwater.primary}0D,
           inset 0 0 60px rgba(0, 0, 0, 0.5)`;
  }
  return `0 20px 60px rgba(0, 0, 0, 0.4),
           inset 0 1px 0 rgba(255, 255, 255, 0.05),
           inset 0 -1px 0 rgba(0, 0, 0, 0.2)`;
};

export const getCenterTableBackground = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `linear-gradient(145deg, ${VARIANT_COLORS.cyberpunk.background}, ${VARIANT_COLORS.cyberpunk.cardBack})`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return 'linear-gradient(145deg, #083344, #155e75)';
  }
  return 'linear-gradient(145deg, #1e293b, #0f172a)';
};

export const getCenterTableBorder = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `2px solid ${VARIANT_COLORS.cyberpunk.secondary}66`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return '2px solid rgba(34, 211, 238, 0.3)';
  }
  return '2px solid rgba(99, 102, 241, 0.3)';
};

export const getCenterTableShadow = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `0 12px 40px rgba(0, 0, 0, 0.6),
         inset 0 2px 4px ${VARIANT_COLORS.cyberpunk.secondary}1A,
         inset 0 -2px 8px rgba(0, 0, 0, 0.4),
         0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}33`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return `0 12px 40px rgba(0, 0, 0, 0.5),
           inset 0 2px 4px rgba(34, 211, 238, 0.1),
           inset 0 -2px 8px rgba(0, 0, 0, 0.3),
           0 0 25px rgba(34, 211, 238, 0.2)`;
  }
  return `0 12px 40px rgba(0, 0, 0, 0.4),
           inset 0 2px 4px rgba(255, 255, 255, 0.05),
           inset 0 -2px 8px rgba(0, 0, 0, 0.3)`;
};

export const getCenterTableGlow = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `conic-gradient(
            from 0deg,
            ${VARIANT_COLORS.cyberpunk.secondary}99 0deg,
            ${VARIANT_COLORS.cyberpunk.primary}80 60deg,
            ${VARIANT_COLORS.cyberpunk.accent}66 120deg,
            ${VARIANT_COLORS.cyberpunk.secondary}4D 180deg,
            ${VARIANT_COLORS.cyberpunk.primary}66 240deg,
            ${VARIANT_COLORS.cyberpunk.accent}80 300deg,
            ${VARIANT_COLORS.cyberpunk.secondary}99 360deg
          )`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return `conic-gradient(
              from 0deg,
              rgba(34, 211, 238, 0.6) 0deg,
              rgba(22, 78, 99, 0.5) 60deg,
              rgba(6, 182, 212, 0.4) 120deg,
              rgba(34, 211, 238, 0.3) 180deg,
              rgba(22, 78, 99, 0.4) 240deg,
              rgba(34, 211, 238, 0.5) 300deg,
              rgba(34, 211, 238, 0.6) 360deg
            )`;
  }
  return `conic-gradient(
              from 0deg,
              rgba(99, 102, 241, 0.6) 0deg,
              rgba(168, 85, 247, 0.5) 60deg,
              rgba(236, 72, 153, 0.4) 120deg,
              rgba(99, 102, 241, 0.3) 180deg,
              rgba(16, 185, 129, 0.4) 240deg,
              rgba(59, 130, 246, 0.5) 300deg,
              rgba(99, 102, 241, 0.6) 360deg
            )`;
};
