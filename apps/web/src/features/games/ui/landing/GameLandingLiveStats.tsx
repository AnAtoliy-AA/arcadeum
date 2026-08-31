'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLiveStatsStore } from '@/features/live-stats';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { getGamesSocket, connectSocketsAnonymous } from '@/shared/lib/socket';

interface GameLandingLiveStatsProps {
  gameId?: string;
}

export function GameLandingLiveStats({ gameId }: GameLandingLiveStatsProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const { stats, fetchLiveStats, setLiveStats } = useLiveStatsStore();
  const socketRef = useRef(false);

  useEffect(() => {
    const socket = getGamesSocket();
    if (!socket.connected) {
      const storedAnonId =
        typeof window !== 'undefined'
          ? localStorage.getItem('arcadeum_anon_id')
          : null;
      connectSocketsAnonymous(storedAnonId || undefined);
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

  const matchingOpenRooms = gameId
    ? stats.openRooms.filter((r) => r.gameId === gameId && r.status === 'lobby')
        .length
    : stats.waitingRooms;

  const displayOpenRooms = gameId ? matchingOpenRooms : stats.waitingRooms;
  const roomsHref = gameId
    ? `${routes.rooms}?status=lobby&gameId=${gameId}`
    : `${routes.rooms}?status=lobby`;

  return (
    <div
      data-testid="game-landing-live-stats"
      className="box-border flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs backdrop-blur-md"
    >
      <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>{t('home.liveBadgeOnline')}</span>
      </div>

      <div className="h-3.5 w-px bg-white/20" />

      <Link
        href={roomsHref}
        data-testid="landing-live-open-lobbies"
        className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
      >
        <span>🎮</span>
        <span className="font-bold text-white">{displayOpenRooms}</span>
        <span className="text-indigo-200">
          {t('home.liveWaitingRoomsSub')}
        </span>
      </Link>

      <Link
        href={routes.games}
        data-testid="landing-live-waiting-players"
        className="flex items-center gap-1.5 rounded-lg bg-fuchsia-500/10 px-2.5 py-1 font-medium text-fuchsia-300 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-colors"
      >
        <span>👥</span>
        <span className="font-bold text-white">{stats.waitingPlayers}</span>
        <span className="text-fuchsia-200">
          {t('home.liveWaitingPlayersSub')}
        </span>
      </Link>

      <div className="flex items-center gap-1.5 text-slate-400 pl-1">
        <span>⚔️</span>
        <span className="font-semibold text-slate-300">
          {stats.activeGames}
        </span>
        <span>{t('home.liveBadgeActiveGames')}</span>
      </div>
    </div>
  );
}
