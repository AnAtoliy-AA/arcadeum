import { useMemo } from 'react';
import type { GameSessionSummary } from '@/shared/types/games';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import {
  computeGameResult,
  type BackendGameResult,
} from '@/features/games/lib/computeGameResult';
import { useRecordGameResult } from '@/features/stats/hooks/useRecordGameResult';
import type { GameResult, ResultMessages } from './useGameResultModal';

interface UseGameResultOptions {
  session: GameSessionSummary | null | undefined;
  isGameOver: boolean;
  currentUserId: string | null | undefined;
  /** BE game id used for local stats recording, e.g. 'checkers_v1'. */
  gameId: string;
  /** i18n prefix of the gameOver messages, e.g. 'games.checkers_v1.gameOver'. */
  gameOverKey: string;
  winnerId?: string | null;
  /** All players who share the win (co-winners). Takes precedence over `winnerId`. */
  winnerIds?: string[] | null;
  isDraw?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

/**
 * Shared game-result computation: derives the local player's result from the
 * session (preferring the backend-attached `gameResult`), records it for the
 * local stats store, and builds the result modal's title/message keys.
 *
 * Previously every game duplicated this exact block (computeGameResult +
 * backendResult cast + useRecordGameResult + the won/lost/draw key template).
 */
export function useGameResult(options: UseGameResultOptions): {
  result: GameResult;
  resultMessages: ResultMessages | undefined;
} {
  const {
    session,
    isGameOver,
    currentUserId,
    gameId,
    gameOverKey,
    winnerId,
    winnerIds,
    isDraw,
    t,
  } = options;

  const result = useMemo(
    () =>
      computeGameResult(isGameOver, currentUserId, {
        winnerId,
        winnerIds,
        isDraw,
        backendResult: (session?.state as Record<string, unknown>)
          ?.gameResult as BackendGameResult | undefined,
      }),
    [isGameOver, currentUserId, winnerId, winnerIds, isDraw, session],
  );

  useRecordGameResult(result, gameId, session?.id);

  const resultMessages = useMemo<ResultMessages | undefined>(() => {
    if (!result) return undefined;
    return {
      title: t(`${gameOverKey}.${result}` as TranslationKey),
      message: t(`${gameOverKey}.messages.${result}` as TranslationKey),
    };
  }, [result, gameOverKey, t]);

  return { result, resultMessages };
}
