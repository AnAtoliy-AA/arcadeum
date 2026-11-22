import { useEffect, useRef } from 'react';
import { useLocalStatsStore } from '../store/statsStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { historyApi } from '@/features/history/api';
import type { GameTreatId } from '@arcadeum/games-core';
import { useArcadePetStore } from '@/features/arcade-pet/store/useArcadePetStore';
import type { GameResult } from '@/features/games/hooks/useGameResultModal';

/**
 * Treat each game rewards on a win. Exhaustive per game id: games without an
 * entry (including ArcadePet itself) award nothing.
 *
 * Treats are held in the pet inventory, which the server accepts from the
 * client only within validated bounds (known ids, 0-99 each). They carry no
 * gem or coin value, so a client-side award is a deliberate trade-off.
 */
const GAME_TREATS: Readonly<Record<string, GameTreatId>> = {
  chess_v1: 'chess_cookie',
  sea_battle_v1: 'sea_battle_fish',
  hearts_v1: 'hearts_candy',
  critical_v1: 'critical_pepper',
  pachisi_v1: 'pachisi_spice',
};

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

    const treat = GAME_TREATS[gameId];
    if (result === 'won' && treat) {
      useArcadePetStore.getState().awardTreat(treat);
    }

    if (snapshot.accessToken) {
      historyApi
        .syncStats([record], { token: snapshot.accessToken })
        .catch(() => {
          // silent: local record is already saved
        });
    }
  }, [result, gameId, sessionId, recordGameResult, snapshot.accessToken]);
}
