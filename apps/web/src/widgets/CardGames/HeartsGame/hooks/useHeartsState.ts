'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import { getSessionState } from '@/features/games/lib';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import type { HeartsClientState } from '../types';

interface UseHeartsStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useHeartsState({
  roomId,
  currentUserId,
  initialSession,
}: UseHeartsStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  const snapshot: HeartsClientState | null = useMemo(
    () => getSessionState<HeartsClientState>(session),
    [session],
  );

  const currentEntryId = snapshot
    ? (snapshot.playerOrder[snapshot.currentTurnIndex] ?? null)
    : null;

  const myTurn = !!(
    currentEntryId &&
    currentUserId &&
    currentEntryId === currentUserId
  );

  const isGameOver = snapshot?.phase === 'game_over';
  const isPassing = snapshot?.phase === 'passing';

  const myHand = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.hands[currentUserId] ?? [];
  }, [snapshot, currentUserId]);

  return {
    session,
    snapshot,
    currentEntryId,
    myTurn,
    isGameOver,
    isPassing,
    myHand,
    actionBusy,
    setActionBusy,
    startBusy,
  };
}
