import styled, { css } from 'styled-components';
import { InfoCard } from './table-info';
import { GAME_VARIANT } from '../../lib/constants';

// Chat Components
export const ChatCard = styled(InfoCard)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  grid-area: chat;
  overflow: hidden;
  align-self: stretch;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    height: 100%;
    min-height: 250px;
    max-height: none;
    flex-shrink: 0;
  }

  @media (max-height: 700px) {
    max-height: calc(100vh - 200px);
    gap: 0.5rem;
  }

  @media (max-height: 500px) {
    gap: 0.35rem;
  }

  /* Variant styling for nested InfoTitle */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      & > h3 {
        color: #c026d3;
        text-shadow: 0 0 5px rgba(192, 38, 211, 0.5);
        font-family: 'Courier New', monospace;
        border-bottom: 1px solid rgba(192, 38, 211, 0.3);
        &::after {
          display: none;
        }
      }
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      border: 1px solid rgba(34, 211, 238, 0.3);
      background: rgba(4, 11, 21, 0.6) !important;
      position: relative;
      padding-top: 2rem;

      & > h3 {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2rem;
        background: rgba(22, 78, 99, 0.4);
        margin: 0;
        padding: 0 1rem;
        display: flex;
        align-items: center;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #22d3ee;
        border-bottom: 1px solid rgba(34, 211, 238, 0.3);
        &::after {
          display: none;
        }
      }
    `}
`;

export const GameLog = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

export const LogEntry = styled.div<{
  $type?: string;
  $scope?: string;
  $variant?: string;
}>`
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ $type, $scope, theme }) => {
    // Private messages get a subtle teal/green tint
    if ($scope === 'private')
      return `linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(16, 185, 129, 0.1))`;
    // Player-only messages get a subtle purple/pink tint
    if ($scope === 'players')
      return `linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))`;
    if ($type === 'action') return theme.surfaces.panel.background;
    if ($type === 'system') return theme.background.base;
    return 'transparent';
  }};
  color: ${({ theme }) => theme.text.secondary};
  border-left: 3px solid
    ${({ $type, $scope }) => {
      // Private messages get teal border
      if ($scope === 'private') return '#14B8A6';
      // Player-only messages get pink/purple border
      if ($scope === 'players') return '#EC4899';
      if ($type === 'action') return '#3B82F6';
      if ($type === 'system') return '#8B5CF6';
      return 'transparent';
    }};
  padding-left: 0.75rem;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  ${({ $scope }) =>
    $scope === 'private' &&
    `
    position: relative;
    &::after {
      content: '👁️';
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      opacity: 0.6;
    }
  `}
  ${({ $scope }) =>
    $scope === 'players' &&
    `
    position: relative;
    &::after {
      content: '🔒';
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      opacity: 0.6;
    }
  `}

  ${({ $variant, $type }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      border-left-width: 2px;
      margin-bottom: 2px;

      border-left-color: ${$type === 'action'
        ? '#60a5fa'
        : $type === 'system'
          ? '#e879f9'
          : 'rgba(255, 255, 255, 0.6)'};

      background: linear-gradient(
        90deg,
        ${$type === 'action'
            ? 'rgba(59, 130, 246, 0.25)'
            : $type === 'system'
              ? 'rgba(192, 38, 211, 0.25)'
              : 'rgba(255, 255, 255, 0.1)'}
          0%,
        transparent 100%
      );

      text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
      box-shadow: ${$type === 'action'
        ? 'inset 2px 0 8px -2px rgba(59, 130, 246, 0.3)'
        : $type === 'system'
          ? 'inset 2px 0 8px -2px rgba(192, 38, 211, 0.3)'
          : 'none'};
    `}

  ${({ $variant, $type }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      font-family: 'Courier New', monospace;
      font-size: 0.85rem; /* slightly larger for readability */
      border-left-width: 3px;
      margin-bottom: 3px;
      border-radius: 4px;

      border-left-color: ${$type === 'action'
        ? '#22d3ee' /* cyan-400 */
        : $type === 'system'
          ? '#67e8f9' /* cyan-300 */
          : 'rgba(165, 243, 252, 0.5)'};

      background: linear-gradient(
        90deg,
        ${$type === 'action'
            ? 'rgba(22, 78, 99, 0.4)'
            : $type === 'system'
              ? 'rgba(8, 51, 68, 0.4)'
              : 'rgba(22, 78, 99, 0.1)'}
          0%,
        transparent 100%
      );

      box-shadow: ${$type === 'action'
        ? 'inset 2px 0 8px -2px rgba(34, 211, 238, 0.2)'
        : 'none'};
      color: #ecfeff; /* cyan-50 */
    `}
`;

export const ChatMessages = styled(GameLog)`
  flex: 1 1 0;
  display: flex;
  flex-direction: column-reverse;
  position: relative;
  min-height: 60px;
  max-height: none;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.buttons.primary.gradientStart}
    transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  /* Cyberpunk Scrollbar */
  ${({ theme }) => css`
    &::-webkit-scrollbar-thumb {
      background: ${String(theme.name) === GAME_VARIANT.CYBERPUNK
        ? '#c026d3'
        : String(theme.name) === GAME_VARIANT.UNDERWATER
          ? '#22d3ee'
          : theme.buttons.primary.gradientStart};
    }
  `}

  @media (max-width: 1024px) {
    min-height: 60px;
  }

  @media (max-width: 768px) {
    min-height: 40px;
  }

  /* Constrain on short heights */
  @media (max-height: 700px) {
    min-height: 40px;
  }

  @media (max-height: 500px) {
    min-height: 30px;
  }
`;

export const ChatCloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: ${({ theme }) => theme.text.secondary};
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
  }

  @media (max-width: 1024px) {
    display: flex;
  }

  @media (max-height: 700px) {
    display: flex;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
`;
