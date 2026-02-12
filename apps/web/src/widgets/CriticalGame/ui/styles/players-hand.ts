import styled, { css } from 'styled-components';
import { Button, GameVariant } from '@/shared/ui';
import { Card, ActionButton } from './cards';

// Hand Components
export const HandHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const HandTitle = styled.h3`
  margin: 0;
  margin-right: auto;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;

  /* Media query removed to keep consistent size */
`;

export const HandControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const HandToggleButton = styled(ActionButton)`
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  min-width: auto;
  width: auto;
`;

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownTrigger = styled(Button).attrs({
  variant: 'chip',
  size: 'sm',
})<{
  $variant?: string;
  $isOpen?: boolean;
}>`
  min-width: 120px;
  justify-content: flex-start;

  /* Custom arrow */
  &::after {
    content: '';
    position: absolute;
    right: 0.8rem;
    top: 50%;
    transform: translateY(-50%)
      ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid white;
    transition: transform 0.2s ease;
  }

  /* Cyberpunk Variant */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      &::after {
        border-top-color: #06b6d4;
      }
    `}

  /* Underwater Variant */
  ${({ $variant }) =>
    $variant === 'underwater' &&
    css`
      font-family: 'Courier New', monospace;
      &::after {
        border-top-color: #22d3ee;
      }
    `}
`;

export const DropdownList = styled.div<{ $variant?: string }>`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 100;
  min-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  /* Default Styles */
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);

  /* Cyberpunk Variant */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      border-radius: 4px;
      background-color: #0f172a;
      border: 1px solid #06b6d4;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
    `}

  /* Underwater Variant */
  ${({ $variant }) =>
    $variant === 'underwater' &&
    css`
      border-radius: 12px;
      background-color: #040b15;
      border: 1px solid rgba(34, 211, 238, 0.4);
      box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
    `}
`;

export const DropdownItem = styled(Button).attrs<{
  $isActive?: boolean;
  $variant?: string;
}>(({ $isActive, $variant }) => ({
  variant: 'listItem',
  size: 'sm',
  $active: $isActive,
  gameVariant: $variant as GameVariant,
}))<{
  $variant?: string;
  $isActive?: boolean;
}>``;

export const HandCard = styled(Card)<{
  $clickable?: boolean;
  $dimmed?: boolean;
}>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  opacity: ${({ $clickable, $dimmed }) => ($clickable ? 1 : $dimmed ? 0.7 : 1)};
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    opacity 0.2s;
`;
