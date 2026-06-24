'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import type { CascadeClientState } from '../types';

interface UseCascadeStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useCascadeState({
  roomId,
  currentUserId,
  initialSession,
}: UseCascadeStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  const snapshot: CascadeClientState | null = useMemo(() => {
    if (session?.state) {
      return session.state as unknown as CascadeClientState;
    }
    return null;
  }, [session]);

  const currentEntryId = snapshot
    ? (snapshot.playerOrder[snapshot.currentTurnIndex] ?? null)
    : null;

  const myTurn = !!(
    currentEntryId &&
    currentUserId &&
    currentEntryId === currentUserId
  );

  const isGameOver = snapshot?.phase === 'game_over';

  const myHand = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.players.find((p) => p.playerId === currentUserId)?.hand ??
      [];
  }, [snapshot, currentUserId]);

  return {
    session,
    snapshot,
    currentEntryId,
    myTurn,
    isGameOver,
    myHand,
    actionBusy,
    setActionBusy,
    startBusy,
  };
}
