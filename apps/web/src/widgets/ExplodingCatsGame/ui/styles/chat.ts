import styled from 'styled-components';
import { InfoCard } from './table';
import { ActionButton } from './cards';

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
    height: 400px;
    max-height: 400px;
    flex-shrink: 0;
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

export const LogEntry = styled.div<{ $type?: string; $scope?: string }>`
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ $type, $scope, theme }) => {
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
      // Player-only messages get pink/purple border
      if ($scope === 'players') return '#EC4899';
      if ($type === 'action') return '#3B82F6';
      if ($type === 'system') return '#8B5CF6';
      return 'transparent';
    }};
  padding-left: 0.75rem;
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
`;

export const ChatMessages = styled(GameLog)`
  flex: 1 1 0;
  display: flex;
  flex-direction: column-reverse;
  min-height: 0;
  max-height: 100%;
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
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    border-radius: 999px;
  }
`;

export const ScopeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ScopeOption = styled.button<{ $active?: boolean }>`
  flex: 1;
  min-width: 120px;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`
      : theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;

export const ChatInput = styled.textarea`
  width: 100%;
  min-height: 90px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  padding: 0.75rem;
  font-size: 0.875rem;
  resize: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

export const ChatControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const ChatHint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  opacity: 0.85;
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
