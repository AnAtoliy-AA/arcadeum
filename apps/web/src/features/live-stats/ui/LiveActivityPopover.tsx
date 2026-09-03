'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLiveStatsStore, type LiveRoomItem } from '../store/liveStatsStore';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';

interface LiveActivityPopoverProps {
  onClose?: () => void;
}

function getGameLandingUrl(
  gameId: string,
  routes: ReturnType<typeof useRoutes>,
): string {
  const slug = gameId.replace(/_v\d+$/, '').replace(/_/g, '-');
  return routes.gameDetail(slug);
}

export function LiveActivityPopover({ onClose }: LiveActivityPopoverProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const { stats, isPopoverOpen, setPopoverOpen } = useLiveStatsStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setPopoverOpen(false);
        onClose?.();
      }
    }
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen, setPopoverOpen, onClose]);

  if (!isPopoverOpen) {
    return null;
  }

  const handleClose = () => {
    setPopoverOpen(false);
    onClose?.();
  };

  const trendingGamesList = (
    stats.popularGames.length > 0
      ? [...stats.popularGames].sort((a, b) => b.matchesCount - a.matchesCount)
      : [
          { gameId: 'sea_battle_v1', activePlayers: 0, matchesCount: 0 },
          { gameId: 'chess_v1', activePlayers: 0, matchesCount: 0 },
          { gameId: 'cascade_v1', activePlayers: 0, matchesCount: 0 },
          { gameId: 'hearts_v1', activePlayers: 0, matchesCount: 0 },
        ]
  ).slice(0, 4);

  return (
    <div
      ref={popoverRef}
      data-testid="live-activity-popover"
      className="absolute right-0 top-12 z-50 w-[94vw] max-w-[440px] rounded-2xl border border-[var(--glassBorderStrong)] bg-[var(--background)] p-4 text-[var(--color)] shadow-2xl backdrop-blur-xl animate-[fadeInUp_0.2s_ease-out]"
    >
      <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <h3 className="text-sm font-bold tracking-tight text-[var(--color)]">
            {t('home.liveTitle')}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="rounded-full p-1 text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--color)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="my-3 grid grid-cols-5 gap-1.5 text-center">
        <div className="rounded-xl border border-emerald-500/30 bg-[var(--backgroundHover)] p-2">
          <div className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.onlineUsers}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('home.liveBadgeOnline')}
          </div>
        </div>

        <Link
          href={`${routes.rooms}?status=in_progress`}
          onClick={handleClose}
          className="rounded-xl border border-amber-500/30 bg-[var(--backgroundHover)] p-2 transition-all hover:border-amber-500/50 hover:bg-amber-500/10"
        >
          <div className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400">
            {stats.activeGames}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('home.liveBadgeActiveGames')}
          </div>
        </Link>

        <Link
          href={`${routes.rooms}?status=lobby`}
          onClick={handleClose}
          className="rounded-xl border border-indigo-500/30 bg-[var(--backgroundHover)] p-2 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10"
        >
          <div className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
            {stats.waitingRooms}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('home.liveBadgeWaitingRooms')}
          </div>
        </Link>

        <Link
          href={routes.games}
          onClick={handleClose}
          className="rounded-xl border border-fuchsia-500/30 bg-[var(--backgroundHover)] p-2 transition-all hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10"
        >
          <div className="font-mono text-sm font-extrabold text-fuchsia-600 dark:text-fuchsia-400">
            {stats.waitingPlayers}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('home.liveBadgeWaitingPlayers')}
          </div>
        </Link>

        <Link
          href={`${routes.rooms}?status=completed`}
          onClick={handleClose}
          className="rounded-xl border border-cyan-500/30 bg-[var(--backgroundHover)] p-2 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10"
        >
          <div className="font-mono text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
            {stats.matchesToday}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('home.liveBadgeMatchesToday')}
          </div>
        </Link>
      </div>

      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('home.liveOpenLobbiesTitle')}
          </span>
          <Link
            href={routes.rooms}
            onClick={handleClose}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('home.liveViewAllRooms')} →
          </Link>
        </div>

        {stats.openRooms.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {stats.openRooms.map((room: LiveRoomItem) => (
              <div
                key={room.id}
                className="flex items-center justify-between rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-3 py-2 text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-[var(--color)] truncate max-w-[170px]">
                    {room.name}
                  </span>
                  <span className="text-[11px] text-[var(--textSecondary)]">
                    {room.hostName} · {room.currentPlayers}/{room.maxPlayers}
                  </span>
                </div>
                <Link
                  href={`${routes.rooms}/${room.id}`}
                  onClick={handleClose}
                  className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300 transition-colors hover:bg-emerald-500/40 hover:text-[var(--color)]"
                >
                  {room.status === 'in_progress'
                    ? t('home.liveSpectateAction')
                    : t('home.liveJoinAction')}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3 text-center text-xs text-[var(--textSecondary)]">
            {t('home.liveNoOpenRooms')}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--textSecondary)]">
          {t('home.livePopularGamesTitle')}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {trendingGamesList.map((game) => {
            const cleanName = game.gameId.replace('_v1', '').replace('_', ' ');
            const landingUrl = getGameLandingUrl(game.gameId, routes);
            const weekMatches =
              typeof game.matchesWeekCount === 'number'
                ? game.matchesWeekCount
                : game.matchesCount;
            return (
              <Link
                key={game.gameId}
                href={landingUrl}
                onClick={handleClose}
                className="group flex flex-col justify-between rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-2.5 text-xs transition-all hover:border-emerald-500/50 hover:bg-[var(--glassBgHover)] hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize text-[var(--color)] group-hover:text-emerald-500">
                    {cleanName}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold opacity-70 group-hover:opacity-100">
                    →
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--textSecondary)]">
                  <span>
                    {game.matchesCount} today · {weekMatches} this week
                  </span>
                  {game.activePlayers > 0 && (
                    <span className="font-mono text-emerald-500 font-semibold">
                      {game.activePlayers} 🟢
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
