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
} from '@/shared/analytics/funnel';
import { create } from 'zustand';

export interface MatchmakingStatus {
  gameId: string;
  variant?: string;
  ranked?: boolean;
  queueSize: number;
  position: number;
  estimatedWaitSeconds: number;
}

interface MatchmakingState {
  isQueued: boolean;
  gameId: string | null;
  variant: string | null;
  ranked: boolean | null;
  startTime: number | null;
  queueSize: number | null;
  position: number | null;
  estimatedWaitSeconds: number | null;
  startQueue: (gameId: string, variant?: string, ranked?: boolean) => void;
  stopQueue: () => void;
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
  gameId: null,
  variant: null,
  ranked: null,
  startTime: null,
  queueSize: null,
  position: null,
  estimatedWaitSeconds: null,
  startQueue: (gameId, variant, ranked) => {
    set({
      isQueued: true,
      gameId,
      variant: variant ?? null,
      ranked: ranked ?? null,
      startTime: Date.now(),
      queueSize: null,
      position: null,
      estimatedWaitSeconds: null,
    });
  },
  stopQueue: () => {
    const { isQueued } = get();
    if (isQueued) {
      set({
        isQueued: false,
        gameId: null,
        variant: null,
        ranked: null,
        startTime: null,
        queueSize: null,
        position: null,
        estimatedWaitSeconds: null,
      });
    }
  },
  setQueued: (queued, gameId = null, variant = null, ranked = null) => {
    set({
      isQueued: queued,
      gameId,
      variant,
      ranked,
      startTime: queued ? Date.now() : null,
      queueSize: null,
      position: null,
      estimatedWaitSeconds: null,
    });
  },
  setStatus: (status) => {
    set({
      queueSize: status.queueSize,
      position: status.position,
      estimatedWaitSeconds: status.estimatedWaitSeconds,
    });
  },
}));

export function useMatchmaking() {
  const { snapshot } = useSessionTokens();
  // Field-level selectors: queue-status ticks (size/position/wait) arrive
  // continuously while queued, so a whole-store subscription here would
  // re-render every consumer on each tick. Actions are stable references.
  const isQueued = useMatchmakingStore((s) => s.isQueued);
  const gameId = useMatchmakingStore((s) => s.gameId);
  const variant = useMatchmakingStore((s) => s.variant);
  const ranked = useMatchmakingStore((s) => s.ranked);
  const startTime = useMatchmakingStore((s) => s.startTime);
  const queueSize = useMatchmakingStore((s) => s.queueSize);
  const position = useMatchmakingStore((s) => s.position);
  const estimatedWaitSeconds = useMatchmakingStore(
    (s) => s.estimatedWaitSeconds,
  );
  const startQueue = useMatchmakingStore((s) => s.startQueue);
  const stopQueue = useMatchmakingStore((s) => s.stopQueue);

  const joinQueue = useCallback(
    async (gameId: string, variant?: string, ranked?: boolean) => {
      let userId = snapshot.userId;
      if (!userId) {
        userId = await getOrCreateAnonymousId();
      }
      if (!userId) return;

      startQueue(gameId, variant, ranked);
      trackSocialMatchmakingJoined(gameId);
      void emitEncrypted(gameSocket, 'games.matchmaking.join', {
        userId,
        gameId,
        variant,
        ranked,
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

  return {
    isQueued,
    gameId,
    variant,
    ranked,
    startTime,
    queueSize,
    position,
    estimatedWaitSeconds,
    joinQueue,
    leaveQueue,
  };
}

export function MatchmakingQueueModal() {
  const router = useRouter();
  const routes = useRoutes();
  const { t } = useTranslation();
  const {
    isQueued,
    gameId,
    leaveQueue,
    joinQueue,
    startTime,
    queueSize,
    position,
    estimatedWaitSeconds,
  } = useMatchmaking();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & {
      isPlaywright?: boolean;
      __joinMatchmaking?: (g: string) => Promise<void>;
    };
    if (!w.isPlaywright) return;
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

  // Listen to match success events
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

  // Listen to queue status updates (queue size, position, estimated wait)
  useSocket('games.matchmaking.status', (data: unknown) => {
    const payload = data as MatchmakingStatus;
    if (payload && typeof payload.queueSize === 'number') {
      useMatchmakingStore.getState().setStatus(payload);
    }
  });

  // Handle page navigation / unmount cleanup safely without re-triggering on hook updates
  const leaveQueueRef = React.useRef(leaveQueue);
  useEffect(() => {
    leaveQueueRef.current = leaveQueue;
  }, [leaveQueue]);

  useEffect(() => {
    return () => {
      // Auto-cancel queue on unmount
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
    : 'game';

  const showQueueInfo = queueSize !== null && position !== null;

  return createPortal(
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1299,
        }}
      />
      <div
        data-testid="matchmaking-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1300,
          maxWidth: 400,
          width: '90%',
          borderRadius: 24,
          padding: 24,
          backgroundColor: '#18001e',
          border: '2px solid rgba(192, 38, 211, 0.6)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner size="large" color="#d946ef" />
          <p className="m-0 text-center text-[24px] font-bold text-[#f8fafc]">
            {t('games.matchmaking.searchingTitle')}
          </p>
          <p className="m-0 text-center text-[16px] text-[#94a3b8]">
            {t('games.matchmaking.searchingSubtitle', { game: gameLabel })}
          </p>
          <p
            data-testid="matchmaking-timer"
            className="m-0 text-center text-[28px] font-extrabold text-[#38bdf8]"
          >
            {formatTime(elapsed)}
          </p>
          {showQueueInfo && (
            <div className="flex flex-col items-center gap-1">
              <p
                data-testid="matchmaking-estimated-wait"
                className="m-0 text-center text-[14px] font-semibold text-[#c084fc]"
              >
                {t('games.matchmaking.estimatedWait', {
                  seconds: estimatedWaitSeconds ?? 0,
                })}
              </p>
              <p
                data-testid="matchmaking-position"
                className="m-0 text-center text-[13px] text-[#94a3b8]"
              >
                {t('games.matchmaking.queuePosition', {
                  position: position ?? 0,
                  total: queueSize ?? 0,
                })}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={leaveQueue}
            data-testid="matchmaking-cancel"
            className="mt-2.5 w-full rounded-[10px] border-none px-4 py-3 text-center text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-[#b91c1c]"
            style={{ backgroundColor: '#dc2626' }}
          >
            {t('games.matchmaking.cancel')}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
