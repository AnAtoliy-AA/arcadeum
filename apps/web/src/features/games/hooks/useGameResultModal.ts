import { useState, useMemo, useCallback } from 'react';
import type { GameSessionSummary } from '@/shared/types/games';

export type GameResult = 'won' | 'lost' | 'draw' | null;
export type SharedResult = 'victory' | 'defeat' | 'draw' | null;

export interface ResultMessages {
  title: string;
  message: string;
}

/**
 * Shared result-modal state for turn-based games. Computes the game result,
 * tracks which session has been dismissed, and derives the display values
 * the `GameResultModal` expects.
 *
 * Suppresses the modal when entering an already-completed room from the
 * rooms list — the result modal should only appear when a game finishes
 * during the current session.
 */
export function useGameResultModal(
  session: GameSessionSummary | null | undefined,
  result: GameResult,
  resultMessages: ResultMessages | undefined,
) {
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(
    null,
  );

  const [initialSessionStatus] = useState(() => session?.status);

  const sessionWasCompletedFromStart = initialSessionStatus === 'completed';

  const showResultModal =
    !!result &&
    !sessionWasCompletedFromStart &&
    dismissedSessionId !== (session?.id ?? null);

  const sharedResult: SharedResult = useMemo(() => {
    if (result === 'won') return 'victory';
    if (result === 'lost') return 'defeat';
    return result;
  }, [result]);

  const dismiss = useCallback(
    () => setDismissedSessionId(session?.id ?? null),
    [session?.id],
  );

  return {
    showResultModal,
    sharedResult,
    resultMessages,
    dismiss,
  } as const;
}
