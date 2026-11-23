'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLiveStatsStore } from '@/features/live-stats';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';

interface GameLandingLiveStatsProps {
  gameId?: string;
}

export function GameLandingLiveStats({ gameId }: GameLandingLiveStatsProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const { stats, fetchLiveStats } = useLiveStatsStore();

  useEffect(() => {
    void fetchLiveStats();
  }, [fetchLiveStats]);

  const currentUserId =
    snapshot.userId ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('arcadeum_anon_id')
      : null);

  const activeGameLobbies = stats.openRooms.filter(
    (r) =>
      (!gameId || r.gameId === gameId) &&
      r.status === 'lobby' &&
      !r.hasPassword &&
      r.visibility !== 'private',
  );

  const myLobbies = activeGameLobbies.filter(
    (r) => Boolean(currentUserId) && r.hostId === currentUserId,
  );
  const otherLobbies = activeGameLobbies.filter(
    (r) => !currentUserId || r.hostId !== currentUserId,
  );

  const otherCount = otherLobbies.length;
  const myCount = myLobbies.length;

  const queuedPlayersCount = gameId
    ? (stats.waitingQueues?.[gameId] ?? 0)
    : stats.waitingPlayers;

  const activeMatchesCount = gameId
    ? (stats.activeGamesByGame?.[gameId] ??
      stats.openRooms.filter(
        (r) => r.gameId === gameId && r.status === 'in_progress',
      ).length)
    : stats.activeGames;

  const roomsHref = gameId
    ? `${routes.rooms}?status=lobby&gameId=${gameId}`
    : `${routes.rooms}?status=lobby`;

  const inProgressHref = gameId
    ? `${routes.rooms}?status=in_progress&gameId=${gameId}`
    : `${routes.rooms}?status=in_progress`;

  let lobbyLabel = `${otherCount} ${t('home.liveWaitingRoomsSub')}`;
  if (myCount > 0 && otherCount > 0) {
    lobbyLabel = t('home.liveWaitingRoomsWithMine', {
      count: otherCount,
      mine: myCount,
    });
  } else if (myCount > 0 && otherCount === 0) {
    lobbyLabel = t('home.liveWaitingRoomsOnlyMine');
  }

  const playersLabel =
    gameId && queuedPlayersCount > 0
      ? t('home.liveWaitingPlayersForGame', { count: queuedPlayersCount })
      : `${stats.waitingPlayers} ${t('home.liveWaitingPlayersSub')}`;

  const pill =
    'flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium text-[var(--textPrimary)] transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]';

  return (
    <div
      data-testid="game-landing-live-stats"
      className="box-border flex flex-wrap items-center gap-2.5 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-3 text-xs backdrop-blur-md"
    >
      <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[var(--success)]">
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
        </span>
        <span>{t('home.liveBadgeOnline')}</span>
      </div>

      <div aria-hidden className="h-3.5 w-px bg-[var(--glassBorder)]" />

      <Link
        href={roomsHref}
        data-testid="landing-live-open-lobbies"
        className={`${pill} border-[var(--primary)]/30 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20`}
      >
        <span aria-hidden>🎮</span>
        <span>{lobbyLabel}</span>
      </Link>

      <Link
        href={routes.games}
        data-testid="landing-live-waiting-players"
        className={`${pill} border-[var(--info)]/30 bg-[var(--info)]/10 hover:bg-[var(--info)]/20`}
      >
        <span aria-hidden>👥</span>
        <span>{playersLabel}</span>
      </Link>

      <Link
        href={inProgressHref}
        data-testid="landing-live-active-matches"
        className={`${pill} border-[var(--success)]/30 bg-[var(--success)]/10 hover:bg-[var(--success)]/20`}
      >
        <span aria-hidden>⚔️</span>
        <span className="font-bold">{activeMatchesCount}</span>
        <span>{t('home.liveBadgeActiveGames')}</span>
      </Link>
    </div>
  );
}
