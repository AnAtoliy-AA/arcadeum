'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import { getSessionState } from '@/features/games/lib';
import type { GameSessionSummary } from '@/shared/types/games';
import type { SpadesClientState } from '../types';

interface UseSpadesStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
}

export function useSpadesState({
  roomId,
  currentUserId,
  initialSession,
}: UseSpadesStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  const snapshot: SpadesClientState | null = useMemo(
    () => getSessionState<SpadesClientState>(session),
    [session],
  );

  const isBidding = snapshot?.phase === 'bidding';
  const isGameOver = snapshot?.phase === 'game_over';

  const currentEntryId = snapshot
    ? (snapshot.playerOrder[snapshot.currentTurnIndex] ?? null)
    : null;

  const myTurn =
    !!currentEntryId &&
    !!currentUserId &&
    currentEntryId === currentUserId &&
    !isGameOver;

  /** True once I have placed my bid for the current hand. */
  const hasBid = isBidding
    ? snapshot?.bids[currentUserId ?? ''] != null
    : false;

  const myHand = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.hands[currentUserId] ?? [];
  }, [snapshot, currentUserId]);

  /** My teammate id — the player seated two seats away. */
  const partnerId = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    const order = snapshot.playerOrder;
    const idx = order.indexOf(currentUserId);
    if (idx < 0 || order.length !== 4) return null;
    return order[(idx + 2) % order.length] ?? null;
  }, [snapshot, currentUserId]);

  return {
    session,
    snapshot,
    currentEntryId,
    myTurn,
    isGameOver,
    isBidding,
    hasBid,
    myHand,
    partnerId,
    actionBusy,
    setActionBusy,
    startBusy,
  };
}
