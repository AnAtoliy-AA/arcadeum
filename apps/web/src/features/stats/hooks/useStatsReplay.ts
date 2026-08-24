import { useEffect } from 'react';
import { useLocalStatsStore, type LocalGameRecord } from '../store/statsStore';
import { historyApi } from '@/features/history/api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

/** How many recent local records to replay when connectivity returns. */
const REPLAY_LIMIT = 50;
const REPLAY_MIN_INTERVAL_MS = 60_000;

let lastReplayAt = 0;

/**
 * Replays locally-recorded results (e.g. offline bot games) to the backend
 * once connectivity returns. The sync endpoint is idempotent, so replaying
 * already-synced records is safe.
 */
export function useStatsReplay(): void {
  const records = useLocalStatsStore((s) => s.records);
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? null;

  useEffect(() => {
    if (!token) return;

    const replay = () => {
      const now = Date.now();
      if (now - lastReplayAt < REPLAY_MIN_INTERVAL_MS) return;
      lastReplayAt = now;
      const recent = records
        .slice(0, REPLAY_LIMIT)
        .filter((r: LocalGameRecord) => typeof r.sessionId === 'string')
        .map((r: LocalGameRecord) => ({
          gameId: r.gameId,
          result: r.result,
          timestamp: r.timestamp,
          sessionId: r.sessionId as string,
        }));
      if (recent.length === 0) return;
      historyApi.syncStats(recent, { token }).catch(() => {
        // silent — records stay local and will be replayed again later
      });
    };

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      replay();
    }
    window.addEventListener('online', replay);
    return () => window.removeEventListener('online', replay);
  }, [records, token]);
}
