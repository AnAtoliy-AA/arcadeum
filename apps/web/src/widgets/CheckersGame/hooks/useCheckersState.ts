'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import type { CheckersClientState } from '../types';

interface UseCheckersStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useCheckersState({
  roomId,
  currentUserId,
  initialSession,
}: UseCheckersStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy, setStartBusy } =
    useGameSession({
      roomId,
      enabled: true,
      initialSession,
    });

  const snapshot: CheckersClientState | null = useMemo(() => {
    if (session?.state) {
      return session.state as unknown as CheckersClientState;
    }
    return null;
  }, [session]);

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
