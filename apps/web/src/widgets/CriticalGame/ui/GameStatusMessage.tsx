'use client';

import styled from 'styled-components';

interface GameStatusMessageProps {
  currentPlayerAlive: boolean;
  isGameOver: boolean;
  isHost: boolean;
  rematchLoading?: boolean;
  onRematch?: () => void;
  t: (key: string) => string;
}

export function GameStatusMessage({
  currentPlayerAlive,
  isGameOver,
  isHost,
  rematchLoading,
  onRematch,
  t,
}: GameStatusMessageProps) {
  // Game over state - show victory or defeat
  if (isGameOver) {
    return (
      <EmptyState>
        <div style={{ fontSize: '4rem' }}>
          {currentPlayerAlive ? '🏆' : '💀'}
        </div>
        <div>
          <strong style={{ fontSize: '1.25rem' }}>
            {currentPlayerAlive
              ? t('games.table.victory.title')
              : t('games.table.defeat.title')}
          </strong>
        </div>
        <div style={{ fontSize: '1rem' }}>
          {currentPlayerAlive
            ? t('games.table.victory.message')
            : t('games.table.defeat.message')}
        </div>
        {isHost && onRematch && (
          <RematchButton onClick={onRematch} disabled={rematchLoading}>
            {rematchLoading
              ? t('games.table.rematch.loading')
              : t('games.table.rematch.button')}
          </RematchButton>
        )}
      </EmptyState>
    );
  }

  // Player eliminated but game continues
  if (!currentPlayerAlive) {
    return (
      <EmptyState>
        <div style={{ fontSize: '4rem' }}>💀</div>
        <div>
          <strong style={{ fontSize: '1.25rem' }}>
            {t('games.table.eliminated.title')}
          </strong>
        </div>
        <div style={{ fontSize: '1rem' }}>
          {t('games.table.eliminated.message')}
        </div>
      </EmptyState>
    );
  }

  return null;
}

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  margin-top: 1rem;
`;

const RematchButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
