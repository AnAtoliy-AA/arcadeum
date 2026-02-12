import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import type { SeaBattleSnapshot, SeaBattlePlayerState } from '../types';

// Re-checking usage... line 73: const isPlacementPhase = gamePhase === 'placement'; 'placement' is a string literal.
// But check imports again.
// The lint said: 7:3 warning 'GAME_PHASE' is defined but never used.
// So removal IS correct.
import { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';

interface UseSeaBattleStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useSeaBattleState({
  roomId,
  currentUserId,
  initialSession,
}: UseSeaBattleStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  const snapshot: SeaBattleSnapshot | null = useMemo(() => {
    if (session?.state) {
      return session.state as unknown as SeaBattleSnapshot;
    }

    // Return null if no session - game hasn't started yet
    return null;
  }, [session]);

  const currentPlayer: SeaBattlePlayerState | null = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return snapshot.players.find((p) => p.playerId === currentUserId) || null;
  }, [snapshot, currentUserId]);

  const currentTurnPlayer = useMemo(() => {
    if (!snapshot) return null;
    const turnPlayerId = snapshot.playerOrder[snapshot.currentTurnIndex];
    return snapshot.players.find((p) => p.playerId === turnPlayerId) || null;
  }, [snapshot]);

  const isMyTurn = useMemo(() => {
    return (
      currentTurnPlayer?.playerId === currentUserId &&
      currentPlayer?.alive === true
    );
  }, [currentTurnPlayer, currentUserId, currentPlayer]);

  const opponents = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.players.filter(
      (p) => p.playerId !== currentUserId && p.alive,
    );
  }, [snapshot, currentUserId]);

  const gamePhase = snapshot?.phase || 'lobby';
  const isPlacementPhase = gamePhase === 'placement';
  const isBattlePhase = gamePhase === 'battle';
  const isGameOver =
    gamePhase === 'game_over' || session?.status === 'completed';

  const winner = useMemo(() => {
    if (!isGameOver || !snapshot) return null;
    const alivePlayers = snapshot.players.filter((p) => p.alive);
    return alivePlayers.length === 1 ? alivePlayers[0] : null;
  }, [isGameOver, snapshot]);

  const isWinner = winner?.playerId === currentUserId;

  const placedShips = currentPlayer?.ships || [];
  const isPlacementComplete = currentPlayer?.placementComplete || false;

  return {
    session,
    snapshot,
    actionBusy,
    setActionBusy,
    startBusy,
    currentPlayer,
    currentTurnPlayer,
    isMyTurn,
    opponents,
    gamePhase,
    isPlacementPhase,
    isBattlePhase,
    isGameOver,
    winner,
    isWinner,
    placedShips,
    isPlacementComplete,
    lastAttack: snapshot?.lastAttack,
    logs: snapshot?.logs || [],
  };
}
