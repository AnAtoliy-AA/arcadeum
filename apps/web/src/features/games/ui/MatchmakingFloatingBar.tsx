'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface Props {
  gameLabel: string;
  elapsedTime: string;
  onExpand: () => void;
  onLeave: () => void;
}

export function MatchmakingFloatingBar({
  gameLabel,
  elapsedTime,
  onExpand,
  onLeave,
}: Props) {
  const { t } = useTranslation();

  return (
    <div
      data-testid="matchmaking-floating-bar"
      className="fixed bottom-5 right-5 z-[1300] flex items-center gap-3 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] px-4 py-3 shadow-2xl"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold capitalize text-[var(--foreground)]">
          {gameLabel}
        </span>
        <span className="text-[11px] text-[var(--textSecondary)]">
          {elapsedTime}
        </span>
      </div>
      <button
        type="button"
        onClick={onExpand}
        data-testid="matchmaking-expand"
        className="rounded-lg bg-[var(--backgroundHover)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--borderColor)]"
      >
        {t('games.matchmaking.expand')}
      </button>
      <button
        type="button"
        onClick={onLeave}
        data-testid="matchmaking-floating-cancel"
        className="rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
      >
        ✕
      </button>
    </div>
  );
}
