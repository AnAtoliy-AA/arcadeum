'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import type { ActiveColor } from '../types';

interface UseCascadeActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useCascadeActions(options: UseCascadeActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('cascade.session.start', {
        roomId,
        userId,
        withBots: startOptions?.withBots,
        botCount: startOptions?.botCount,
      });
    },
    [roomId, userId, onActionStart],
  );

  const playCard = useCallback(
    (cardId: string, chosenColor?: ActiveColor) => {
      if (!userId) return;
      onActionStart?.('play_card');
      gameSocket.emit('cascade.session.play_card', {
        roomId,
        userId,
        cardId,
        chosenColor,
      });
    },
    [roomId, userId, onActionStart],
  );

  const draw = useCallback(() => {
    if (!userId) return;
    onActionStart?.('draw');
    gameSocket.emit('cascade.session.draw', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const nameColor = useCallback(
    (color: ActiveColor) => {
      if (!userId) return;
      onActionStart?.('name_color');
      gameSocket.emit('cascade.session.name_color', { roomId, userId, color });
    },
    [roomId, userId, onActionStart],
  );

  const callCascade = useCallback(() => {
    if (!userId) return;
    onActionStart?.('call_cascade');
    gameSocket.emit('cascade.session.call_cascade', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('cascade.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, playCard, draw, nameColor, callCascade, forfeit };
}
