'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface UseSpadesActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useSpadesActions(options: UseSpadesActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('spades.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const bid = useCallback(
    (amount: number) => {
      if (!userId) return;
      onActionStart?.('bid');
      gameSocket.emit('spades.session.bid', {
        roomId,
        userId,
        amount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const playCard = useCallback(
    (card: string) => {
      if (!userId) return;
      onActionStart?.('play_card');
      gameSocket.emit('spades.session.play_card', {
        roomId,
        userId,
        card,
      });
    },
    [roomId, userId, onActionStart],
  );

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('spades.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, bid, playCard, forfeit };
}
