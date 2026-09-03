'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';

interface Props {
  gameLabel: string;
  isNextInLine: boolean;
  playersAhead: number | null;
  elapsedTime: string;
  onExpand: () => void;
  onLeave: () => void;
}

export function MatchmakingFloatingBar({
  gameLabel,
  isNextInLine,
  playersAhead,
  elapsedTime,
  onExpand,
  onLeave,
}: Props) {
  const { t } = useTranslation();

  return (
    <div
      data-testid="matchmaking-floating-bar"
      className="fixed bottom-5 right-5 z-[1300] flex items-center gap-3 rounded-2xl border border-fuchsia-500/40 bg-[#18001e]/95 px-4 py-3 shadow-2xl backdrop-blur-xl text-white"
    >
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-fuchsia-500" />
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
          {gameLabel}
        </span>
        <span className="text-[11px] text-slate-300">
          {isNextInLine
            ? t('games.matchmaking.nextInLine')
            : t('games.matchmaking.playersAheadMultiple', {
                count: playersAhead ?? 0,
              })}
          {' • '}
          {elapsedTime}
        </span>
      </div>
      <button
        type="button"
        onClick={onExpand}
        data-testid="matchmaking-expand"
        className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/20"
      >
        {t('games.matchmaking.expand')}
      </button>
      <button
        type="button"
        onClick={onLeave}
        data-testid="matchmaking-floating-cancel"
        className="rounded-lg bg-red-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
      >
        ✕
      </button>
    </div>
  );
}
