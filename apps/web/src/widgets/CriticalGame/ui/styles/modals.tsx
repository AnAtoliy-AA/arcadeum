import styled, { css } from 'styled-components';
import React from 'react';
import { ActionButton, CardsGrid, Card } from './cards';
import { VARIANT_COLORS } from './variant-palette';

// Modal Components
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
`;

const StyledModalFrame = styled.div<{ $variant?: string }>`
  background: ${({ theme, $variant }) =>
    $variant === 'cyberpunk'
      ? VARIANT_COLORS.cyberpunk.background
      : theme.surfaces.card.background};
  border: 2px solid
    ${({ theme, $variant }) =>
      $variant === 'cyberpunk'
        ? 'rgba(192, 38, 211, 0.6)'
        : theme.surfaces.card.border};
  border-radius: ${({ $variant }) =>
    $variant === 'cyberpunk' ? '4px' : '24px'};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? '0 0 30px rgba(192, 38, 211, 0.2), inset 0 0 20px rgba(192, 38, 211, 0.1)'
      : '0 20px 60px rgba(0, 0, 0, 0.5)'};
  animation: slideUp 0.3s ease-out;

  /* Cyberpunk Tech Corners */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
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

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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
    ${({ theme, $variant }) =>
      $variant === 'cyberpunk'
        ? 'rgba(6, 182, 212, 0.3)'
        : theme.surfaces.card.border};
`;

export const ModalTitle = styled.h2<{ $variant?: string }>`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme, $variant }) =>
    $variant === 'cyberpunk'
      ? VARIANT_COLORS.cyberpunk.accent
      : theme.text.primary};

  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(232, 121, 249, 0.5);
    `}
`;

export const CloseButton = styled.button<{ $variant?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ theme, $variant }) =>
    $variant === 'cyberpunk'
      ? 'rgba(255, 255, 255, 0.1)'
      : theme.surfaces.panel.background};
  color: ${({ theme, $variant }) =>
    $variant === 'cyberpunk' ? '#fff' : theme.text.primary};
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'cyberpunk'
        ? 'rgba(239, 68, 68, 0.2)'
        : theme.buttons.primary.gradientStart};
    color: ${({ theme, $variant }) =>
      $variant === 'cyberpunk'
        ? VARIANT_COLORS.cyberpunk.danger
        : theme.buttons.primary.text};
    transform: rotate(90deg);
  }
`;

export const ModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const SectionLabel = styled.div<{ $variant?: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme, $variant }) =>
    $variant === 'cyberpunk'
      ? VARIANT_COLORS.cyberpunk.primary
      : theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;

  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
    `}
`;

export const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

export const OptionButton = styled.button<{
  $selected?: boolean;
  $variant?: string;
}>`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ $selected, $variant, theme }) => {
    if ($selected) {
      return `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`;
    }
    if ($variant === 'cyberpunk')
      return `linear-gradient(135deg, ${VARIANT_COLORS.cyberpunk.background} 0%, #1e1b4b 100%)`;
    if ($variant === 'underwater')
      return `linear-gradient(135deg, ${VARIANT_COLORS.underwater.background} 0%, #164e63 100%)`;
    if ($variant === 'crime')
      return `linear-gradient(135deg, ${VARIANT_COLORS.crime.background} 0%, #27272a 100%)`;
    if ($variant === 'horror')
      return `linear-gradient(135deg, ${VARIANT_COLORS.horror.background} 0%, #0f172a 100%)`;
    if ($variant === 'adventure')
      return `linear-gradient(135deg, ${VARIANT_COLORS.adventure.background} 0%, #78350f 100%)`;
    return theme.surfaces.panel.background;
  }};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
