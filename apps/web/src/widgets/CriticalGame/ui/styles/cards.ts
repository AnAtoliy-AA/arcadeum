import styled, { css } from 'styled-components';
import { Button, GameVariant } from '@/shared/ui';
import { Card } from './cards-base';
import { SPRITE_GRID_SIZE } from './card-sprites';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';
const getDeckCardHoverBorder = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.UNDERWATER) return '#67e8f9';
  if ($variant) return 'white';
  return 'rgba(99, 102, 241, 0.8)';
};

export * from './cards-base';

export const LastPlayedCard = styled(Card)<{ $isAnimating?: boolean }>`
  position: absolute;
  width: 75px;
  max-width: 75px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%)
    ${({ $isAnimating }) =>
      $isAnimating ? 'rotateY(180deg) scale(1.1)' : 'rotateY(0deg)'};
  z-index: 10;
  animation: ${({ $isAnimating }) =>
    $isAnimating
      ? 'cardFlip 0.6s ease-out'
      : 'cardFloat 3s ease-in-out infinite'};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  cursor: default;

  @keyframes cardFlip {
    0% {
      transform: translate(-50%, -50%) rotateY(0deg) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) rotateY(90deg) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) rotateY(180deg) scale(1);
    }
  }

  @keyframes cardFloat {
    0%,
    100% {
      transform: translate(-50%, -50%) translateY(0px);
    }
    50% {
      transform: translate(-50%, -50%) translateY(-8px);
    }
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }

  /* Media query removed to keep consistent size */
`;

export const DeckCard = styled.div<{ $variant?: string }>`
  width: 75px;
  height: 112px; // aspect ratio 2/3 roughly
  border-radius: 12px;
  background: ${({ $variant }) => {
    if ($variant === GAME_VARIANT.CYBERPUNK) {
      const x = (0 % SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      const y =
        Math.floor(0 / SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      return `url('/images/cards/cyberpunk_sprites.png') ${x}% ${y}% / ${SPRITE_GRID_SIZE * 100}% ${SPRITE_GRID_SIZE * 100}%`;
    }
    if ($variant === GAME_VARIANT.UNDERWATER) {
      const x = (0 % SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      const y =
        Math.floor(0 / SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      return `url('/images/cards/underwater_sprites.png') ${x}% ${y}% / ${SPRITE_GRID_SIZE * 100}% ${SPRITE_GRID_SIZE * 100}%`;
    }
    if ($variant === GAME_VARIANT.CRIME)
      return `linear-gradient(135deg, ${VARIANT_COLORS.crime.background} 0%, #27272a 100%)`;
    if ($variant === GAME_VARIANT.HORROR)
      return `linear-gradient(135deg, ${VARIANT_COLORS.horror.background} 0%, #0f172a 100%)`;
    if ($variant === GAME_VARIANT.ADVENTURE)
      return `linear-gradient(135deg, ${VARIANT_COLORS.adventure.background} 0%, #78350f 100%)`;
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }};
  border: 2px solid
    ${({ $variant }) => {
      if ($variant === GAME_VARIANT.CYBERPUNK)
        return VARIANT_COLORS.cyberpunk.secondary;
      if ($variant === GAME_VARIANT.UNDERWATER)
        return VARIANT_COLORS.underwater.primary;
      if ($variant === GAME_VARIANT.CRIME) return VARIANT_COLORS.crime.primary;
      if ($variant === GAME_VARIANT.HORROR)
        return VARIANT_COLORS.horror.primary;
      if ($variant === GAME_VARIANT.ADVENTURE)
        return VARIANT_COLORS.adventure.primary;
      return 'rgba(99, 102, 241, 0.5)';
    }};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK ||
      $variant === GAME_VARIANT.UNDERWATER
        ? 'none'
        : 'block'};
  }

  &::after {
    content: '🎴';
    font-size: 2rem;
    opacity: 0.5;
    display: ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK ||
      $variant === GAME_VARIANT.UNDERWATER
        ? 'none'
        : 'block'};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: ${({ $variant }) => getDeckCardHoverBorder($variant)};
    box-shadow: ${({ $variant }) =>
      $variant === GAME_VARIANT.UNDERWATER
        ? '0 0 15px rgba(34, 211, 238, 0.5)'
        : 'none'};
  }

  /* Media query removed to keep consistent size */
`;
export const ActionButtons = styled.div<{ $variant?: string }>`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      gap: 0.6rem;
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      gap: 0.75rem;
      padding: 0.25rem 1rem 1rem 1rem;
    `}
`;

export const ActionButton = styled(Button).attrs<{
  variant?: string;
  $variant?: string;
}>(({ variant, $variant }) => ({
  variant:
    (variant as 'primary' | 'secondary' | 'danger' | undefined) || 'primary',
  size: 'md',
  uppercase: true,
  gameVariant: $variant as GameVariant | undefined,
}))<{
  variant?: 'primary' | 'secondary' | 'danger';
  $variant?: string;
}>``;
