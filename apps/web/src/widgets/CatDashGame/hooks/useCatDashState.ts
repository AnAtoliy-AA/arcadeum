'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import type { CatDashClientState } from '../types';

interface UseCatDashStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useCatDashState({
  roomId,
  currentUserId,
  initialSession,
}: UseCatDashStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy, setStartBusy } =
    useGameSession({
      roomId,
      enabled: true,
      initialSession,
    });

  const snapshot: CatDashClientState | null = useMemo(() => {
    if (session?.state) {
      return session.state as unknown as CatDashClientState;
    }
    return null;
  }, [session]);

  const currentEntryId = snapshot
    ? (snapshot.players[snapshot.currentPlayerIndex]?.playerId ?? null)
    : null;

  const myTurn = !!(
    currentEntryId &&
    currentUserId &&
    currentEntryId === currentUserId
  );

  const isGameOver = snapshot?.gameOver ?? false;

  return {
    session,
    snapshot,
    currentEntryId,
    myTurn,
    isGameOver,
    actionBusy,
    setActionBusy,
    startBusy,
    setStartBusy,
  };
}
