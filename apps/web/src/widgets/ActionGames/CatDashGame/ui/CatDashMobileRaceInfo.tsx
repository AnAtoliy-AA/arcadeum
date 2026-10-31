'use client';

import { memo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { CatDashClientState, CatDashPlayer } from '../types';
import { RealisticCat } from './RealisticCat';
import { CAT_PROFILES } from './catData';

interface CatDashMobileRaceInfoProps {
  snapshot: CatDashClientState;
  currentUserId?: string | null;
  currentPlayerId?: string;
  sortedPlayers: CatDashPlayer[];
  leader?: CatDashPlayer;
  recentLogs: CatDashClientState['logs'];
  maxPosition: number;
  resolveName: (id?: string | null) => string;
  onInspect: (catId: CatDashPlayer['catId']) => void;
}

export const CatDashMobileRaceInfo = memo(function CatDashMobileRaceInfo({
  snapshot,
  currentUserId,
  currentPlayerId,
  sortedPlayers,
  leader,
  recentLogs,
  maxPosition,
  resolveName,
  onInspect,
}: CatDashMobileRaceInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 items-start gap-2.5 md:grid-cols-3 lg:hidden">
      <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl backdrop-blur-xl md:col-span-2">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏎️</span>
            <span className="text-sm font-extrabold uppercase tracking-wide text-slate-200">
              {t('games.cat_dash_v1.dashboard.leaderboard' as TranslationKey)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onInspect(leader?.catId ?? 'neon')}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-900/40 px-2.5 py-1 text-xs font-bold text-purple-300 transition-all hover:bg-purple-900/60 hover:text-purple-100"
              data-testid="inspect-racers-btn"
            >
              <span>🔍</span>
              <span>
                {t(
                  'games.cat_dash_v1.dashboard.inspectRoster' as TranslationKey,
                )}
              </span>
            </button>
            <span className="text-xs font-semibold text-slate-400">
              {snapshot.players.length}{' '}
              {t(
                'games.cat_dash_v1.landing.highlights.players.title' as TranslationKey,
              )}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sortedPlayers.map((player, index) => {
            const isCurrentTurn = player.playerId === currentPlayerId;
            const isMe = player.playerId === currentUserId;
            const profile = CAT_PROFILES[player.catId];
            return (
              <button
                key={player.playerId}
                type="button"
                onClick={() => onInspect(player.catId)}
                className={`flex cursor-pointer flex-row items-center gap-2 rounded-2xl border p-2 text-left transition-all duration-200 ${isCurrentTurn ? 'border-purple-500/60 bg-purple-900/30 ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/20' : isMe ? 'border-cyan-400/50 bg-cyan-950/30 ring-1 ring-cyan-400/30 hover:bg-cyan-900/30' : 'border-white/10 bg-slate-950/40 hover:border-purple-400/40 hover:bg-slate-900/60'}`}
                data-testid={`player-card-${player.playerId}`}
              >
                <div className="relative shrink-0">
                  <RealisticCat
                    catId={player.catId}
                    size={44}
                    variant="card"
                    showGlow={isCurrentTurn}
                  />
                  <span
                    className={`absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${index === 0 ? 'border-amber-200 bg-amber-400 text-slate-950' : index === 1 ? 'border-white bg-slate-300 text-slate-950' : index === 2 ? 'border-amber-600 bg-amber-700 text-white' : 'border-slate-700 bg-slate-800 text-slate-300'}`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-extrabold text-slate-100">
                      {resolveName(player.playerId)}
                    </span>
                    {isMe && (
                      <span className="rounded-md border border-purple-400/40 bg-purple-500/30 px-1.5 text-[10px] font-bold text-purple-300">
                        {t('games.cat_dash_v1.gameOver.you' as TranslationKey)}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[11px] font-semibold text-slate-400">
                    {profile?.breedTitle ?? player.catId}
                  </span>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-slate-300">
                      📍 {player.position} / {maxPosition}
                    </span>
                    <span className="font-bold text-amber-400">
                      ⚡ {player.powerTokens}
                    </span>
                  </div>
                </div>
                {isCurrentTurn && (
                  <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/20 px-2 py-1 text-[10px] font-extrabold uppercase text-purple-300 animate-pulse">
                    {t(
                      'games.cat_dash_v1.dashboard.turnBadge' as TranslationKey,
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>⚡</span>
          <span>
            {t('games.cat_dash_v1.dashboard.recentEvents' as TranslationKey)}
          </span>
        </div>
        {recentLogs.length > 0 ? (
          <div className="flex max-h-24 flex-col gap-1.5 overflow-hidden">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 rounded-xl border border-white/5 bg-slate-950/50 px-2.5 py-1.5 text-xs text-slate-300"
              >
                <span className="mt-0.5 text-slate-500">🐾</span>
                <span className="break-words leading-snug">{log.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="py-2 text-xs italic text-slate-500">
            {t('games.cat_dash_v1.dashboard.raceInProgress' as TranslationKey)}
          </span>
        )}
      </div>
    </div>
  );
});
