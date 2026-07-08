'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import type { File, Rank, PieceType } from '../types';

interface UseChessActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useChessActions(options: UseChessActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('chess.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const movePiece = useCallback(
    (
      fromFile: File,
      fromRank: Rank,
      toFile: File,
      toRank: Rank,
      promotion?: PieceType,
    ) => {
      if (!userId) return;
      onActionStart?.('move');
      gameSocket.emit('chess.session.move', {
        roomId,
        userId,
        fromFile,
        fromRank,
        toFile,
        toRank,
        promotion,
      });
    },
    [roomId, userId, onActionStart],
  );

  const resign = useCallback(() => {
    if (!userId) return;
    onActionStart?.('resign');
    gameSocket.emit('chess.session.resign', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, movePiece, resign };
}
