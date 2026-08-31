'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/shared/ui/CSSSpinner';
import { gameSocket, emitEncrypted, useSocket } from '@/shared/lib/socket';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getOrCreateAnonymousId } from '@/shared/lib/api-client';
import { useRoutes } from '@/shared/config/useRoutes';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  trackSocialMatchmakingJoined,
  trackSocialMatchmakingMatched,
  trackSocialQuickplayStarted,
} from '@/shared/analytics/funnel';
import { gamesApi } from '@/features/games/api';
import { create } from 'zustand';
import { MatchmakingFloatingBar } from './MatchmakingFloatingBar';

export interface MatchmakingStatus {
  gameId: string;
  variant?: string;
  ranked?: boolean;
  queueSize: number;
  position: number;
  playersAhead: number;
  estimatedWaitSeconds: number;
  activeQueues?: Record<string, number>;
}

interface MatchmakingState {
  isQueued: boolean;
  isMinimized: boolean;
  gameId: string | null;
  variant: string | null;
  ranked: boolean | null;
  startTime: number | null;
  queueSize: number | null;
  position: number | null;
  playersAhead: number | null;
  estimatedWaitSeconds: number | null;
  activeQueues: Record<string, number>;
  startQueue: (gameId: string, variant?: string, ranked?: boolean) => void;
  stopQueue: () => void;
  setMinimized: (minimized: boolean) => void;
  setQueued: (
    queued: boolean,
    gameId?: string | null,
    variant?: string | null,
    ranked?: boolean | null,
  ) => void;
  setStatus: (status: MatchmakingStatus) => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set, get) => ({
  isQueued: false,
  isMinimized: false,
  gameId: null,
  variant: null,
  ranked: null,
  startTime: null,
  queueSize: null,
  position: null,
  playersAhead: null,
  estimatedWaitSeconds: null,
  activeQueues: {},
  startQueue: (gameId, variant, ranked) => {
    set({
      isQueued: true,
      isMinimized: false,
      gameId,
      variant: variant ?? null,
      ranked: ranked ?? null,
      startTime: Date.now(),
      queueSize: 1,
      position: 1,
      playersAhead: 0,
      estimatedWaitSeconds: null,
      activeQueues: {},
    });
  },
  stopQueue: () => {
    const { isQueued } = get();
    if (isQueued) {
      set({
        isQueued: false,
        isMinimized: false,
        gameId: null,
        variant: null,
        ranked: null,
        startTime: null,
        queueSize: null,
        position: null,
        playersAhead: null,
        estimatedWaitSeconds: null,
        activeQueues: {},
      });
    }
  },
  setMinimized: (minimized) => {
    set({ isMinimized: minimized });
  },
  setQueued: (queued, gameId = null, variant = null, ranked = null) => {
    set({
      isQueued: queued,
      isMinimized: false,
      gameId,
      variant,
      ranked,
      startTime: queued ? Date.now() : null,
      queueSize: queued ? 1 : null,
      position: queued ? 1 : null,
      playersAhead: queued ? 0 : null,
      estimatedWaitSeconds: null,
      activeQueues: {},
    });
  },
  setStatus: (status) => {
    const position = status.position;
    const playersAhead =
      typeof status.playersAhead === 'number'
        ? status.playersAhead
        : Math.max(0, position - 1);
    set({
      queueSize: status.queueSize,
      position,
      playersAhead,
      estimatedWaitSeconds: status.estimatedWaitSeconds,
      activeQueues: status.activeQueues ?? {},
    });
  },
}));

export function useMatchmaking() {
  const { snapshot } = useSessionTokens();
  const router = useRouter();
  const routes = useRoutes();

  const isQueued = useMatchmakingStore((s) => s.isQueued);
  const isMinimized = useMatchmakingStore((s) => s.isMinimized);
  const gameId = useMatchmakingStore((s) => s.gameId);
  const variant = useMatchmakingStore((s) => s.variant);
  const ranked = useMatchmakingStore((s) => s.ranked);
  const startTime = useMatchmakingStore((s) => s.startTime);
  const queueSize = useMatchmakingStore((s) => s.queueSize);
  const position = useMatchmakingStore((s) => s.position);
  const playersAhead = useMatchmakingStore((s) => s.playersAhead);
  const estimatedWaitSeconds = useMatchmakingStore(
    (s) => s.estimatedWaitSeconds,
  );
  const activeQueues = useMatchmakingStore((s) => s.activeQueues);
  const startQueue = useMatchmakingStore((s) => s.startQueue);
  const stopQueue = useMatchmakingStore((s) => s.stopQueue);
  const setMinimized = useMatchmakingStore((s) => s.setMinimized);

  const joinQueue = useCallback(
    async (
      targetGameId: string,
      targetVariant?: string,
      isRanked?: boolean,
    ) => {
      let userId = snapshot.userId;
      if (!userId) {
        userId = await getOrCreateAnonymousId();
      }
      if (!userId) return;

      startQueue(targetGameId, targetVariant, isRanked);
      trackSocialMatchmakingJoined(targetGameId);
      void emitEncrypted(gameSocket, 'games.matchmaking.join', {
        userId,
        gameId: targetGameId,
        variant: targetVariant,
        ranked: isRanked,
      });
    },
    [snapshot.userId, startQueue],
  );

  const leaveQueue = useCallback(async () => {
    let userId = snapshot.userId;
    if (!userId) {
      userId = localStorage.getItem('arcadeum_anon_id');
    }
    if (!userId) return;
    stopQueue();
    void emitEncrypted(gameSocket, 'games.matchmaking.leave', { userId });
  }, [snapshot.userId, stopQueue]);

  const playVsAiNow = useCallback(async () => {
    const currentGameId = useMatchmakingStore.getState().gameId;
    const currentVariant = useMatchmakingStore.getState().variant;
    if (!currentGameId) return;

    await leaveQueue();

    try {
      const { room } = await gamesApi.quickplay(
        currentGameId,
        { variant: currentVariant || undefined },
        { token: snapshot.accessToken || undefined },
      );
      trackSocialQuickplayStarted(currentGameId, 'ai');
      router.push(routes.gameRoom(room.id));
    } catch {
      router.push(routes.gameDetail(currentGameId));
    }
  }, [leaveQueue, router, routes, snapshot.accessToken]);

  const switchGame = useCallback(
    async (nextGameId: string) => {
      await leaveQueue();
      await joinQueue(nextGameId);
    },
    [joinQueue, leaveQueue],
  );

  return {
    isQueued,
    isMinimized,
    gameId,
    variant,
    ranked,
    startTime,
    queueSize,
    position,
    playersAhead,
    estimatedWaitSeconds,
    activeQueues,
    joinQueue,
    leaveQueue,
    setMinimized,
    playVsAiNow,
    switchGame,
  };
}

export function MatchmakingQueueModal() {
  const router = useRouter();
  const routes = useRoutes();
  const { t } = useTranslation();
  const {
    isQueued,
    isMinimized,
    gameId,
    variant,
    ranked,
    leaveQueue,
    joinQueue,
    setMinimized,
    playVsAiNow,
    switchGame,
    startTime,
    queueSize,
    position,
    playersAhead,
    estimatedWaitSeconds,
    activeQueues,
  } = useMatchmaking();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & {
      __joinMatchmaking?: (g: string) => Promise<void>;
    };
    w.__joinMatchmaking = joinQueue;
    return () => {
      delete w.__joinMatchmaking;
    };
  }, [joinQueue]);

  useEffect(() => {
    if (!isQueued || !startTime) {
      return;
    }
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isQueued, startTime]);

  const elapsed = startTime ? Math.floor((now - startTime) / 1000) : 0;

  useSocket('games.matchmaking.success', (data: unknown) => {
    const payload = data as { roomId?: string };
    if (payload?.roomId) {
      const queuedGameId = useMatchmakingStore.getState().gameId;
      if (queuedGameId) {
        trackSocialMatchmakingMatched(queuedGameId, payload.roomId);
      }
      useMatchmakingStore.getState().stopQueue();
      router.push(routes.gameRoom(payload.roomId));
    }
  });

  useSocket('games.matchmaking.status', (data: unknown) => {
    const payload = data as MatchmakingStatus;
    if (payload && typeof payload.queueSize === 'number') {
      useMatchmakingStore.getState().setStatus(payload);
    }
  });

  const leaveQueueRef = React.useRef(leaveQueue);
  useEffect(() => {
    leaveQueueRef.current = leaveQueue;
  }, [leaveQueue]);

  useEffect(() => {
    return () => {
      if (useMatchmakingStore.getState().isQueued) {
        leaveQueueRef.current();
      }
    };
  }, []);

  if (!isQueued) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const gameLabel = gameId
    ? gameId.replace('_v1', '').replace(/_/g, ' ').toUpperCase()
    : 'GAME';

  const otherActiveQueues = Object.entries(activeQueues).filter(
    ([qGameId, count]) => qGameId !== gameId && count > 0,
  );

  const isNextInLine = playersAhead === 0 || position === 1;

  if (isMinimized) {
    return createPortal(
      <MatchmakingFloatingBar
        gameLabel={gameLabel}
        isNextInLine={isNextInLine}
        playersAhead={playersAhead}
        elapsedTime={formatTime(elapsed)}
        onExpand={() => setMinimized(false)}
        onLeave={leaveQueue}
      />,
      document.body,
    );
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1299] bg-black/80 backdrop-blur-sm" />
      <div
        data-testid="matchmaking-modal"
        className="fixed left-1/2 top-1/2 z-[1300] w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-fuchsia-500/40 bg-[#18001e]/95 p-6 shadow-2xl backdrop-blur-xl text-slate-100"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-fuchsia-500/20 px-2 py-0.5 text-xs font-bold uppercase text-fuchsia-300 border border-fuchsia-500/30">
              {ranked
                ? t('games.matchmaking.modeRanked')
                : t('games.matchmaking.modeCasual')}
            </span>
            {variant && (
              <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                {variant}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            data-testid="matchmaking-minimize"
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors text-xs font-medium px-2"
          >
            {t('games.matchmaking.minimize')}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full border border-fuchsia-500/30 animate-ping opacity-60" />
            <div className="absolute h-16 w-16 rounded-full border border-cyan-400/40 animate-pulse" />
            <Spinner size="large" color="#d946ef" />
          </div>

          <div className="text-center">
            <h3 className="m-0 text-xl font-bold text-slate-100">
              {t('games.matchmaking.searchingTitle')}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {t('games.matchmaking.searchingSubtitle', { game: gameLabel })}
            </p>
          </div>

          <p
            data-testid="matchmaking-timer"
            className="m-0 text-center text-3xl font-mono font-extrabold text-cyan-400 tracking-wider"
          >
            {formatTime(elapsed)}
          </p>

          <div className="w-full rounded-2xl bg-white/[0.04] p-3.5 border border-white/10 flex flex-col gap-2">
            <div
              data-testid="matchmaking-players-ahead"
              className={`flex items-center justify-center gap-2 rounded-xl p-2 text-center text-xs font-bold ${
                isNextInLine
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
              }`}
            >
              <span>{isNextInLine ? '🎯' : '👥'}</span>
              <span>
                {isNextInLine
                  ? t('games.matchmaking.nextInLine')
                  : playersAhead === 1
                    ? t('games.matchmaking.playersAheadSingle')
                    : t('games.matchmaking.playersAheadMultiple', {
                        count: playersAhead ?? 0,
                      })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-slate-400">
              <span data-testid="matchmaking-position">
                {t('games.matchmaking.queuePosition', {
                  position: position ?? 1,
                  total: queueSize ?? 1,
                })}
              </span>
              <span
                data-testid="matchmaking-estimated-wait"
                className="text-fuchsia-400 font-medium"
              >
                {t('games.matchmaking.estimatedWait', {
                  seconds: estimatedWaitSeconds ?? 30,
                })}
              </span>
            </div>
          </div>

          {otherActiveQueues.length > 0 && (
            <div className="w-full flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400">
                {t('games.matchmaking.activeQueuesTitle')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {otherActiveQueues.map(([qGameId, count]) => {
                  const targetLabel = qGameId
                    .replace('_v1', '')
                    .replace(/_/g, ' ')
                    .toUpperCase();
                  return (
                    <button
                      key={qGameId}
                      type="button"
                      onClick={() => switchGame(qGameId)}
                      data-testid={`matchmaking-switch-${qGameId}`}
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                    >
                      <span>{targetLabel}</span>
                      <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.2 text-[10px] font-bold">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="w-full flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={playVsAiNow}
              data-testid="matchmaking-play-ai"
              className="w-full rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/40 px-4 py-2.5 text-center text-sm font-semibold text-fuchsia-200 transition-colors hover:bg-fuchsia-900/50 hover:text-white"
            >
              🤖 {t('games.matchmaking.playAiNow')}
            </button>
            <button
              type="button"
              onClick={leaveQueue}
              data-testid="matchmaking-cancel"
              className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700 active:scale-[0.99]"
            >
              {t('games.matchmaking.cancel')}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
