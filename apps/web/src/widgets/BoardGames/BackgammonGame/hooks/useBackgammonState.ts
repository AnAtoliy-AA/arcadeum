'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import { getSessionState } from '@/features/games/lib';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import type { BackgammonClientState } from '../types';

interface UseBackgammonStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useBackgammonState({
  roomId,
  currentUserId,
  initialSession,
}: UseBackgammonStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy, setStartBusy } =
    useGameSession({
      roomId,
      enabled: true,
      initialSession,
    });

  const snapshot: BackgammonClientState | null = useMemo(
    () => getSessionState<BackgammonClientState>(session),
    [session],
  );

  const currentTurnUserId = snapshot
    ? snapshot.playerOrder[snapshot.currentTurnIndex]
    : null;

  const myTurn = !!(
    currentTurnUserId &&
    currentUserId &&
    currentTurnUserId === currentUserId
  );

  const isGameOver = snapshot?.phase === 'game_over';

  return {
    session,
    snapshot,
    currentTurnUserId,
    myTurn,
    isGameOver,
    actionBusy,
    setActionBusy,
    startBusy,
    setStartBusy,
  };
}
