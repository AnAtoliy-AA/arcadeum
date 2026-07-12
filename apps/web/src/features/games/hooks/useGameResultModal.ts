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
 */
export function useGameResultModal(
  session: GameSessionSummary | null | undefined,
  result: GameResult,
  resultMessages: ResultMessages | undefined,
) {
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(
    null,
  );

  const showResultModal =
    !!result && dismissedSessionId !== (session?.id ?? null);

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
