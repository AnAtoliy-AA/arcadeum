import styled, { css, DefaultTheme } from 'styled-components';
import React from 'react';
import { Button, GameVariant } from '@/shared/ui';
import { ActionButton, CardsGrid, Card } from './cards';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';

const getModalFrameBackground = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return VARIANT_COLORS.cyberpunk.background;
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(8, 51, 68, 0.85)';
  return theme.surfaces.card.background;
};

const getModalFrameBorder = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) return 'rgba(192, 38, 211, 0.6)';
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(34, 211, 238, 0.5)';
  return theme.surfaces.card.border;
};

const getModalFrameShadow = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) {
    return '0 0 30px rgba(192, 38, 211, 0.2), inset 0 0 20px rgba(192, 38, 211, 0.1)';
  }
  if ($variant === GAME_VARIANT.UNDERWATER) {
    return '0 0 30px rgba(34, 211, 238, 0.2), inset 0 0 20px rgba(34, 211, 238, 0.1)';
  }
  return '0 20px 60px rgba(0, 0, 0, 0.5)';
};

const getModalHeaderBorder = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) return 'rgba(6, 182, 212, 0.3)';
  return theme.surfaces.card.border;
};

const getModalTitleColor = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return VARIANT_COLORS.cyberpunk.accent;
  return theme.text.primary;
};

// unused variables removed

const getSectionLabelColor = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return VARIANT_COLORS.cyberpunk.primary;
  return theme.text.secondary;
};

// Modal Components
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column; /* Ensure column layout for safe centering */
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;

  /* Safe handling for small screens/overflow */
  overflow-y: auto;
`;

const StyledModalFrame = styled.div<{ $variant?: string }>`
  background: ${({ theme, $variant }) =>
    getModalFrameBackground($variant, theme)};
  border: 2px solid
    ${({ theme, $variant }) => getModalFrameBorder($variant, theme)};
  border-radius: ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK ? '4px' : '24px'};
  max-width: 600px;
  width: 100%;
  max-height: calc(100vh - 40px); /* 20px padding top/bottom effectively */
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: ${({ $variant }) => getModalFrameShadow($variant)};
  animation: slideUp 0.3s ease-out;
  margin: auto; /* Uses flexbox safe centering behavior if overflow */

  /* Cyberpunk Tech Corners */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        width: 20px;
        height: 20px;
        border-top: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        border-left: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        pointer-events: none;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
        border-bottom: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        border-right: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        pointer-events: none;
      }
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      /* Underwater specific Modal Content adds */
      &::before {
        content: '';
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(34, 211, 238, 0.2);
        border-radius: 20px;
        pointer-events: none;
      }
    `}
`;

const StyledScrollArea = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
  width: 100%;
  height: 100%;
  border-radius: inherit; /* Matches parent radius */
`;

export const ModalContent = ({
  children,
  $variant,
  onClick,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { $variant?: string }) => {
  return (
    <StyledModalFrame
      $variant={$variant}
      onClick={onClick}
      style={style}
      className={className}
      {...props}
    >
      <StyledScrollArea>{children}</StyledScrollArea>
    </StyledModalFrame>
  );
};

export const ModalHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid
    ${({ theme, $variant }) => getModalHeaderBorder($variant, theme)};
`;

export const ModalTitle = styled.h2<{ $variant?: string }>`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme, $variant }) => getModalTitleColor($variant, theme)};

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(232, 121, 249, 0.5);
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      color: #22d3ee;
      text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
    `}
`;

export const CloseButton = styled(Button).attrs({
  variant: 'icon',
  size: 'sm',
})<{ $variant?: string }>`
  &:hover:not(:disabled) {
    transform: rotate(90deg);
  }
`;

export const ModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const SectionLabel = styled.div<{ $variant?: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme, $variant }) => getSectionLabelColor($variant, theme)};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 5px rgba(34, 211, 238, 0.5);
      color: #22d3ee;
    `}
`;

export const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

export const OptionButton = styled(Button).attrs<{
  $selected?: boolean;
  $variant?: string;
}>(({ $selected, $variant }) => ({
  variant: 'chip',
  size: 'md',
  active: $selected,
  gameVariant: $variant as GameVariant,
}))<{
  $selected?: boolean;
  $variant?: string;
}>`
  padding: 1rem;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
`;

export const ModalButton = styled(ActionButton)`
  flex: 1;
`;

export const ScrollableCardsGrid = styled(CardsGrid)`
  max-height: 55vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
  margin: -0.5rem;
  width: calc(100% + 1rem); /* Compensate for negative margin */

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(192, 38, 211, 0.3);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(192, 38, 211, 0.5);
  }
`;

export const SelectableCard = styled(Card)<{ $selected?: boolean }>`
  cursor: pointer;
  transform: ${({ $selected }) => ($selected ? 'scale(1.05)' : 'scale(1)')};
  box-shadow: ${({ $selected }) =>
    $selected ? '0 0 15px rgba(255, 255, 255, 0.5)' : 'none'};
  border: ${({ $selected }) =>
    $selected ? '2px solid white' : '2px solid transparent'};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const RulesText = styled.p`
  line-height: 1.5;
  opacity: 0.9;
  margin: 0;
`;

export const RulesTextPre = styled(RulesText)`
  white-space: pre-line;
`;
