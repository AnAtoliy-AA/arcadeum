'use client';

import { memo, useMemo, useEffect, useCallback } from 'react';
import { DiceRollOverlay } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { CatDashClientState, CatDashPlayer } from '../types';
import { RealisticCat } from './RealisticCat';
import { CAT_PROFILES } from './catData';

interface CatDashDashboardProps {
  snapshot: CatDashClientState;
  currentUserId?: string | null;
  myTurn: boolean;
  isGameOver: boolean;
  isRolling: boolean;
  onRollDice: () => void;
  resolveName: (id?: string | null) => string;
}

export const CatDashDashboard = memo(function CatDashDashboard({
  snapshot,
  currentUserId,
  myTurn,
  isGameOver,
  isRolling,
  onRollDice,
  resolveName,
}: CatDashDashboardProps) {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' && myTurn && !isGameOver && !isRolling) {
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

  const leader = sortedPlayers[0];
  const secondPlayer = sortedPlayers[1];
  const leadMargin =
    leader && secondPlayer ? leader.position - secondPlayer.position : 0;

  const currentPlayer = snapshot.players[snapshot.currentPlayerIndex];

  const lastRollLog = useMemo(() => {
    const actionLogs = snapshot.logs.filter((l) => l.type === 'action');
    return actionLogs.length > 0 ? actionLogs[actionLogs.length - 1] : null;
  }, [snapshot.logs]);

  const recentLogs = useMemo(() => {
    return snapshot.logs.slice(-3).reverse();
  }, [snapshot.logs]);

  const lastRollValue = useMemo(() => {
    if (!lastRollLog) return null;
    const match = lastRollLog.message.match(/Rolled (\d+)/i);
    return match ? Number(match[1]) : null;
  }, [lastRollLog]);

  return (
    <div
      className="flex flex-col gap-4 w-full max-w-4xl mx-auto px-2"
      data-testid="catdash-dashboard"
    >
      <div className="flex flex-col gap-2.5 p-4 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-xl">
        <div className="flex flex-row items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🚩</span>
            <span>{t('games.cat_dash_v1.dashboard.raceProgress')}</span>
          </div>
          {leadMargin > 0 && leader && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-extrabold normal-case">
              <span>👑</span>
              <span>
                {t('games.cat_dash_v1.dashboard.leadsBy', {
                  name: resolveName(leader.playerId),
                  count: leadMargin,
                })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{t('games.cat_dash_v1.dashboard.finishLine')}</span>
            <span className="text-base">🏁</span>
          </div>
        </div>

        <svg
          viewBox="0 0 1000 70"
          className="w-full h-14 rounded-2xl bg-slate-950/60 border border-white/5 overflow-visible"
        >
          <defs>
            <linearGradient
              id="track-grad-dash"
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
            stroke="url(#track-grad-dash)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.6"
          />

          {snapshot.players.map((player) => {
            const pct = Math.min(1, Math.max(0, player.position / maxPosition));
            const x = 40 + pct * 920;
            const isMe = player.playerId === currentUserId;
            const isLeader = leader?.playerId === player.playerId;

            return (
              <g
                key={player.playerId}
                transform={`translate(${x}, 35)`}
                data-testid={`progress-cat-${player.catId}`}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <DiceRollOverlay
            canRoll={myTurn && !isGameOver}
            isRolling={isRolling}
            onRoll={onRollDice}
            rollLabel={t('games.cat_dash_v1.dashboard.rollNow')}
            subtitle={
              myTurn && !isGameOver
                ? t('games.cat_dash_v1.dashboard.yourTurnToRoll')
                : currentPlayer
                  ? t('games.cat_dash_v1.dashboard.waitingForPlayer', {
                      name: resolveName(currentPlayer.playerId),
                    })
                  : undefined
            }
            values={lastRollValue ? [lastRollValue] : undefined}
            lastValues={lastRollValue ? [lastRollValue] : undefined}
            resultLabel={
              lastRollValue
                ? t('games.cat_dash_v1.dashboard.rolledMoved', {
                    roll: lastRollValue,
                    move: lastRollValue,
                  })
                : undefined
            }
            size="xl"
            variant="classic"
            className="w-full h-full min-h-[200px]"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2.5 p-4 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏎️</span>
              <span className="text-sm font-extrabold tracking-wide uppercase text-slate-200">
                {t('games.cat_dash_v1.dashboard.leaderboard')}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {snapshot.players.length}{' '}
              {t('games.cat_dash_v1.landing.highlights.players.title')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sortedPlayers.map((player: CatDashPlayer, index: number) => {
              const isCurrentTurn = player.playerId === currentPlayer?.playerId;
              const isMe = player.playerId === currentUserId;
              const profile = CAT_PROFILES[player.catId];

              return (
                <div
                  key={player.playerId}
                  className={`flex flex-row items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                    isCurrentTurn
                      ? 'bg-purple-900/30 border-purple-500/60 ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                  }`}
                  data-testid={`player-card-${player.playerId}`}
                >
                  <div className="relative flex-shrink-0">
                    <RealisticCat
                      catId={player.catId}
                      size={44}
                      showGlow={isCurrentTurn}
                    />
                    <span
                      className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950 border-amber-200'
                          : index === 1
                            ? 'bg-slate-300 text-slate-950 border-white'
                            : index === 2
                              ? 'bg-amber-700 text-white border-amber-600'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-100 truncate">
                        {resolveName(player.playerId)}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded-md bg-purple-500/30 text-purple-300 border border-purple-400/40 text-[10px] font-bold">
                          {t('games.cat_dash_v1.gameOver.you')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 truncate">
                      {profile?.breedTitle ?? player.catId}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="font-bold text-slate-300">
                        📍 {player.position} / {maxPosition}
                      </span>
                      <span className="font-bold text-amber-400">
                        ⚡ {player.powerTokens}
                      </span>
                    </div>
                  </div>

                  {isCurrentTurn && (
                    <div className="flex flex-col items-center justify-center flex-shrink-0 px-2 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-extrabold uppercase animate-pulse">
                      Turn
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {recentLogs.length > 0 && (
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-950/40 border border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>⚡</span>
            <span>{t('games.cat_dash_v1.dashboard.recentEvents')}</span>
          </div>
          <div className="flex flex-col gap-1">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-2 text-xs text-slate-300 px-2 py-1 rounded-lg bg-slate-900/50"
              >
                <span className="text-slate-500">🐾</span>
                <span className="truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
