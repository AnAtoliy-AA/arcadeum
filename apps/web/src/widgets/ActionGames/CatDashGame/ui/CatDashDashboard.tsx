'use client';

import { memo, useMemo, useEffect, useCallback, useId, useState } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { CatDashClientState, CatId } from '../types';
import { RealisticCat } from './RealisticCat';
import { CatDashMobileRaceInfo } from './CatDashMobileRaceInfo';
import { RacerBioModal } from './RacerBioModal';
import { CenterActionConsole } from './CenterActionConsole';

interface CatDashDashboardProps {
  snapshot: CatDashClientState;
  currentUserId?: string | null;
  myTurn: boolean;
  isGameOver: boolean;
  isRolling: boolean;
  onRollDice: () => void;
  onCatnap?: () => void;
  onPounce?: () => void;
  onDeployTrap?: () => void;
  onUseAbility?: (abilityId: string) => void;
  resolveName: (id?: string | null) => string;
  onInspectCat?: (catId: CatId) => void;
}

export const CatDashDashboard = memo(function CatDashDashboard({
  snapshot,
  currentUserId,
  myTurn,
  isGameOver,
  isRolling,
  onRollDice,
  onCatnap = () => {},
  onPounce = () => {},
  onDeployTrap = () => {},
  onUseAbility = () => {},
  resolveName,
  onInspectCat,
}: CatDashDashboardProps) {
  const { t } = useTranslation();
  const progressGradientId = `catdash-track-${useId().replace(/:/g, '')}`;
  const [inspectedCatId, setInspectedCatId] = useState<CatId | null>(null);

  const handleInspect = useCallback(
    (catId: CatId) => {
      if (onInspectCat) {
        onInspectCat(catId);
      } else {
        setInspectedCatId(catId);
      }
    },
    [onInspectCat],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        (e.code === 'Space' || e.key === ' ') &&
        myTurn &&
        !isGameOver &&
        !isRolling
      ) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        onRollDice();
      }
    },
    [myTurn, isGameOver, isRolling, onRollDice],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const maxPosition = Math.max(snapshot.trackLength - 1, 1);

  const sortedPlayers = useMemo(() => {
    return [...snapshot.players].sort((a, b) => b.position - a.position);
  }, [snapshot.players]);

  const myPlayer = useMemo(
    () => snapshot.players.find((p) => p.playerId === currentUserId),
    [snapshot.players, currentUserId],
  );

  const leader = sortedPlayers[0];
  const secondPlayer = sortedPlayers[1];
  const leadMargin =
    leader && secondPlayer ? leader.position - secondPlayer.position : 0;

  const racePercent = Math.round(
    ((myPlayer?.position ?? leader?.position ?? 0) / maxPosition) * 100,
  );
  const spacesToFinish = Math.max(maxPosition - (myPlayer?.position ?? 0), 0);

  const currentPlayer = snapshot.players[snapshot.currentPlayerIndex];

  const lastRollLog = useMemo(() => {
    const actionLogs = snapshot.logs.filter((l) => l.type === 'action');
    return actionLogs.length > 0 ? actionLogs[actionLogs.length - 1] : null;
  }, [snapshot.logs]);

  const recentLogs = useMemo(() => {
    return snapshot.logs.slice(-2).reverse();
  }, [snapshot.logs]);

  const lastRollValue = useMemo(() => {
    if (!lastRollLog) return null;
    const match = lastRollLog.message.match(/Rolled (\d+)/i);
    return match ? Number(match[1]) : null;
  }, [lastRollLog]);

  return (
    <div
      className="flex w-full max-w-4xl flex-col gap-3 px-0 lg:max-w-none lg:gap-2"
      data-testid="catdash-dashboard"
    >
      <div className="relative flex flex-col gap-2 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-3 shadow-2xl shadow-black/20 md:p-4 lg:gap-2 lg:p-3">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white shadow-lg shadow-fuchsia-500/25">
              <span className="text-xl" aria-hidden="true">
                ✦
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-300">
                {t('games.cat_dash_v1.name' as TranslationKey)}
              </span>
              <span className="text-base font-black tracking-tight text-white">
                {t(
                  'games.cat_dash_v1.dashboard.raceProgress' as TranslationKey,
                )}
              </span>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${
              myTurn
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-amber-400/25 bg-amber-400/10 text-amber-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                myTurn
                  ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]'
                  : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]'
              }`}
            />
            <span>
              {myTurn
                ? t(
                    'games.cat_dash_v1.dashboard.yourTurnToRoll' as TranslationKey,
                  )
                : currentPlayer
                  ? t(
                      'games.cat_dash_v1.dashboard.waitingForPlayer' as TranslationKey,
                      { name: resolveName(currentPlayer.playerId) },
                    )
                  : t(
                      'games.cat_dash_v1.dashboard.raceInProgress' as TranslationKey,
                    )}
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-2 lg:grid lg:grid-cols-[74px_minmax(0,1fr)] lg:items-center lg:gap-2">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {t(
                  'games.cat_dash_v1.dashboard.spaceProgress' as TranslationKey,
                  {
                    current: myPlayer?.position ?? 0,
                    total: maxPosition,
                  },
                )}
              </span>
              <span className="text-2xl font-black tracking-tight text-white tabular-nums lg:text-xl">
                {racePercent}%
              </span>
            </div>
            {leadMargin > 0 && leader && (
              <div className="flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-right">
                <span className="text-lg text-amber-300" aria-hidden="true">
                  ◆
                </span>
                <span className="text-xs font-extrabold text-amber-200">
                  {t('games.cat_dash_v1.dashboard.leadsBy' as TranslationKey, {
                    name: resolveName(leader.playerId),
                    count: leadMargin,
                  })}
                </span>
              </div>
            )}
          </div>

          <svg
            viewBox="0 0 1000 70"
            className="h-10 w-full overflow-visible rounded-2xl border border-white/5 bg-slate-950/70"
            role="img"
            aria-label={t(
              'games.cat_dash_v1.dashboard.raceProgress' as TranslationKey,
            )}
          >
            <title>
              {t('games.cat_dash_v1.dashboard.raceProgress' as TranslationKey)}
            </title>
            <defs>
              <linearGradient
                id={progressGradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <line
              x1="40"
              y1="35"
              x2="960"
              y2="35"
              stroke="#1e293b"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <line
              x1="40"
              y1="35"
              x2="960"
              y2="35"
              stroke={`url(#${progressGradientId})`}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.6"
            />

            {snapshot.players.map((player) => {
              const fraction = Math.min(
                Math.max(player.position / maxPosition, 0),
                1,
              );
              const x = 40 + fraction * (960 - 40);
              const isMe = player.playerId === currentUserId;
              const isLeader = player.playerId === leader?.playerId;

              return (
                <g
                  key={player.playerId}
                  transform={`translate(${x}, 35)`}
                  data-testid={`progress-cat-${player.catId}`}
                  className="cursor-pointer transition-transform duration-500 ease-out focus:outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={resolveName(player.playerId)}
                  onClick={() => handleInspect(player.catId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleInspect(player.catId);
                    }
                  }}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="18"
                    fill={isMe ? '#3b0764' : isLeader ? '#451a03' : '#0f172a'}
                    stroke={isMe ? '#c084fc' : isLeader ? '#fbbf24' : '#64748b'}
                    strokeWidth="2"
                  />
                  <g transform="translate(-14, -14)">
                    <RealisticCat catId={player.catId} size={28} />
                  </g>
                  <rect
                    x="-12"
                    y="18"
                    width="24"
                    height="14"
                    rx="4"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="28"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#e2e8f0"
                  >
                    {player.position}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="relative grid grid-cols-2 gap-2 md:grid-cols-4 lg:gap-1.5">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t('games.cat_dash_v1.dashboard.finishLine' as TranslationKey)}
            </span>
            <span className="text-sm font-black text-white tabular-nums">
              {maxPosition}
            </span>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t(
                'games.cat_dash_v1.dashboard.distanceToFinish' as TranslationKey,
                { count: spacesToFinish },
              )}
            </span>
            <span className="text-sm font-black text-cyan-300 tabular-nums">
              {spacesToFinish}
            </span>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t('games.cat_dash_v1.dashboard.powerTokens' as TranslationKey, {
                count: myPlayer?.powerTokens ?? 0,
              })}
            </span>
            <span className="text-sm font-black text-amber-300 tabular-nums">
              {myPlayer?.powerTokens ?? 0} / 3
            </span>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t('games.cat_dash_v1.dashboard.leaderboard' as TranslationKey)}
            </span>
            <span className="text-sm font-black text-fuchsia-300 tabular-nums">
              {sortedPlayers.findIndex((p) => p.playerId === currentUserId) +
                1 || '-'}
              /{snapshot.players.length}
            </span>
          </div>
        </div>
      </div>

      <div className="order-first lg:order-first">
        <CenterActionConsole
          myTurn={myTurn}
          isGameOver={isGameOver}
          isRolling={isRolling}
          onRollDice={onRollDice}
          onCatnap={onCatnap}
          onPounce={onPounce}
          onDeployTrap={onDeployTrap}
          onUseAbility={onUseAbility}
          myPlayer={myPlayer}
          currentPlayer={currentPlayer}
          resolveName={resolveName}
          lastRollValue={lastRollValue}
        />
      </div>

      <CatDashMobileRaceInfo
        snapshot={snapshot}
        currentUserId={currentUserId}
        currentPlayerId={currentPlayer?.playerId}
        sortedPlayers={sortedPlayers}
        leader={leader}
        recentLogs={recentLogs}
        maxPosition={maxPosition}
        resolveName={resolveName}
        onInspect={handleInspect}
      />

      {!onInspectCat && inspectedCatId && (
        <RacerBioModal
          open={Boolean(inspectedCatId)}
          onClose={() => setInspectedCatId(null)}
          initialCatId={inspectedCatId}
        />
      )}
    </div>
  );
});
