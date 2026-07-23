import { useEffect, useRef } from 'react';
import { useLocalStatsStore } from '../store/statsStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { historyApi } from '@/features/history/api';
import type { GameResult } from '@/features/games/hooks/useGameResultModal';

export function useRecordGameResult(
  result: GameResult,
  gameId: string,
  sessionId?: string | null,
) {
  const recordGameResult = useLocalStatsStore((s) => s.recordGameResult);
  const { snapshot } = useSessionTokens();
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!result || !sessionId) return;
    if (recordedRef.current === sessionId) return;

    recordedRef.current = sessionId;
    const record = {
      gameId,
      result,
      timestamp: Date.now(),
      sessionId,
    };

    recordGameResult(record);

    if (snapshot.accessToken) {
      historyApi.syncStats([record], { token: snapshot.accessToken }).catch(() => {
        // silent — local record is already saved
      });
    }
  }, [result, gameId, sessionId, recordGameResult, snapshot.accessToken]);
}
