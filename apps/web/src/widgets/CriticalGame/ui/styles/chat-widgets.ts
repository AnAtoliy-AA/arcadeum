import styled, { css } from 'styled-components';
import { Button, GameVariant } from '@/shared/ui';
import { ActionButton } from './cards';
import { GAME_VARIANT } from '../../lib/constants';

export const ScopeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ScopeOption = styled(Button).attrs<{
  $active?: boolean;
  $variant?: string;
}>(({ $active, $variant }) => ({
  variant: 'chip',
  size: 'sm',
  active: $active,
  gameVariant: $variant as GameVariant,
}))<{
  $active?: boolean;
  $variant?: string;
}>`
  flex: 1;
  min-width: 120px;

  @media (max-height: 500px) {
    padding: 0.25rem 0.5rem;
    min-width: 80px;
    font-size: 0.65rem;
  }
`;

export const ChatInput = styled.textarea<{ $variant?: string }>`
  width: 100%;
  min-height: 90px;
  border-radius: 12px;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === GAME_VARIANT.CYBERPUNK
        ? 'rgba(192, 38, 211, 0.4)'
        : theme.surfaces.card.border};
  background: ${({ $variant, theme }) =>
    $variant === GAME_VARIANT.CYBERPUNK ? '#1a0a20' : theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  padding: 0.75rem;
  font-size: 0.875rem;
  resize: none;
  flex-shrink: 0;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ $variant, theme }) =>
      $variant === GAME_VARIANT.CYBERPUNK
        ? '#c026d3'
        : theme.buttons.primary.gradientStart};
    box-shadow: ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK
        ? '0 0 12px rgba(192, 38, 211, 0.4)'
        : '0 0 0 3px rgba(59, 130, 246, 0.2)'};
  }

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      font-family: 'Courier New', monospace;
      border-radius: 4px;
      padding: 0.5rem;
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      font-family: 'Courier New', monospace;
      border-radius: 8px;
      background: rgba(8, 51, 68, 0.8);
      border: 1px solid rgba(22, 78, 99, 0.8);
      color: #a5f3fc;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

      &:focus {
        border-color: #22d3ee;
        box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
        background: rgba(8, 51, 68, 0.95);
      }
    `}

  @media (max-height: 700px) {
    min-height: 60px;
    padding: 0.5rem;
  }

  @media (max-height: 500px) {
    min-height: 40px;
    padding: 0.4rem;
    font-size: 0.8rem;
  }
`;

export const ChatControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

export const ChatHint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  opacity: 0.85;
`;

export const ChatTurnStatus = styled.div<{ $variant?: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  padding: 0.5rem 0.75rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.surfaces.panel.background},
    ${({ theme }) => theme.background.base}
  );
  border-radius: 8px;
  border-left: 3px solid #8b5cf6;
  margin-bottom: 0.25rem;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-left: 3px solid #06b6d4;
      font-family: 'Courier New', monospace;
      color: #06b6d4;
      text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
      border-radius: 2px;
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      background: linear-gradient(
        90deg,
        rgba(8, 51, 68, 0.9),
        rgba(22, 78, 99, 0.6)
      );
      border: 1px solid rgba(34, 211, 238, 0.3);
      border-left: 3px solid #22d3ee; /* cyan-400 */
      font-family: 'Courier New', monospace;
      color: #a5f3fc; /* cyan-200 */
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    `}
`;

export const ChatSendButton = styled(ActionButton)`
  padding: 0.65rem 1.25rem;
  font-size: 0.75rem;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
  text-align: center;
`;

export const ChatBubbleContainer = styled.div<{
  $visible: boolean;
  $position?: 'top' | 'bottom' | 'left' | 'right';
}>`
  position: absolute;
  /* Default to top behavior if undefined */
  ${({ $position }) => {
    switch ($position) {
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 12px;
        `;
      case 'left':
        return `
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          margin-right: 12px;
        `;
      case 'right':
        return `
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          margin-left: 12px;
        `;
      case 'top':
      default:
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 12px;
        `;
    }
  }}

  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 180px;
  width: max-content;

  /* Line clamping */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-box-orient: vertical;
  overflow: hidden;
  z-index: 100;
  pointer-events: auto; /* Enable pointer events for hover */
  pointer-events: auto; /* Enable pointer events for hover */
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  cursor: help;

  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    max-width 0.3s ease;

  &:hover {
    -webkit-line-clamp: unset;
    max-width: 280px;
    z-index: 110;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  /* Transform animations based on position */
  transform: ${({ $visible, $position }) => {
    switch ($position) {
      case 'bottom':
        return $visible
          ? 'translateX(-50%) scale(1) translateY(0)'
          : 'translateX(-50%) scale(0.9) translateY(-10px)';
      case 'left':
        return $visible
          ? 'translateY(-50%) scale(1) translateX(0)'
          : 'translateY(-50%) scale(0.9) translateX(10px)';
      case 'right':
        return $visible
          ? 'translateY(-50%) scale(1) translateX(0)'
          : 'translateY(-50%) scale(0.9) translateX(-10px)';
      case 'top':
      default:
        return $visible
          ? 'translateX(-50%) scale(1) translateY(0)'
          : 'translateX(-50%) scale(0.9) translateY(10px)';
    }
  }};

  /* Arrow styles */
  &::after,
  &::before {
    content: '';
    position: absolute;
    border-style: solid;
  }

  /* Inner arrow (background color) */
  &::after {
    ${({ $position, theme }) => {
      switch ($position) {
        case 'bottom':
          return `
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 0 6px 6px 6px;
            border-color: transparent transparent ${theme.background.base} transparent;
          `;
        case 'left':
          return `
            top: 50%;
            right: -6px;
            transform: translateY(-50%);
            border-width: 6px 0 6px 6px;
            border-color: transparent transparent transparent ${theme.background.base};
            `;
        case 'right':
          return `
            top: 50%;
            left: -6px;
            transform: translateY(-50%);
            border-width: 6px 6px 6px 0;
            border-color: transparent ${theme.background.base} transparent transparent;
          `;
        case 'top':
        default:
          return `
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px 6px 0 6px;
            border-color: ${theme.background.base} transparent transparent transparent;
          `;
      }
    }}
  }

  /* Outer arrow (border color) */
  &::before {
    z-index: -1;
    ${({ $position, theme }) => {
      switch ($position) {
        case 'bottom':
          return `
            top: -7px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 0 7px 7px 7px;
            border-color: transparent transparent ${theme.surfaces.card.border} transparent;
          `;
        case 'left':
          return `
            top: 50%;
            right: -7px;
            transform: translateY(-50%);
            border-width: 7px 0 7px 7px;
            border-color: transparent transparent transparent ${theme.surfaces.card.border};
          `;
        case 'right':
          return `
            top: 50%;
            left: -7px;
            transform: translateY(-50%);
            border-width: 7px 7px 7px 0;
            border-color: transparent ${theme.surfaces.card.border} transparent transparent;
          `;
        case 'top':
        default:
          return `
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 7px 7px 0 7px;
            border-color: ${theme.surfaces.card.border} transparent transparent transparent;
          `;
      }
    }}
  }
`;
