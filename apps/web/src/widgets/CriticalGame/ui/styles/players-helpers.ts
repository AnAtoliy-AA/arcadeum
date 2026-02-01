import { DefaultTheme } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';

// Helper functions for player card styling
export const getPlayerCardBackground = (
  $isCurrentTurn: boolean | undefined,
  $isCurrentUser: boolean | undefined,
  $isAlive: boolean | undefined,
  $variant: string | undefined,
  _theme: DefaultTheme,
) => {
  if (!$isAlive) {
    if ($variant === GAME_VARIANT.CYBERPUNK)
      return 'linear-gradient(145deg, #2d1f3d, #1a1025)';
    if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(8, 51, 68, 0.4)';
    return 'linear-gradient(145deg, #374151, #1f2937)';
  }
  if ($isCurrentTurn) {
    if ($variant === GAME_VARIANT.CYBERPUNK)
      return `linear-gradient(145deg, ${VARIANT_COLORS.cyberpunk.secondary}, #7c3aed)`;
    if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(22, 78, 99, 0.8)';
    return 'linear-gradient(145deg, #4f46e5, #7c3aed)';
  }
  if ($isCurrentUser) {
    if ($variant === GAME_VARIANT.CYBERPUNK)
      return 'linear-gradient(145deg, #701a75, #1a0a20)';
    if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(22, 78, 99, 0.6)';
    return 'linear-gradient(145deg, #1e40af, #1e293b)';
  }
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return 'linear-gradient(145deg, #3d1a4a, #1a0a20)';
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(22, 78, 99, 0.4)';
  return 'linear-gradient(145deg, #334155, #1e293b)';
};

export const getPlayerCardBorder = (
  $isCurrentTurn: boolean | undefined,
  $isCurrentUser: boolean | undefined,
  $variant: string | undefined,
) => {
  if ($isCurrentTurn) {
    if ($variant === GAME_VARIANT.CYBERPUNK) return 'rgba(192, 38, 211, 0.6)';
    if ($variant === GAME_VARIANT.UNDERWATER) return '#22d3ee';
    return 'rgba(255, 255, 255, 0.4)';
  }
  if ($isCurrentUser) {
    if ($variant === GAME_VARIANT.CYBERPUNK) return 'rgba(6, 182, 212, 0.5)';
    if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(34, 211, 238, 0.6)';
    return 'rgba(99, 102, 241, 0.6)';
  }
  if ($variant === GAME_VARIANT.CYBERPUNK) return 'rgba(192, 38, 211, 0.25)';
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(34, 211, 238, 0.3)';
  return 'rgba(255, 255, 255, 0.15)';
};

export const getPlayerCardShadow = (
  $isCurrentTurn: boolean | undefined,
  $isCurrentUser: boolean | undefined,
  $variant: string | undefined,
) => {
  if ($isCurrentTurn) {
    if ($variant === GAME_VARIANT.CYBERPUNK) {
      return `0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px ${VARIANT_COLORS.cyberpunk.secondary}80`;
    }
    if ($variant === GAME_VARIANT.UNDERWATER)
      return '0 0 20px rgba(34, 211, 238, 0.4)';
    return '0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.5)';
  }
  if ($isCurrentUser) {
    if ($variant === GAME_VARIANT.CYBERPUNK) {
      return `0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px ${VARIANT_COLORS.cyberpunk.primary}4D`;
    }
    return '0 6px 20px rgba(0, 0, 0, 0.35)';
  }
  if ($variant === GAME_VARIANT.CYBERPUNK) {
    return `0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px ${VARIANT_COLORS.cyberpunk.secondary}26`;
  }
  return '0 4px 16px rgba(0, 0, 0, 0.25)';
};

export const getPlayerCardGap = ($variant: string | undefined) =>
  $variant === GAME_VARIANT.CYBERPUNK ? '0.2rem' : '0.4rem';

export const getPlayerCardPadding = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) return '0.85rem 0.75rem';
  return '0.75rem 0.625rem';
};

export const getPlayerCardBorderRadius = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.UNDERWATER) return '4px';
  if ($variant === GAME_VARIANT.CYBERPUNK) return '0';
  return '14px';
};

export const getPlayerCardClipPath = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';
  return 'none';
};

export const getPlayerCardDimensions = ($variant: string | undefined) => {
  const isUnderwater = $variant === GAME_VARIANT.UNDERWATER;
  return {
    minWidth: isUnderwater ? '80px' : '95px',
    maxWidth: isUnderwater ? '100px' : '115px',
  };
};

export const getPlayerAvatarBackground = (
  $isCurrentTurn: boolean | undefined,
  theme: DefaultTheme,
) => ($isCurrentTurn ? '#fff' : theme.background.base);

export const getPlayerAvatarBorder = (
  $isCurrentTurn: boolean | undefined,
  theme: DefaultTheme,
  $variant: string | undefined,
) => {
  if ($isCurrentTurn) return '#fff';
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(34, 211, 238, 0.5)';
  return theme.surfaces.card.border;
};

export const getPlayerNameShadow = ($isCurrentTurn: boolean | undefined) =>
  $isCurrentTurn
    ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
    : 'none';
