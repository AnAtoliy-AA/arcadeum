'use client';

import styled from 'styled-components';

interface GameStatusMessageProps {
  currentPlayerAlive: boolean;
  isGameOver: boolean;
  t: (key: string) => string;
}

export function GameStatusMessage({
  currentPlayerAlive,
  isGameOver,
  t,
}: GameStatusMessageProps) {
  // Game over state is now handled by GameResultModal
  if (isGameOver) {
    return null;
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
