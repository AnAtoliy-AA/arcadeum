'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLiveStatsStore, type LiveRoomItem } from '../store/liveStatsStore';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';

interface LiveActivityPopoverProps {
  onClose?: () => void;
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

  return (
    <div
      ref={popoverRef}
      data-testid="live-activity-popover"
      className="absolute right-0 top-12 z-50 w-[92vw] max-w-[420px] rounded-2xl border border-white/15 bg-neutral-950/90 p-4 text-white shadow-2xl backdrop-blur-xl animate-[fadeInUp_0.2s_ease-out]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <h3 className="text-sm font-bold tracking-tight text-white">
            {t('home.liveTitle')}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
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

      <div className="my-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="font-mono text-base font-extrabold text-emerald-400">
            {stats.onlineUsers}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            {t('home.liveBadgeOnline')}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="font-mono text-base font-extrabold text-amber-400">
            {stats.activeGames}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            {t('home.liveBadgeActiveGames')}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="font-mono text-base font-extrabold text-cyan-400">
            {stats.matchesToday}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            {t('home.liveBadgeMatchesToday')}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            {t('home.liveOpenLobbiesTitle')}
          </span>
          <Link
            href={`${routes.rooms}?status=lobby`}
            onClick={handleClose}
            className="text-[11px] font-semibold text-emerald-400 hover:underline"
          >
            {t('home.liveViewAllRooms')} →
          </Link>
        </div>

        {stats.openRooms.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {stats.openRooms.map((room: LiveRoomItem) => (
              <div
                key={room.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-white truncate max-w-[170px]">
                    {room.name}
                  </span>
                  <span className="text-[11px] text-white/50">
                    {room.hostName} · {room.currentPlayers}/{room.maxPlayers}
                  </span>
                </div>
                <Link
                  href={`${routes.rooms}/${room.id}`}
                  onClick={handleClose}
                  className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/40 hover:text-white"
                >
                  {room.status === 'in_progress'
                    ? t('home.liveSpectateAction')
                    : t('home.liveJoinAction')}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-center text-xs text-white/60">
            {t('home.liveNoOpenRooms')}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/80">
          {t('home.livePopularGamesTitle')}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(stats.popularGames.length > 0
            ? stats.popularGames.slice(0, 4)
            : [
                { gameId: 'sea_battle_v1', activePlayers: 0, matchesCount: 0 },
                { gameId: 'chess_v1', activePlayers: 0, matchesCount: 0 },
                { gameId: 'cascade_v1', activePlayers: 0, matchesCount: 0 },
                { gameId: 'hearts_v1', activePlayers: 0, matchesCount: 0 },
              ]
          ).map((game) => {
            const cleanName = game.gameId.replace('_v1', '').replace('_', ' ');
            return (
              <Link
                key={game.gameId}
                href={routes.games}
                onClick={handleClose}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs transition-colors hover:border-emerald-400/40 hover:bg-white/10"
              >
                <span className="font-semibold capitalize text-white group-hover:text-emerald-400">
                  {cleanName}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-mono">
                  {game.activePlayers > 0
                    ? `${game.activePlayers} 🟢`
                    : 'Play →'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
