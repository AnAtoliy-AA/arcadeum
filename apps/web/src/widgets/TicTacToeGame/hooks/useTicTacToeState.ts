'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import type { TicTacToeClientState } from '../types';

interface UseTicTacToeStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useTicTacToeState({
  roomId,
  currentUserId,
  initialSession,
}: UseTicTacToeStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  const snapshot: TicTacToeClientState | null = useMemo(() => {
    if (session?.state) {
      return session.state as unknown as TicTacToeClientState;
    }
    return null;
  }, [session]);

  const currentEntryId = snapshot
    ? snapshot.playerOrder[snapshot.currentTurnIndex]
    : null;

  const currentShooterId = useMemo(() => {
    if (!snapshot || !currentEntryId) return null;
    if (!snapshot.options.teamMode) return currentEntryId;
    const team = snapshot.teams.find((t) => t.id === currentEntryId);
    return team ? team.playerIds[team.currentShooterIndex] : null;
  }, [snapshot, currentEntryId]);

  const myTurn = !!(
    currentShooterId &&
    currentUserId &&
    currentShooterId === currentUserId
  );

  const isGameOver = snapshot?.phase === 'game_over';

  return {
    session,
    snapshot,
    currentEntryId,
    currentShooterId,
    myTurn,
    isGameOver,
    actionBusy,
    setActionBusy,
    startBusy,
  };
}
