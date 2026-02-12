import { useMemo, useEffect, useCallback } from 'react';
import { useGameSession, useGameActions } from '@/features/games/hooks';
import { gameSocket } from '@/shared/lib/socket';
import type { CriticalSnapshot, CriticalPlayerState } from '../types';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';

import type { GameSessionSummary } from '@/shared/types/games';

interface UseCriticalStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
}

/**
 * Hook for managing Critical game state
 */
export function useCriticalState({
  roomId,
  currentUserId,
  initialSession,
  accessToken,
}: UseCriticalStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  // Track pending action state using shared hook
  const {
    isLongPending: actionLongPending,
    progress: pendingProgress,
    elapsedSeconds: pendingElapsedSeconds,
  } = useServerWakeUpProgress(Boolean(actionBusy));

  // Clear actionBusy when an exception is received from the server
  useEffect(() => {
    const handleException = () => {
      setActionBusy(null);
    };

    gameSocket.on('exception', handleException);

    return () => {
      gameSocket.off('exception', handleException);
    };
  }, [setActionBusy]);

  const actions = useGameActions({
    roomId,
    userId: currentUserId,
    gameType: 'critical_v1',
    setActionBusy,
    onActionComplete: () => setActionBusy(null),
  });

  const reorderParticipants = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;

      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch (error) {
        console.error('Failed to reorder participants:', error);
      }
    },
    [roomId, accessToken],
  );

  const snapshot: CriticalSnapshot | null = useMemo(() => {
    if (!session?.state) return null;
    return session.state as unknown as CriticalSnapshot;
  }, [session]);

  const currentPlayer: CriticalPlayerState | null = useMemo(() => {
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
    // Can't act if game is over
    if (session?.status === 'completed') return false;

    // Can't act if there's a pending favor (waiting for opponent to give a card)
    const hasPendingFavor = !!snapshot?.pendingFavor;
    return isMyTurn && !actionBusy && currentPlayer?.alive && !hasPendingFavor;
  }, [
    session?.status,
    isMyTurn,
    actionBusy,
    currentPlayer,
    snapshot?.pendingFavor,
  ]);

  const aliveOpponents = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.players.filter(
      (p) => p.alive && p.playerId !== currentUserId,
    );
  }, [snapshot, currentUserId]);

  // Nope can be played when there's a pending action that:
  // 1) Exists
  // 2) Is not a draw action
  // 3) Was not played by the current user (can't nope own actions)
  const canPlayNope = useMemo(() => {
    const hasNopeCard = currentPlayer?.hand.includes('cancel');
    if (!hasNopeCard || !currentPlayer?.alive || actionBusy) return false;

    const pending = snapshot?.pendingAction;
    if (!pending) return false;

    // Can't nope draw actions
    if (pending.type === 'draw') return false;

    // Can't nope your own actions
    if (pending.playerId === currentUserId) return false;

    return true;
  }, [currentPlayer, actionBusy, snapshot?.pendingAction, currentUserId]);

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
    reorderParticipants,
    currentPlayer,
    currentTurnPlayer,
    isMyTurn,
    canAct,
    canPlayNope,
    aliveOpponents,
    isGameOver,
  };
}
