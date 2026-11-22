import { useCallback, useRef, useState } from 'react';
import { getCheckersHint } from '@/features/coach/lib/hint-generator';
import {
  mapServerCheckersHint,
  type CheckersHint,
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
import type { CheckersClientState } from '../types';

const HINT_EVENT = 'games.session.hint';
const HINT_RESULT_EVENT = 'games.session.hint_result';
const HINT_RESULT_TIMEOUT_MS = 2000;

function fetchServerCheckersHint(
  roomId: string,
  userId: string,
  sessionId: string,
): Promise<CheckersHint | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: CheckersHint | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      gameSocket.off(HINT_RESULT_EVENT, listener);
      resolve(result);
    };
    const timer = setTimeout(() => finish(null), HINT_RESULT_TIMEOUT_MS);
    const listener = (raw: unknown) => {
      void maybeDecrypt<ServerHintResult>(raw)
        .then((data) => {
          if (data && data.ok && data.move) {
            finish(mapServerCheckersHint(data.move));
          } else {
            finish(null);
          }
        })
        .catch(() => finish(null));
    };
    gameSocket.on(HINT_RESULT_EVENT, listener);
    void emitEncrypted(gameSocket, HINT_EVENT, { roomId, userId, sessionId });
  });
}

export interface UseCheckersCoachOptions {
  room: GameRoomSummary | null | undefined;
  currentUserId: string | null;
  snapshot: CheckersClientState | null;
  myTurn: boolean;
  isGameOver: boolean;
}

export interface UseCheckersCoachResult {
  hint: CheckersHint | null;
  hintAvailable: boolean;
  visible: boolean;
  enabled: boolean;
  requestHint: () => void;
  toggleEnabled: () => void;
}

export function useCheckersCoach({
  room,
  currentUserId,
  snapshot,
  myTurn,
  isGameOver,
}: UseCheckersCoachOptions): UseCheckersCoachResult {
  const { coachHintsEnabled, setCoachHintsEnabled } = useCoachHintsSetting();
  const sessionId = useGameStore(
    (s: GameState) => (s.session as { id?: string } | null)?.id,
  );
  const [hintState, setHintState] = useState<{
    hint: CheckersHint;
    turnKey: string;
  } | null>(null);
  const pendingRef = useRef(false);

  const isRanked = room?.gameOptions?.ranked === true;
  const isParticipant = !!(
    currentUserId && snapshot?.players.some((p) => p.playerId === currentUserId)
  );
  const visible = !!currentUserId && isParticipant && !isGameOver && !isRanked;
  const turnKey = `${snapshot?.currentTurnIndex ?? 0}_${snapshot?.phase ?? ''}`;
  const hint =
    hintState && hintState.turnKey === turnKey ? hintState.hint : null;
  const hintAvailable = coachHintsEnabled && myTurn && !isGameOver && !isRanked;

  const requestHint = useCallback(() => {
    if (
      !snapshot ||
      !currentUserId ||
      !room ||
      isGameOver ||
      !hintAvailable ||
      pendingRef.current
    ) {
      return;
    }
    pendingRef.current = true;

    const currentTurnKey = `${snapshot.currentTurnIndex}_${snapshot.phase}`;
    const applyHint = (next: CheckersHint | null) => {
      pendingRef.current = false;
      if (!next) return;
      setHintState({ hint: next, turnKey: currentTurnKey });
    };

    if (sessionId && !isOfflineRoomId(room.id)) {
      void fetchServerCheckersHint(room.id, currentUserId, sessionId).then(
        (serverHint) => {
          if (serverHint) {
            applyHint(serverHint);
          } else {
            applyHint(getCheckersHint(snapshot, currentUserId));
          }
        },
      );
      return;
    }

    applyHint(getCheckersHint(snapshot, currentUserId));
  }, [snapshot, currentUserId, room, isGameOver, hintAvailable, sessionId]);

  const toggleEnabled = useCallback(() => {
    setCoachHintsEnabled(!coachHintsEnabled);
  }, [coachHintsEnabled, setCoachHintsEnabled]);

  return {
    hint,
    hintAvailable,
    visible,
    enabled: coachHintsEnabled,
    requestHint,
    toggleEnabled,
  };
}
