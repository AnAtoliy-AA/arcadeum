'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import { getSessionState } from '@/features/games/lib';
import type { GameSessionSummary } from '@/shared/types/games';
import type { HeartsClientState } from '../types';

interface UseHeartsStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
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

  const isPassing = snapshot?.phase === 'passing';
  const isGameOver = snapshot?.phase === 'game_over';

  const currentEntryId = snapshot
    ? (snapshot.playerOrder[snapshot.currentTurnIndex] ?? null)
    : null;

  const myTurn =
    !!currentEntryId &&
    !!currentUserId &&
    currentEntryId === currentUserId &&
    !isPassing &&
    !isGameOver;

  /** During passing everyone may act until they have submitted their cards. */
  const hasPassed = isPassing
    ? (snapshot?.pendingPasses[currentUserId ?? '']?.length ?? 0) > 0
    : false;

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
    hasPassed,
    myHand,
    actionBusy,
    setActionBusy,
    startBusy,
  };
}
