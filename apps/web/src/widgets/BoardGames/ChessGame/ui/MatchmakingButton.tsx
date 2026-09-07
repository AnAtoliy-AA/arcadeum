'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useMatchmaking } from '../hooks/useMatchmaking';

interface MatchmakingButtonProps {
  userId: string;
  rating: number;
  timeControlType: string;
}

export function MatchmakingButton({
  userId,
  rating,
  timeControlType,
}: MatchmakingButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] ?? 'en';
  const [searching, setSearching] = useState(false);

  const handleMatched = useCallback(
    (data: { roomId: string; color: string; opponent: string }) => {
      setSearching(false);
      router.push(`/${locale}/games/chess/${data.roomId}`);
    },
    [router, locale],
  );

  const { queued, waitTime, queueSize, joinQueue, leaveQueue } = useMatchmaking({
    userId,
    rating,
    timeControlType,
    onMatched: handleMatched,
  });

  const handleToggle = useCallback(() => {
    if (queued) {
      leaveQueue();
      setSearching(false);
    } else {
      joinQueue();
      setSearching(true);
    }
  }, [queued, joinQueue, leaveQueue]);

  const formatWaitTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (queued) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full py-3 px-4 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-500 text-sm font-semibold cursor-pointer hover:bg-sky-500/25 transition-colors animate-pulse"
        >
          {t('games.chess_v1.matchmaking.searching', {
            time: formatWaitTime(waitTime),
          })}
        </button>
        <div className="flex justify-between text-[10px] text-[var(--textSecondary)] px-1">
          <span>
            {t('games.chess_v1.matchmaking.position', { position: queueSize })}
          </span>
          <span>
            {t('games.chess_v1.matchmaking.rating', { rating })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!userId || searching}
      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-bold cursor-pointer hover:from-sky-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
    >
      {t('games.chess_v1.matchmaking.quickPlay')}
    </button>
  );
}
