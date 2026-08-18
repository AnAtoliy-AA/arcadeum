import { useCallback, useState } from 'react';
import {
  getChessHint,
  type ChessHint,
} from '@/features/coach/lib/hint-generator';
import { useCoachHintsSetting } from '@/shared/hooks/useCoachHintsSetting';
import type { GameRoomSummary } from '@/shared/types/games';
import type { ChessClientState } from '../types';

/**
 * Client-side coach-mode state for a chess game. Computes a best-move hint on
 * demand and drops it as soon as the position it was computed for changes
 * (optimistic move or server echo). Hints are opt-out via the shared settings
 * store and suppressed entirely in ranked matches.
 */
export interface UseChessCoachOptions {
  room: GameRoomSummary | null | undefined;
  currentUserId: string | null;
  displaySnapshot: ChessClientState | null;
}

export interface UseChessCoachResult {
  /** Best-move suggestion, or null when none is active/valid. */
  hint: ChessHint | null;
  /** Whether the "Hint" button should be shown right now. */
  hintAvailable: boolean;
  /** Whether the coach controls should be shown at all. */
  visible: boolean;
  enabled: boolean;
  requestHint: () => void;
  toggleEnabled: () => void;
}

export function useChessCoach({
  room,
  currentUserId,
  displaySnapshot,
}: UseChessCoachOptions): UseChessCoachResult {
  const { coachHintsEnabled, setCoachHintsEnabled } = useCoachHintsSetting();
  const [hintState, setHintState] = useState<{
    hint: ChessHint;
    ply: number;
  } | null>(null);

  const isRanked = room?.gameOptions?.ranked === true;
  const isGameOver = displaySnapshot?.phase === 'game_over';
  const myColor =
    displaySnapshot?.players.find((p) => p.playerId === currentUserId)?.color ??
    null;
  const displayMyTurn = !!(
    displaySnapshot &&
    currentUserId &&
    displaySnapshot.players.some(
      (p) =>
        p.playerId === currentUserId &&
        p.color === displaySnapshot.currentTurnColor,
    )
  );
  const isSpectator =
    !!currentUserId &&
    !displaySnapshot?.players.some((p) => p.playerId === currentUserId);
  const visible = !!currentUserId && !isGameOver && !isSpectator && !isRanked;
  const hintPly = displaySnapshot?.moveHistory.length ?? 0;
  const hint = hintState && hintState.ply === hintPly ? hintState.hint : null;
  const hintAvailable =
    coachHintsEnabled &&
    displayMyTurn &&
    !isGameOver &&
    !isSpectator &&
    !isRanked;

  const requestHint = useCallback(() => {
    if (!displaySnapshot || !myColor || isGameOver || !hintAvailable) return;
    const next = getChessHint(
      displaySnapshot.board,
      displaySnapshot.legalMovesForCurrentPlayer,
      displaySnapshot.enPassantTarget,
      myColor,
    );
    if (next) {
      setHintState({ hint: next, ply: displaySnapshot.moveHistory.length });
    }
  }, [displaySnapshot, myColor, isGameOver, hintAvailable]);

  const toggleEnabled = useCallback(() => {
    setCoachHintsEnabled(!coachHintsEnabled);
  }, [setCoachHintsEnabled, coachHintsEnabled]);

  return {
    hint,
    hintAvailable,
    visible,
    enabled: coachHintsEnabled,
    requestHint,
    toggleEnabled,
  };
}
