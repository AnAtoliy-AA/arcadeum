import styled from 'styled-components';
import { Button } from '@/shared/ui';

import { getVariantStyles } from './variants';

// Header Components
export const GameHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.75rem;
  background: ${({ $variant, theme }) =>
    getVariantStyles($variant).header.getBackground(theme)};
  backdrop-filter: blur(16px);
  border-bottom: 1px solid
    ${({ $variant, theme }) =>
      getVariantStyles($variant).header.getBorder(theme)};
  margin: -2rem -2rem 0 -2rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 30;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ $variant }) =>
      getVariantStyles($variant).header.getLineBackground()};
    box-shadow: ${({ $variant }) =>
      getVariantStyles($variant).header.getLineShadow()};
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    margin: -1.25rem -1.25rem 0 -1.25rem;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const TimerControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
`;

export const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const GameTitle = styled.h2<{ $variant?: string }>`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: ${({ $variant }) =>
    getVariantStyles($variant).header.getTitleBackground()};
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
  position: relative;

  ${({ $variant }) => getVariantStyles($variant).header.getTitleTextStyles?.()}

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const TurnStatus = styled.div<{
  $variant?: 'yourTurn' | 'waiting' | 'completed' | 'default';
}>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'yourTurn':
        return '#10b981';
      case 'waiting':
        return '#f59e0b';
      case 'completed':
        return '#8b5cf6';
      default:
        return theme.text.secondary;
    }
  }};
`;

export const StartButton = styled(Button).attrs({
  variant: 'primary',
  size: 'md',
  pulse: true,
})``;

export const FullscreenButton = styled(Button).attrs({
  variant: 'icon',
  size: 'sm',
})``;

export const ChatToggleButton = styled(Button).attrs<{ $active?: boolean }>(
  ({ $active }) => ({
    variant: 'chip',
    size: 'sm',
    $active,
  }),
)<{ $active?: boolean }>``;
