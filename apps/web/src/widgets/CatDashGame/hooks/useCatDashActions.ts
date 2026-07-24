'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface UseCatDashActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useCatDashActions(options: UseCatDashActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(
    (startOptions?: { withBots?: boolean; botCount?: number }) => {
      if (!userId) return;
      onActionStart?.('start');
      gameSocket.emit('catDash.session.start', {
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
    onActionStart?.('rollDice');
    gameSocket.emit('catDash.session.rollDice', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const useAbility = useCallback(
    (abilityId: string) => {
      if (!userId) return;
      onActionStart?.('useAbility');
      gameSocket.emit('catDash.session.useAbility', {
        roomId,
        userId,
        abilityId,
      });
    },
    [roomId, userId, onActionStart],
  );

  const choosePath = useCallback(
    (pathIndex: number) => {
      if (!userId) return;
      onActionStart?.('choosePath');
      gameSocket.emit('catDash.session.choosePath', {
        roomId,
        userId,
        pathIndex,
      });
    },
    [roomId, userId, onActionStart],
  );

  const forfeit = useCallback(() => {
    if (!userId) return;
    onActionStart?.('forfeit');
    gameSocket.emit('catDash.session.forfeit', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  return { startSession, rollDice, useAbility, choosePath, forfeit };
}
