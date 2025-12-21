import { useMemo } from "react";
import { useGameSession, useGameActions } from "@/features/games/hooks";
import type { ExplodingCatsSnapshot, ExplodingCatsPlayerState } from "../types";

interface UseExplodingCatsStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: unknown | null;
}

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

  const actions = useGameActions({
    roomId,
    userId: currentUserId,
    gameType: "exploding_kittens_v1",
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
    return currentTurnPlayer?.playerId === currentUserId;
  }, [currentTurnPlayer, currentUserId]);

  const canAct = useMemo(() => {
    return isMyTurn && !actionBusy && currentPlayer?.alive;
  }, [isMyTurn, actionBusy, currentPlayer]);

  const aliveOpponents = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.players.filter(
      (p) => p.alive && p.playerId !== currentUserId
    );
  }, [snapshot, currentUserId]);

  return {
    session,
    snapshot,
    actionBusy,
    startBusy,
    actions,
    currentPlayer,
    currentTurnPlayer,
    isMyTurn,
    canAct,
    aliveOpponents,
  };
}
