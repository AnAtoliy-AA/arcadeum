'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import type { ChatScope } from '@/shared/types/games';
import type { ShipCell } from '../types';

interface UseSeaBattleActionsOptions {
  roomId: string;
  userId: string | null;
  onActionStart?: (action: string) => void;
}

export function useSeaBattleActions(options: UseSeaBattleActionsOptions) {
  const { roomId, userId, onActionStart } = options;

  const startSession = useCallback(() => {
    if (!userId) return;
    onActionStart?.('start');
    gameSocket.emit('seaBattle.session.start', { roomId, userId });
  }, [roomId, userId, onActionStart]);

  const placeShip = useCallback(
    (shipId: string, cells: ShipCell[]) => {
      if (!userId) return;
      onActionStart?.('placeShip');
      gameSocket.emit('seaBattle.session.place_ship', {
        roomId,
        userId,
        shipId,
        cells,
      });
    },
    [roomId, userId, onActionStart],
  );

  const confirmPlacement = useCallback(() => {
    if (!userId) return;
    onActionStart?.('confirmPlacement');
    gameSocket.emit('seaBattle.session.confirm_placement', {
      roomId,
      userId,
    });
  }, [roomId, userId, onActionStart]);

  const resetPlacement = useCallback(() => {
    if (!userId) return;
    onActionStart?.('resetPlacement');
    gameSocket.emit('seaBattle.session.reset_placement', {
      roomId,
      userId,
    });
  }, [roomId, userId, onActionStart]);

  const autoPlace = useCallback(() => {
    if (!userId) return;
    onActionStart?.('autoPlace');
    gameSocket.emit('seaBattle.session.auto_place', {
      roomId,
      userId,
    });
  }, [roomId, userId, onActionStart]);

  const attack = useCallback(
    (targetPlayerId: string, row: number, col: number) => {
      if (!userId) return;
      onActionStart?.('attack');
      gameSocket.emit('seaBattle.session.attack', {
        roomId,
        userId,
        targetPlayerId,
        row,
        col,
      });
    },
    [roomId, userId, onActionStart],
  );

  const postHistoryNote = useCallback(
    (message: string, scope: ChatScope) => {
      if (!userId) return;
      gameSocket.emit('seaBattle.session.history_note', {
        roomId,
        userId,
        message,
        scope,
      });
    },
    [roomId, userId],
  );

  return {
    startSession,
    placeShip,
    confirmPlacement,
    attack,
    postHistoryNote,
    resetPlacement,
    autoPlace,
  };
}
