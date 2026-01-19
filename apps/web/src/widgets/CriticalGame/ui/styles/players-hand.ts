import styled, { css } from 'styled-components';
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

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
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

export const DropdownTrigger = styled.button<{
  $variant?: string;
  $isOpen?: boolean;
}>`
  appearance: none;
  border-radius: 8px;
  padding: 0.4rem 2rem 0.4rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  outline: none;
  min-width: 120px;
  text-align: left;
  position: relative;

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

  /* Default / Basic style */
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;

  /* Cyberpunk Variant */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      background-color: rgba(6, 182, 212, 0.1);
      border: 1px solid #06b6d4; /* Cyan */
      color: #06b6d4;
      text-transform: uppercase;

      &::after {
        border-top-color: #06b6d4;
      }

      &:hover {
        background-color: rgba(6, 182, 212, 0.2);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
      }
    `}

  /* Underwater Variant */
  ${({ $variant }) =>
    $variant === 'underwater' &&
    css`
      border-radius: 999px;
      font-family: 'Courier New', monospace;
      background-color: rgba(4, 11, 21, 0.6);
      border: 1px solid rgba(34, 211, 238, 0.4);
      color: #22d3ee; /* Cyan-400 */

      &::after {
        border-top-color: #22d3ee;
      }

      &:hover {
        border-color: #22d3ee;
        box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
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

export const DropdownItem = styled.button<{
  $variant?: string;
  $isActive?: boolean;
}>`
  appearance: none;
  background: transparent;
  border: none;
  text-align: left;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: white;
  width: 100%;
  white-space: nowrap;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: rgba(255, 255, 255, 0.15);
      font-weight: bold;
    `}

  /* Cyberpunk Variant */
  ${({ $variant, $isActive }) =>
    $variant === 'cyberpunk' &&
    css`
      font-family: 'Courier New', monospace;
      color: #06b6d4;
      text-transform: uppercase;
      letter-spacing: 1px;

      &:hover {
        background-color: rgba(6, 182, 212, 0.2);
        color: #fff;
      }

      ${$isActive &&
      css`
        background-color: rgba(6, 182, 212, 0.3);
        color: #fff;
      `}
    `}

  /* Underwater Variant */
  ${({ $variant, $isActive }) =>
    $variant === 'underwater' &&
    css`
      font-family: 'Courier New', monospace;
      color: #22d3ee;

      &:hover {
        background-color: rgba(34, 211, 238, 0.2);
      }

      ${$isActive &&
      css`
        background-color: rgba(34, 211, 238, 0.3);
      `}
    `}
`;

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
