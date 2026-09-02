'use client';

import { useEffect } from 'react';
import { useLiveStatsStore } from '../store/liveStatsStore';
import { useTranslation } from '@/shared/lib/useTranslation';

export function LivePulseBadge() {
  const { t } = useTranslation();
  const { stats, fetchLiveStats, togglePopover, isPopoverOpen } =
    useLiveStatsStore();

  useEffect(() => {
    void fetchLiveStats();
    const interval = setInterval(() => {
      void fetchLiveStats();
    }, 30_000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchLiveStats]);

  const formattedOnline = stats.onlineUsers.toLocaleString();

  return (
    <button
      type="button"
      onClick={togglePopover}
      aria-label={`${formattedOnline} ${t('home.liveBadgeOnline')}`}
      aria-expanded={isPopoverOpen}
      data-testid="header-live-pulse-badge"
      className="group relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-semibold text-[var(--color)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-emerald-500/70 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono font-bold tracking-tight text-[var(--color)]">
        {formattedOnline}
      </span>
      <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:inline">
        {t('home.liveBadgeOnline')}
      </span>
      {stats.activeGames > 0 && (
        <span className="hidden items-center gap-1 border-l border-emerald-500/30 pl-2 text-[11px] text-[var(--textSecondary)] md:inline-flex">
          <span className="text-[var(--color)] font-bold">
            {stats.activeGames}
          </span>
          <span>{t('home.liveBadgeActiveGames')}</span>
        </span>
      )}
    </button>
  );
}
