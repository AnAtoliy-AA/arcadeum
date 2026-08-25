import { useCallback, useRef, useState } from 'react';
import {
  getChessHint,
  type ChessHint,
} from '@/features/coach/lib/hint-generator';
import {
  mapServerHint,
  type ServerHintResult,
} from '@/features/coach/lib/hint-result';
import { useCoachHintsSetting } from '@/shared/hooks/useCoachHintsSetting';
import {
  emitEncrypted,
  gameSocket,
  isOfflineRoomId,
} from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import type { GameRoomSummary } from '@/shared/types/games';
import type { ChessClientState } from '../types';

const HINT_EVENT = 'games.session.hint';
const HINT_RESULT_EVENT = 'games.session.hint_result';
const HINT_RESULT_TIMEOUT_MS = 2000;

/**
 * Asks the server for a coach hint and resolves with the (already decrypted)
 * result payload. Resolves null on timeout or socket failure so callers can
 * fall back to local computation. Listens for a single reply only — the
 * server never broadcasts hint results.
 */
function fetchServerHint(
  roomId: string,
  userId: string,
  sessionId: string,
): Promise<ServerHintResult | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: ServerHintResult | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      gameSocket.off(HINT_RESULT_EVENT, listener);
      resolve(result);
    };
    const timer = setTimeout(() => finish(null), HINT_RESULT_TIMEOUT_MS);
    const listener = (raw: unknown) => {
      void maybeDecrypt<ServerHintResult>(raw)
        .then((data) => finish(data ?? null))
        .catch(() => finish(null));
    };
    gameSocket.on(HINT_RESULT_EVENT, listener);
    void emitEncrypted(gameSocket, HINT_EVENT, { roomId, userId, sessionId });
  });
}

/**
 * Client-side coach-mode state for a chess game. Requests a best-move hint on
 * demand — server-first via the games socket when an online session id is
 * available, falling back to local computation on timeout/failure/offline —
 * and drops it as soon as the position it was computed for changes
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
  const sessionId = useGameStore(
    (s: GameState) => (s.session as { id?: string } | null)?.id,
  );
  const [hintState, setHintState] = useState<{
    hint: ChessHint;
    ply: number;
  } | null>(null);
  const pendingRef = useRef(false);

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
    if (
      !displaySnapshot ||
      !myColor ||
      !currentUserId ||
      !room ||
      isGameOver ||
      !hintAvailable ||
      pendingRef.current
    ) {
      return;
    }
    pendingRef.current = true;

    const ply = displaySnapshot.moveHistory.length;
    const applyHint = (next: ChessHint | null) => {
      pendingRef.current = false;
      if (next) setHintState({ hint: next, ply });
    };

    const computeLocally = () =>
      getChessHint(
        displaySnapshot.board,
        displaySnapshot.legalMovesForCurrentPlayer,
        displaySnapshot.enPassantTarget,
        myColor,
      );

    if (!sessionId || isOfflineRoomId(room.id)) {
      applyHint(computeLocally());
      return;
    }

    void fetchServerHint(room.id, currentUserId, sessionId)
      .then((result) => (result?.ok ? mapServerHint(result.move) : null))
      .catch(() => null)
      .then((serverHint) => applyHint(serverHint ?? computeLocally()));
  }, [
    displaySnapshot,
    myColor,
    currentUserId,
    room,
    isGameOver,
    hintAvailable,
    sessionId,
  ]);

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
