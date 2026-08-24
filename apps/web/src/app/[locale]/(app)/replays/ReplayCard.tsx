'use client';

import Link from 'next/link';
import { cx } from '@arcadeum/ui/utils/cx';
import type { ReplaySummary } from '@/features/replay/lib/types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface ReplayCardProps {
  replay: ReplaySummary;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const GAME_ICONS: Record<string, string> = {
  chess_v1: '♟️',
  checkers_v1: '🔴',
  tic_tac_toe_v1: '❌',
  backgammon_v1: '🎲',
  go_v1: '⚫',
  critical_v1: '💣',
  cascade_v1: '🃏',
  sea_battle_v1: '🚢',
  hearts_v1: '❤️',
  spades_v1: '♠️',
  texas_holdem_v1: '🂠',
  pachisi_v1: '🎯',
  cat_dash_v1: '🐱',
  glimworm_v1: '🪱',
};

export function ReplayCard({ replay, t }: ReplayCardProps) {
  const icon = GAME_ICONS[replay.gameId] ?? '🎮';
  const playerNames = replay.players.map((p) => p.displayName).join(' vs ');
  const durationMin = Math.floor(replay.durationMs / 60_000);
  const dateStr = new Date(replay.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const resultText = replay.result?.isDraw
    ? t('games.replay.card.draw')
    : replay.result?.winnerIds.length
      ? t('games.replay.card.won', {
          name:
            replay.players.find((p) => replay.result?.winnerIds.includes(p.id))
              ?.displayName ?? '',
        })
      : '';

  return (
    <Link
      href={`/replay/${replay.replayId}`}
      className={cx(
        'group flex flex-col gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] p-4',
        'bg-[rgba(255,255,255,0.02)] transition-all duration-200',
        'hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-[24px]">{icon}</span>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">
            {replay.gameId.replace(/_v\d+$/, '').replace(/_/g, ' ')}
          </span>
          <span className="text-[12px] text-[rgba(255,255,255,0.4)]">
            {dateStr}
          </span>
        </div>
      </div>

      <p className="truncate text-[13px] text-[rgba(255,255,255,0.6)]">
        {playerNames}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.4)]">
          <span>
            {t('games.replay.card.moves', {
              count: replay.totalMoves,
            })}
          </span>
          {durationMin > 0 && (
            <span>{t('games.replay.card.duration', { min: durationMin })}</span>
          )}
        </div>
        {resultText && (
          <span className="text-[11px] font-medium text-[var(--success)]">
            {resultText}
          </span>
        )}
      </div>

      <span className="text-[12px] font-semibold text-[var(--primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {t('games.replay.card.watch')} →
      </span>
    </Link>
  );
}
