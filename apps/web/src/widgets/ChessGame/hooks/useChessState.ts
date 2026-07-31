'use client';

import { useMemo } from 'react';
import { useGameSession } from '@/features/games/hooks';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import type { ChessClientState } from '../types';

interface UseChessStateOptions {
  roomId: string;
  currentUserId: string | null;
  initialSession: GameSessionSummary | null;
  accessToken?: string | null;
  room?: GameRoomSummary;
}

export function useChessState({
  roomId,
  currentUserId,
  initialSession,
}: UseChessStateOptions) {
  const { session, actionBusy, setActionBusy, startBusy, setStartBusy } =
    useGameSession({
      roomId,
      enabled: true,
      initialSession,
    });

  const snapshot: ChessClientState | null = useMemo(() => {
    if (session?.state) {
      return session.state as unknown as ChessClientState;
    }
    return null;
  }, [session]);

  const currentPlayerId = useMemo(() => {
    if (!snapshot) return null;
    const player = snapshot.players.find(
      (p) => p.color === snapshot.currentTurnColor,
    );
    return player?.playerId ?? null;
  }, [snapshot]);

  const isSpectator = useMemo(() => {
    if (!snapshot || !currentUserId) return false;
    return !snapshot.players.some((p) => p.playerId === currentUserId);
  }, [snapshot, currentUserId]);

  const myColor = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    if (isSpectator) return null;
    const player = snapshot.players.find((p) => p.playerId === currentUserId);
    return player?.color ?? null;
  }, [snapshot, currentUserId, isSpectator]);

  const myTurn = !!(
    currentPlayerId &&
    currentUserId &&
    currentPlayerId === currentUserId
  );

  const isGameOver =
    snapshot?.phase === 'game_over' ||
    snapshot?.isCheckmate ||
    snapshot?.isStalemate ||
    snapshot?.winnerColor !== null ||
    snapshot?.isDrawByRepetition ||
    snapshot?.isDrawByFiftyMoveRule ||
    snapshot?.isInsufficientMaterial ||
    snapshot?.isDrawByAgreement;

  return {
    session,
    snapshot,
    currentPlayerId,
    myColor,
    myTurn,
    isSpectator,
    isGameOver,
    actionBusy,
    setActionBusy,
    startBusy,
    setStartBusy,
  };
}
