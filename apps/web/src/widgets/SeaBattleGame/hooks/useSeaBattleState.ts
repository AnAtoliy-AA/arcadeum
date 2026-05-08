import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import type {
  SeaBattleSnapshot,
  SeaBattlePlayerState,
  SeaBattleTeam,
} from '../types';

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

    return null;
  }, [session]);

  const currentPlayer: SeaBattlePlayerState | null = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return snapshot.players.find((p) => p.playerId === currentUserId) || null;
  }, [snapshot, currentUserId]);

  const teams: SeaBattleTeam[] | undefined = snapshot?.teams;
  const teamMode = !!teams && teams.length > 0;

  const viewerTeam = useMemo(() => {
    if (!teams || !currentUserId) return undefined;
    return teams.find((t) => t.playerIds.includes(currentUserId));
  }, [teams, currentUserId]);

  const activeShooterId = useMemo<string | undefined>(() => {
    if (!snapshot) return undefined;
    if (
      teams &&
      snapshot.teamOrder &&
      snapshot.currentTeamIndex !== undefined
    ) {
      const activeTeamId = snapshot.teamOrder[snapshot.currentTeamIndex];
      const activeTeam = teams.find((t) => t.id === activeTeamId);
      return activeTeam?.playerIds[activeTeam.currentShooterIndex];
    }
    return snapshot.playerOrder[snapshot.currentTurnIndex];
  }, [snapshot, teams]);

  const currentTurnPlayer = useMemo(() => {
    if (!snapshot || !activeShooterId) return null;
    return snapshot.players.find((p) => p.playerId === activeShooterId) || null;
  }, [snapshot, activeShooterId]);

  const isMyTurn = useMemo(() => {
    return activeShooterId === currentUserId && currentPlayer?.alive === true;
  }, [activeShooterId, currentUserId, currentPlayer]);

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

  const winnerTeam = useMemo<SeaBattleTeam | undefined>(() => {
    if (!isGameOver || !snapshot || !teams) return undefined;
    if (snapshot.winnerId) {
      return teams.find((t) => t.id === snapshot.winnerId);
    }
    return undefined;
  }, [isGameOver, snapshot, teams]);

  const winner = useMemo(() => {
    if (!isGameOver || !snapshot) return null;
    if (teams) return null; // teams use winnerTeam instead
    const alivePlayers = snapshot.players.filter((p) => p.alive);
    return alivePlayers.length === 1 ? alivePlayers[0] : null;
  }, [isGameOver, snapshot, teams]);

  const isWinner = teams
    ? !!viewerTeam && winnerTeam?.id === viewerTeam.id
    : winner?.playerId === currentUserId;

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
    teams,
    teamMode,
    viewerTeam,
    activeShooterId,
    winnerTeam,
  };
}
