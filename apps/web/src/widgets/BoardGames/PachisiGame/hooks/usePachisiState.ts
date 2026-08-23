'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import { getSessionState } from '@/features/games/lib';
import type { GameSessionSummary } from '@/shared/types/games';
import type { PachisiClientState } from '../types';

interface UsePachisiStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
}

export function usePachisiState({
  roomId,
  currentUserId,
  initialSession,
}: UsePachisiStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy, setStartBusy } =
    useGameSession({
      roomId,
      enabled: true,
      initialSession,
    });

  const snapshot: PachisiClientState | null = useMemo(
    () => getSessionState<PachisiClientState>(session),
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
