'use client';

import { EmptyState } from './styles';

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
