import { useMemo } from 'react';
import { GameSessionSummary } from '../../../api/gamesApi';
import { TexasHoldemSnapshot } from '../types';

export function useTexasHoldemGame(
  session: GameSessionSummary | null,
  currentUserId: string | null,
) {
  const snapshot = useMemo(() => {
    if (!session?.state) return null;
    const stateData = session.state as any;
    return stateData as TexasHoldemSnapshot | undefined;
  }, [session]);

  const currentPlayer = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return snapshot.players.find((p) => p.playerId === currentUserId);
  }, [snapshot, currentUserId]);

  const isCurrentTurn = useMemo(() => {
    if (!snapshot || !currentUserId) return false;
    return snapshot.playerOrder[snapshot.currentTurnIndex] === currentUserId;
  }, [snapshot, currentUserId]);

  const canAct = useMemo(() => {
    return (
      isCurrentTurn &&
      currentPlayer &&
      !currentPlayer.folded &&
      !currentPlayer.allIn
    );
  }, [isCurrentTurn, currentPlayer]);

  const callAmount = useMemo(() => {
    if (!currentPlayer || !snapshot) return 0;
    return snapshot.currentBet - currentPlayer.currentBet;
  }, [currentPlayer, snapshot]);

  return {
    snapshot,
    currentPlayer,
    isCurrentTurn,
    canAct,
    callAmount,
  };
}
