'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface UsePachisiActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function usePachisiActions(options: UsePachisiActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('pachisi.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const rollDice = useCallback(() => {
    if (!userId) return;
    onActionStart?.('roll');
    gameSocket.emit('pachisi.session.roll', {
      roomId,
      userId,
    });
  }, [roomId, userId, onActionStart]);

  const moveToken = useCallback(
    (tokenId: number) => {
      if (!userId) return;
      onActionStart?.('move');
      gameSocket.emit('pachisi.session.move', {
        roomId,
        userId,
        tokenId,
      });
    },
    [roomId, userId, onActionStart],
  );

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('pachisi.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, rollDice, moveToken, forfeit };
}
