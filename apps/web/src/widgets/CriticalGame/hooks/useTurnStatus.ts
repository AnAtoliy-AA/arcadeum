'use client';

import { useMemo } from 'react';
import type { CriticalPlayerState } from '../types';

interface UseTurnStatusProps {
  isGameOver: boolean;
  currentTurnPlayer: CriticalPlayerState | undefined;
  currentUserId: string;
  resolveDisplayName: (userId: string, fallback: string) => string;
  t: (key: string) => string;
}

export function useTurnStatus({
  isGameOver = false,
  currentTurnPlayer,
  currentUserId = '',
  resolveDisplayName,
  t,
}: UseTurnStatusProps) {
  const turnStatusVariant = useMemo(():
    | 'completed'
    | 'yourTurn'
    | 'waiting'
    | 'default' => {
    if (isGameOver) return 'completed';
    if (!currentTurnPlayer) return 'default';
    return currentTurnPlayer.playerId === currentUserId
      ? 'yourTurn'
      : 'waiting';
  }, [isGameOver, currentTurnPlayer, currentUserId]);

  const turnStatusText = useMemo((): string => {
    if (isGameOver) return t('games.table.status.gameCompleted');
    if (!currentTurnPlayer) return 'Game in progress';
    if (currentTurnPlayer.playerId === currentUserId) {
      return t('games.table.players.yourTurn');
    }
    return `${t('games.table.players.waitingFor')}: ${resolveDisplayName(currentTurnPlayer.playerId, 'Player')}`;
  }, [isGameOver, currentTurnPlayer, currentUserId, t, resolveDisplayName]);

  return { turnStatusVariant, turnStatusText };
}
