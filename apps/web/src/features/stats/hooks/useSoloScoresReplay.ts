'use client';

import { useEffect, useRef } from 'react';
import { useSoloScoreStore } from '../store/soloScoreStore';
import { soloScoresApi } from '@/shared/api/soloScores';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

const REPLAY_LIMIT = 50;
const REPLAY_MIN_INTERVAL_MS = 60_000;

let lastReplayAt = 0;

export function useSoloScoresReplay(): void {
  const getUnsyncedRecords = useSoloScoreStore((s) => s.getUnsyncedRecords);
  const markSynced = useSoloScoreStore((s) => s.markSynced);
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? null;
  const recordsVersion = useRef(0);

  useEffect(() => {
    recordsVersion.current++;
  }, [getUnsyncedRecords]);

  useEffect(() => {
    if (!token) return;

    const replay = () => {
      const now = Date.now();
      if (now - lastReplayAt < REPLAY_MIN_INTERVAL_MS) return;
      lastReplayAt = now;

      const unsynced = getUnsyncedRecords().slice(0, REPLAY_LIMIT);
      if (unsynced.length === 0) return;

      soloScoresApi
        .syncScores(unsynced, { token })
        .then((res) => {
          if (res.synced > 0) {
            markSynced(unsynced.map((r) => r.sessionId));
          }
        })
        .catch(() => {
          // silent — records stay local and will be replayed again later
        });
    };

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      replay();
    }
    window.addEventListener('online', replay);
    return () => window.removeEventListener('online', replay);
  }, [token, getUnsyncedRecords, markSynced]);
}
