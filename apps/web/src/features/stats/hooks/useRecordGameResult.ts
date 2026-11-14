import { useEffect, useRef } from 'react';
import { useLocalStatsStore } from '../store/statsStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { historyApi } from '@/features/history/api';
import { useArcadePetStore } from '@/features/arcade-pet/store/useArcadePetStore';
import type { GameResult } from '@/features/games/hooks/useGameResultModal';

function getGameTreat(gameId: string) {
  if (gameId.includes('chess')) return 'chess_cookie';
  if (gameId.includes('sea_battle') || gameId.includes('battleship'))
    return 'sea_battle_fish';
  if (gameId.includes('hearts')) return 'hearts_candy';
  if (gameId.includes('critical')) return 'critical_pepper';
  return 'pachisi_spice';
}

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

    if (result === 'won' && gameId !== 'arcade_pet_v1') {
      useArcadePetStore.getState().awardTreat(getGameTreat(gameId));
    }

    if (snapshot.accessToken) {
      historyApi
        .syncStats([record], { token: snapshot.accessToken })
        .catch(() => {
          // silent — local record is already saved
        });
    }
  }, [result, gameId, sessionId, recordGameResult, snapshot.accessToken]);
}
