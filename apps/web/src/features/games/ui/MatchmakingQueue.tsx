'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/shared/ui/CSSSpinner';
import { gameSocket, emitEncrypted, useSocket } from '@/shared/lib/socket';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getOrCreateAnonymousId } from '@/shared/lib/api-client';
import { useRoutes } from '@/shared/config/useRoutes';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  trackSocialMatchmakingJoined,
  trackSocialMatchmakingMatched,
  trackSocialQuickplayStarted,
} from '@/shared/analytics/funnel';
import { gamesApi } from '@/features/games/api';
import { useRankingStore } from '@/features/ranking/store/rankingStore';
import {
  useMatchmakingStore,
  type MatchmakingStatus,
} from './matchmakingStore';
import { MatchmakingFloatingBar } from './MatchmakingFloatingBar';

export { useMatchmakingStore, type MatchmakingStatus };

export function useMatchmaking() {
  const { snapshot } = useSessionTokens();
  const router = useRouter();
  const routes = useRoutes();
  const ratings = useRankingStore((s) => s.ratings);

  const isQueued = useMatchmakingStore((s) => s.isQueued);
  const isMinimized = useMatchmakingStore((s) => s.isMinimized);
  const gameId = useMatchmakingStore((s) => s.gameId);
  const variant = useMatchmakingStore((s) => s.variant);
  const ranked = useMatchmakingStore((s) => s.ranked);
  const startTime = useMatchmakingStore((s) => s.startTime);
  const activeQueues = useMatchmakingStore((s) => s.activeQueues);
  const friendsInQueue = useMatchmakingStore((s) => s.friendsInQueue);
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

      const userRating = ratings[targetGameId]?.elo;

      startQueue(targetGameId, targetVariant, isRanked);
      trackSocialMatchmakingJoined(targetGameId);
      void emitEncrypted(gameSocket, 'games.matchmaking.join', {
        userId,
        gameId: targetGameId,
        variant: targetVariant,
        ranked: isRanked,
        rating: userRating,
      });
    },
    [snapshot.userId, ratings, startQueue],
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
    activeQueues,
    friendsInQueue,
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
    activeQueues,
    friendsInQueue,
    leaveQueue,
    joinQueue,
    setMinimized,
    playVsAiNow,
    switchGame,
    startTime,
  } = useMatchmaking();
  const ratings = useRankingStore((s) => s.ratings);
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
    if (!isQueued || !startTime) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
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

  const gameLabel = gameId ? gameId.replace('_v1', '').replace(/_/g, ' ') : '';

  const otherGames = Object.entries(activeQueues).filter(
    ([id, count]) => id !== gameId && count > 0,
  );

  const friendsInThisGame = friendsInQueue.filter((f) => f.gameId === gameId);
  const friendsInOtherGames = friendsInQueue.filter((f) => f.gameId !== gameId);

  if (isMinimized) {
    return createPortal(
      <MatchmakingFloatingBar
        gameLabel={gameLabel}
        elapsedTime={formatTime(elapsed)}
        onExpand={() => setMinimized(false)}
        onLeave={leaveQueue}
      />,
      document.body,
    );
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1299] bg-black/60 backdrop-blur-sm"
        onClick={leaveQueue}
      />
      <div
        data-testid="matchmaking-modal"
        className="fixed left-1/2 top-1/2 z-[1300] w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[var(--background)] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--borderColor)]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {gameLabel && <span className="capitalize">{gameLabel}</span>}
            </span>
            {gameId && ratings[gameId] && (
              <span className="rounded-md bg-[var(--primary)]/10 px-2 py-0.5 text-[11px] font-bold text-[var(--color)]">
                {ratings[gameId].elo}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            data-testid="matchmaking-minimize"
            className="rounded-lg p-1 text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--foreground)] transition-colors text-xs"
          >
            {t('games.matchmaking.minimize')}
          </button>
        </div>

        <div className="flex flex-col items-center gap-5 py-8 px-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full border border-[var(--primary)]/20 animate-ping opacity-40" />
            <div className="absolute h-14 w-14 rounded-full border border-[var(--primary)]/30 animate-pulse" />
            <Spinner size="large" color="var(--primary)" />
          </div>

          <div className="text-center">
            <h3 className="m-0 text-lg font-bold text-[var(--foreground)]">
              {t('games.matchmaking.searchingTitle')}
            </h3>
            <p className="mt-1.5 text-sm text-[var(--textSecondary)]">
              {t('games.matchmaking.searchingSubtitle', { game: gameLabel })}
            </p>
          </div>

          <p
            data-testid="matchmaking-timer"
            className="m-0 text-4xl font-mono font-bold text-[var(--primary)] tracking-wider"
          >
            {formatTime(elapsed)}
          </p>

          {friendsInThisGame.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400 text-center">
                {t('games.matchmaking.friendsSearching')}
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {friendsInThisGame.map((f) => (
                  <span
                    key={f.userId}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {f.userId.slice(0, 8)}
                    {f.rating !== undefined && (
                      <span className="text-emerald-400/60">{f.rating}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {friendsInOtherGames.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--textSecondary)] text-center">
                {t('games.matchmaking.friendsInOtherGames')}
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {friendsInOtherGames.map((f) => {
                  const label = f.gameId.replace('_v1', '').replace(/_/g, ' ');
                  return (
                    <button
                      key={f.userId}
                      type="button"
                      onClick={() => switchGame(f.gameId)}
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--backgroundHover)] border border-[var(--borderColor)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--borderColor)]"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="capitalize">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {otherGames.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--textSecondary)] text-center">
                {t('games.matchmaking.alsoSearching')}
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {otherGames.map(([id, count]) => {
                  const label = id.replace('_v1', '').replace(/_/g, ' ');
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => switchGame(id)}
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--backgroundHover)] border border-[var(--borderColor)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--borderColor)]"
                    >
                      <span className="capitalize">{label}</span>
                      <span className="rounded-full bg-[var(--primary)]/15 text-[var(--color)] px-1.5 py-0.5 text-[10px] font-bold">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="w-full flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={playVsAiNow}
              data-testid="matchmaking-play-ai"
              className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-center text-sm font-semibold text-[var(--primaryText)] transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {t('games.matchmaking.playAiNow')}
            </button>
            <button
              type="button"
              onClick={leaveQueue}
              data-testid="matchmaking-cancel"
              className="w-full rounded-xl border border-[var(--borderColor)] bg-transparent px-4 py-3 text-center text-sm font-medium text-[var(--textSecondary)] transition-colors hover:bg-[var(--backgroundHover)] hover:text-[var(--foreground)]"
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
