'use client';

import { useEffect, useRef } from 'react';
import { useLiveStatsStore } from '../store/liveStatsStore';
import { getGamesSocket } from '@/shared/lib/socket';
import { useTranslation } from '@/shared/lib/useTranslation';

export function LivePulseBadge() {
  const { t } = useTranslation();
  const { stats, fetchLiveStats, togglePopover, isPopoverOpen, setLiveStats } =
    useLiveStatsStore();
  const socketConnectedRef = useRef(false);

  useEffect(() => {
    const socket = getGamesSocket();
    if (!socket.connected) {
      socket.connect();
    }
    void fetchLiveStats();

    if (!socketConnectedRef.current) {
      socketConnectedRef.current = true;
      const handleLiveStats = (data: Partial<typeof stats>) => {
        setLiveStats(data);
      };
      const handleConnect = () => {
        void fetchLiveStats(true);
      };
      socket.on('connect', handleConnect);
      socket.on('games.live_stats', handleLiveStats);
      socket.on('games.room.created', () => {
        void fetchLiveStats();
      });
      socket.on('games.room.deleted', () => {
        void fetchLiveStats();
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('games.live_stats', handleLiveStats);
        socketConnectedRef.current = false;
      };
    }
  }, [fetchLiveStats, setLiveStats]);

  const formattedOnline = stats.onlineUsers.toLocaleString();

  return (
    <button
      type="button"
      onClick={togglePopover}
      aria-label={`${formattedOnline} ${t('home.liveBadgeOnline')}`}
      aria-expanded={isPopoverOpen}
      data-testid="header-live-pulse-badge"
      className="group relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 text-xs font-semibold text-emerald-400 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-emerald-400/60 hover:bg-emerald-900/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono font-bold tracking-tight text-white">
        {formattedOnline}
      </span>
      <span className="hidden text-[11px] font-medium uppercase tracking-wider text-emerald-400/90 sm:inline">
        {t('home.liveBadgeOnline')}
      </span>
      {stats.activeGames > 0 && (
        <span className="hidden items-center gap-1 border-l border-emerald-500/20 pl-2 text-[11px] text-emerald-300/80 md:inline-flex">
          <span className="text-white font-bold">{stats.activeGames}</span>
          <span>{t('home.liveBadgeActiveGames')}</span>
        </span>
      )}
    </button>
  );
}
