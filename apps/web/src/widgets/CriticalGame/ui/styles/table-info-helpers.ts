import { DefaultTheme } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';

export const getStatValueColor = (
  $isWarning: boolean | undefined,
  $variant: string | undefined,
) => {
  if ($isWarning) {
    if ($variant === GAME_VARIANT.UNDERWATER) return '#f43f5e';
    return '#DC2626';
  }
  if ($variant === GAME_VARIANT.UNDERWATER) return '#22d3ee';
  if ($variant === GAME_VARIANT.CYBERPUNK) return '#06b6d4';
  return 'inherit';
};

export const getInfoCardBackground = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) {
    return 'linear-gradient(135deg, rgba(20, 10, 35, 0.95), rgba(45, 10, 60, 0.9))';
  }
  if ($variant === GAME_VARIANT.UNDERWATER) {
    return 'linear-gradient(135deg, rgba(8, 51, 68, 0.9), rgba(22, 78, 99, 0.85))';
  }
  return `linear-gradient(135deg, ${theme.surfaces.panel.background}ee, ${theme.surfaces.card.background}dd)`;
};

export const getInfoCardBorder = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return `${VARIANT_COLORS.cyberpunk.secondary}4D`;
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(34, 211, 238, 0.3)';
  return theme.surfaces.panel.border;
};

export const getInfoCardShadow = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) {
    return `0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 0 1px ${VARIANT_COLORS.cyberpunk.secondary}4D`;
  }
  if ($variant === GAME_VARIANT.UNDERWATER) {
    return '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(34, 211, 238, 0.2)';
  }
  return '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
};

export const getInfoCardPattern = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) {
    return `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      ${VARIANT_COLORS.cyberpunk.secondary}08 10px,
      ${VARIANT_COLORS.cyberpunk.secondary}08 20px
    )`;
  }
  if ($variant === GAME_VARIANT.UNDERWATER) {
    return `radial-gradient(
      circle at 50% 50%,
      rgba(34, 211, 238, 0.05) 0%,
      transparent 60%
    )`;
  }
  return `repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.02) 10px,
    rgba(255, 255, 255, 0.02) 20px
  )`;
};
