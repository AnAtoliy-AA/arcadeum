import styled, { css } from 'styled-components';
import { InfoCard } from './table-widgets';

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
    height: auto;
    min-height: 250px;
    max-height: 400px;
    flex-shrink: 0;
  }

  @media (max-height: 700px) {
    max-height: calc(100vh - 200px);
    gap: 0.5rem;
  }

  @media (max-height: 500px) {
    gap: 0.35rem;
  }
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
    $variant === 'cyberpunk' &&
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
      background: ${String(theme.name) === 'cyberpunk'
        ? '#c026d3'
        : theme.buttons.primary.gradientStart};
    }
  `}

  @media (max-width: 1024px) {
    max-height: 15vh;
    min-height: 60px;
  }

  @media (max-width: 768px) {
    max-height: 12vh;
    min-height: 40px;
  }

  /* Constrain on short heights */
  @media (max-height: 700px) {
    max-height: 120px;
    min-height: 40px;
  }

  @media (max-height: 500px) {
    max-height: 60px;
    min-height: 30px;
  }
`;
