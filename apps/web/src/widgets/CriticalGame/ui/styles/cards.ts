import styled from 'styled-components';
import { Button, GameVariant } from '@/shared/ui';
import { Card } from './cards-base';
import { getVariantStyles } from './variants';

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

export const ActionButtons = styled.div<{ $variant?: string }>`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  ${({ $variant }) =>
    getVariantStyles($variant).cards.getActionButtonsStyles?.()}
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
