'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { useLiveStatsStore } from '@/features/live-stats';
import { getGamesSocket } from '@/shared/lib/socket';

export function HomeLivePulse() {
  const { t } = useTranslation();
  const routes = useRoutes();
  const { stats, fetchLiveStats, setLiveStats } = useLiveStatsStore();
  const socketRef = useRef(false);

  useEffect(() => {
    const socket = getGamesSocket();
    if (!socket.connected) {
      socket.connect();
    }
    void fetchLiveStats();

    if (!socketRef.current) {
      socketRef.current = true;
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
        socketRef.current = false;
      };
    }
  }, [fetchLiveStats, setLiveStats]);

  return (
    <section
      data-testid="home-live-pulse-section"
      aria-labelledby="live-pulse-heading"
      className="relative z-[2] mx-auto my-8 w-full max-w-[1400px] px-4"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl md:p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="relative z-[1] mb-6 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>{t('home.liveBadgeOnline')}</span>
            </div>
            <h2
              id="live-pulse-heading"
              className="text-xl font-extrabold tracking-tight text-white md:text-3xl"
            >
              {t('home.liveTitle')}
            </h2>
            <p className="mt-0.5 text-xs text-white/60 md:text-sm">
              {t('home.liveSubtitle')}
            </p>
          </div>

          <Link
            href={routes.rooms}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/40 hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t('home.liveViewAllRooms')}</span>
            <span className="text-emerald-400">→</span>
          </Link>
        </div>

        <div className="relative z-[1] grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-black/30 p-4 transition-all hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                {t('home.liveBadgeOnline')}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                👥
              </span>
            </div>
            <div
              data-testid="live-online-counter"
              className="mt-3 font-mono text-2xl font-black text-white md:text-3xl"
            >
              {stats.onlineUsers.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] font-medium text-emerald-300/60">
              Active players now
            </div>
          </div>

          <Link
            href={`${routes.rooms}?status=in_progress`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-black/30 p-4 transition-all hover:border-amber-500/40 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                {t('home.liveBadgeActiveGames')}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs">
                ⚔️
              </span>
            </div>
            <div
              data-testid="live-active-games-counter"
              className="mt-3 font-mono text-2xl font-black text-white md:text-3xl"
            >
              {stats.activeGames}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-amber-300/60">
              <span>Matches ongoing</span>
              <span className="text-amber-400 font-bold transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>

          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 to-black/30 p-4 transition-all hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {t('home.liveBadgeMatchesToday')}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 text-xs">
                🏆
              </span>
            </div>
            <div
              data-testid="live-matches-today-counter"
              className="mt-3 font-mono text-2xl font-black text-white md:text-3xl"
            >
              {stats.matchesToday.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] font-medium text-cyan-300/60">
              Completed today
            </div>
          </div>

          <Link
            href={`${routes.rooms}?status=lobby`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-black/30 p-4 transition-all hover:border-indigo-500/40 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                {t('home.liveBadgeWaitingRooms')}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs">
                🎮
              </span>
            </div>
            <div
              data-testid="live-waiting-rooms-counter"
              className="mt-3 font-mono text-2xl font-black text-white md:text-3xl"
            >
              {stats.waitingRooms}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-indigo-300/60">
              <span>Joinable lobbies</span>
              <span className="text-indigo-400 font-bold transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
