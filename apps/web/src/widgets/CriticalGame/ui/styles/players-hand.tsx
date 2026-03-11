import styled, { css } from 'styled-components';
import { Button, GameVariant, ButtonProps } from '@arcadeum/ui';
import { Card, ActionButton, ActionButtonProps } from './cards';

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
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const HandToggleButton = (props: ActionButtonProps) => (
  <ActionButton
    padding="$2 $4"
    fontSize="$1"
    minWidth="auto"
    width="auto"
    {...props}
  />
);

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownArrow = styled.div<{ $isOpen?: boolean; $variant?: string }>`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid white;
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};

  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      border-top-color: #06b6d4;
    `}

  ${({ $variant }) =>
    $variant === 'underwater' &&
    css`
      border-top-color: #22d3ee;
    `}
`;

interface DropdownTriggerProps extends ButtonProps {
  $variant?: string;
  $isOpen?: boolean;
}

export const DropdownTrigger = ({
  $variant,
  $isOpen,
  ...props
}: DropdownTriggerProps) => (
  <Button
    variant="chip"
    size="sm"
    minWidth={120}
    justifyContent="flex-start"
    gameVariant={$variant as unknown as GameVariant}
    fontFamily={
      $variant === 'cyberpunk' || $variant === 'underwater'
        ? 'Courier New, monospace'
        : undefined
    }
    borderRadius={$variant === 'cyberpunk' ? 4 : undefined}
    iconAfter={<DropdownArrow $isOpen={$isOpen} $variant={$variant} />}
    {...props}
  />
);

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

interface DropdownItemProps extends ButtonProps {
  $isActive?: boolean;
  $variant?: string;
}

export const DropdownItem = ({
  $isActive,
  $variant,
  ...props
}: DropdownItemProps) => (
  <Button
    variant="listItem"
    size="sm"
    isActive={$isActive}
    gameVariant={$variant as unknown as GameVariant}
    {...props}
  />
);

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
