'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import type { ReplayDetail } from '../lib/types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface ReplayHeaderProps {
  replay: ReplayDetail;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function ReplayHeader({ replay, t }: ReplayHeaderProps) {
  const durationMinutes = Math.floor(replay.durationMs / 60_000);
  const durationSeconds = Math.floor((replay.durationMs % 60_000) / 1000);
  const dateStr = new Date(replay.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const resultLabel = replay.result?.isDraw
    ? t('games.replay.header.draw')
    : replay.result?.winnerIds.length
      ? t('games.replay.header.winner', {
          name:
            replay.players.find((p) => replay.result?.winnerIds.includes(p.id))
              ?.displayName ?? '',
        })
      : '';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-white">
          {t('games.replay.header.title', { game: replay.gameId })}
        </h1>
        <span className="text-[13px] text-[rgba(255,255,255,0.5)]">
          {dateStr}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {replay.players.map((player, i) => (
          <div key={player.id} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[14px] text-[rgba(255,255,255,0.3)]">
                vs
              </span>
            )}
            <span
              className={cx(
                'rounded-lg px-3 py-1.5 text-[14px] font-semibold',
                'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.9)]',
                replay.result?.winnerIds.includes(player.id) &&
                  'border border-[var(--success)] bg-[rgba(34,197,94,0.1)] text-[var(--success)]',
              )}
            >
              {player.displayName}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[12px] text-[rgba(255,255,255,0.5)]">
        {resultLabel && (
          <span className="rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 font-medium text-[rgba(255,255,255,0.7)]">
            {resultLabel}
          </span>
        )}
        <span>
          {t('games.replay.header.moves', {
            count: replay.totalMoves,
          })}
        </span>
        <span>
          {t('games.replay.header.duration', {
            min: durationMinutes,
            sec: durationSeconds,
          })}
        </span>
      </div>
    </div>
  );
}
