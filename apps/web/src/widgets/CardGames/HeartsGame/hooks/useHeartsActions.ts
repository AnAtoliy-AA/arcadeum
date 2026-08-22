'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface UseHeartsActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useHeartsActions(options: UseHeartsActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('hearts.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const passCards = useCallback(
    (cards: string[]) => {
      if (!userId) return;
      onActionStart?.('pass_cards');
      gameSocket.emit('hearts.session.pass_cards', {
        roomId,
        userId,
        cards,
      });
    },
    [roomId, userId, onActionStart],
  );

  const playCard = useCallback(
    (card: string) => {
      if (!userId) return;
      onActionStart?.('play_card');
      gameSocket.emit('hearts.session.play_card', {
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
    gameSocket.emit('hearts.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, passCards, playCard, forfeit };
}
