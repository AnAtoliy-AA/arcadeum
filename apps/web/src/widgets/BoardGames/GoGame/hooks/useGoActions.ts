'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface UseGoActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useGoActions({ roomId, userId, onActionStart }: UseGoActionsOptions) {
  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('go.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const placeStone = useCallback(
    (row: number, col: number) => {
      if (!userId) return;
      onActionStart?.('place_stone');
      gameSocket.emit('go.session.place_stone', { roomId, userId, row, col });
    },
    [roomId, userId, onActionStart],
  );

  const passTurn = useCallback(() => {
    if (!userId) return;
    onActionStart?.('pass');
    gameSocket.emit('go.session.pass', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('go.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, placeStone, passTurn, forfeit };
}
