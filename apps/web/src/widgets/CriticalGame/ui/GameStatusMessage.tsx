'use client';

import styled from 'styled-components';
import { Button } from '@/shared/ui';

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
          <RematchButton
            variant="primary"
            size="md"
            onClick={onRematch}
            disabled={rematchLoading}
          >
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

const RematchButton = styled(Button)`
  margin-top: 1rem;
`;
