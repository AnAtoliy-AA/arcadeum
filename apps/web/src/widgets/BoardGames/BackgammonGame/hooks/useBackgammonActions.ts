'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import type { MoveCheckerPayload } from '../types';

interface UseBackgammonActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useBackgammonActions(options: UseBackgammonActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('backgammon.session.start', {
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
    gameSocket.emit('backgammon.session.roll', {
      roomId,
      userId,
    });
  }, [roomId, userId, onActionStart]);

  const moveChecker = useCallback(
    (payload: MoveCheckerPayload) => {
      if (!userId) return;
      onActionStart?.('move');
      gameSocket.emit('backgammon.session.move', {
        roomId,
        userId,
        from: payload.from,
        to: payload.to,
      });
    },
    [roomId, userId, onActionStart],
  );

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('backgammon.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, rollDice, moveChecker, forfeit };
}
