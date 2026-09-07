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
    (startOptions?: {
      withBots?: boolean;
      botCount?: number;
      botDifficulty?: string;
    }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('chess.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
        botDifficulty: startOptions?.botDifficulty,
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

  const offerDraw = useCallback(() => {
    if (!userId) return;
    onActionStart?.('draw_offer');
    gameSocket.emit('chess.session.draw_offer', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const acceptDraw = useCallback(() => {
    if (!userId) return;
    onActionStart?.('draw_accept');
    gameSocket.emit('chess.session.draw_accept', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const offerTakeback = useCallback(() => {
    if (!userId) return;
    onActionStart?.('takeback_offer');
    gameSocket.emit('chess.session.takeback_offer', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const acceptTakeback = useCallback(() => {
    if (!userId) return;
    onActionStart?.('takeback_accept');
    gameSocket.emit('chess.session.takeback_accept', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const declineTakeback = useCallback(() => {
    if (!userId) return;
    onActionStart?.('takeback_decline');
    gameSocket.emit('chess.session.takeback_decline', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return {
    startSession,
    movePiece,
    resign,
    offerDraw,
    acceptDraw,
    offerTakeback,
    acceptTakeback,
    declineTakeback,
  };
}
