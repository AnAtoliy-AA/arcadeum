import { useEffect, useRef } from 'react';
import { useLocalStatsStore } from '../store/statsStore';
import type { GameResult } from '@/features/games/hooks/useGameResultModal';

/**
 * Automatically records game results to the local stats store.
 * Deduplicates by sessionId to prevent double-recording.
 */
export function useRecordGameResult(
  result: GameResult,
  gameId: string,
  sessionId?: string | null,
) {
  const recordGameResult = useLocalStatsStore((s) => s.recordGameResult);
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!result || !sessionId) return;
    if (recordedRef.current === sessionId) return;

    recordedRef.current = sessionId;
    recordGameResult({
      gameId,
      result,
      timestamp: Date.now(),
      sessionId,
    });
  }, [result, gameId, sessionId, recordGameResult]);
}
