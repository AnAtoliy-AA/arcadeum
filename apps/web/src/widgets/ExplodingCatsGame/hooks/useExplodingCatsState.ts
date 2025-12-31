import { useMemo, useState, useEffect, useRef } from 'react';
import { useGameSession, useGameActions } from '@/features/games/hooks';
import type { ExplodingCatsSnapshot, ExplodingCatsPlayerState } from '../types';

interface UseExplodingCatsStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: unknown | null;
}

/** Threshold in ms after which actionBusy is considered "long pending" */
const LONG_PENDING_THRESHOLD_MS = 2000;

/**
 * Hook for managing Exploding Cats game state
 */
export function useExplodingCatsState({
  roomId,
  currentUserId,
  initialSession,
}: UseExplodingCatsStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  // Track pending action state (updated by interval callback only)
  const [pendingElapsedSecondsInternal, setPendingElapsedSecondsInternal] =
    useState(0);
  const [actionLongPendingInternal, setActionLongPendingInternal] =
    useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Estimated server wake-up time in seconds (used for percentage calculation)
  const ESTIMATED_WAKE_TIME_SECONDS = 30;

  // Effect manages timer/interval for pending action tracking
  useEffect(() => {
    if (!actionBusy) {
      startTimeRef.current = null;
      return;
    }

    // Set start time when action begins
    startTimeRef.current = Date.now();
    // Reset values when new action starts (using setTimeout to avoid sync setState in effect)
    const resetTimeout = setTimeout(() => {
      setPendingElapsedSecondsInternal(0);
      setActionLongPendingInternal(false);
    }, 0);

    // Update state every second based on elapsed time
    const interval = setInterval(() => {
      if (startTimeRef.current === null) return;
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setPendingElapsedSecondsInternal(elapsed);
      setActionLongPendingInternal(
        now - startTimeRef.current >= LONG_PENDING_THRESHOLD_MS,
      );
    }, 1000);

    return () => {
      clearTimeout(resetTimeout);
      clearInterval(interval);
    };
  }, [actionBusy]);

  // Exported values: if not busy, always show reset state
  const actionLongPending = actionBusy ? actionLongPendingInternal : false;
  const pendingElapsedSeconds = actionBusy ? pendingElapsedSecondsInternal : 0;

  // Calculate progress percentage (caps at 99% until server responds)
  const pendingProgress = Math.min(
    99,
    Math.round((pendingElapsedSeconds / ESTIMATED_WAKE_TIME_SECONDS) * 100),
  );

  const actions = useGameActions({
    roomId,
    userId: currentUserId,
    gameType: 'exploding_kittens_v1',
    setActionBusy,
    onActionComplete: () => setActionBusy(null),
  });

  const snapshot: ExplodingCatsSnapshot | null = useMemo(() => {
    if (!session?.state) return null;
    return session.state as unknown as ExplodingCatsSnapshot;
  }, [session]);

  const currentPlayer: ExplodingCatsPlayerState | null = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return snapshot.players.find((p) => p.playerId === currentUserId) || null;
  }, [snapshot, currentUserId]);

  const currentTurnPlayer = useMemo(() => {
    if (!snapshot) return null;
    const turnPlayerId = snapshot.playerOrder[snapshot.currentTurnIndex];
    return snapshot.players.find((p) => p.playerId === turnPlayerId);
  }, [snapshot]);

  const isMyTurn = useMemo(() => {
    return (
      currentTurnPlayer?.playerId === currentUserId &&
      currentPlayer?.alive === true
    );
  }, [currentTurnPlayer, currentUserId, currentPlayer]);

  const canAct = useMemo(() => {
    // Can't act if there's a pending favor (waiting for opponent to give a card)
    const hasPendingFavor = !!snapshot?.pendingFavor;
    return isMyTurn && !actionBusy && currentPlayer?.alive && !hasPendingFavor;
  }, [isMyTurn, actionBusy, currentPlayer, snapshot?.pendingFavor]);

  const aliveOpponents = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.players.filter(
      (p) => p.alive && p.playerId !== currentUserId,
    );
  }, [snapshot, currentUserId]);

  const isGameOver = session?.status === 'completed';

  return {
    session,
    snapshot,
    actionBusy,
    actionLongPending,
    pendingProgress,
    pendingElapsedSeconds,
    startBusy,
    actions,
    currentPlayer,
    currentTurnPlayer,
    isMyTurn,
    canAct,
    aliveOpponents,
    isGameOver,
  };
}
