'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface UseTicTacToeActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useTicTacToeActions(options: UseTicTacToeActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('ticTacToe.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const placeMark = useCallback(
    (row: number, col: number) => {
      if (!userId) return;
      onActionStart?.('place_mark');
      gameSocket.emit('ticTacToe.session.place_mark', {
        roomId,
        userId,
        row,
        col,
      });
    },
    [roomId, userId, onActionStart],
  );

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('ticTacToe.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, placeMark, forfeit };
}
