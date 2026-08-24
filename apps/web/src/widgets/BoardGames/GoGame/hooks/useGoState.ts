'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import { getSessionState } from '@/features/games/lib';
import type { GameSessionSummary } from '@/shared/types/games';
import type { GoClientState } from '../types';

interface UseGoStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
}

export function useGoState({
  roomId,
  currentUserId,
  initialSession,
}: UseGoStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy, setStartBusy } =
    useGameSession({ roomId, enabled: true, initialSession });

  const snapshot: GoClientState | null = useMemo(
    () => getSessionState<GoClientState>(session),
    [session],
  );

  const currentPlayerId = snapshot
    ? snapshot.playerOrder[snapshot.currentTurnIndex]
    : null;

  const myTurn = !!(currentPlayerId && currentUserId && currentPlayerId === currentUserId);

  const isGameOver = snapshot?.phase === 'game_over';

  return {
    session,
    snapshot,
    currentPlayerId,
    myTurn,
    isGameOver,
    actionBusy,
    setActionBusy,
    startBusy,
    setStartBusy,
  };
}
