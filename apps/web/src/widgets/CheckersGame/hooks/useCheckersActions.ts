'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import type { MoveStep } from '../types';

interface UseCheckersActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useCheckersActions(options: UseCheckersActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('checkers.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const movePiece = useCallback(
    (steps: MoveStep[]) => {
      if (!userId) return;
      onActionStart?.('move_piece');
      gameSocket.emit('checkers.session.move_piece', {
        roomId,
        userId,
        steps,
      });
    },
    [roomId, userId, onActionStart],
  );

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('checkers.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, movePiece, forfeit };
}
