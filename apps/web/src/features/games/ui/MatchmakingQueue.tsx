'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { YStack, Text, Spinner } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { gameSocket, emitEncrypted, useSocket } from '@/shared/lib/socket';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getAnonymousIdWithSignature } from '@/shared/lib/api-client';
import { useRoutes } from '@/shared/config/useRoutes';
import { create } from 'zustand';

interface MatchmakingState {
  isQueued: boolean;
  gameId: string | null;
  variant: string | null;
  startTime: number | null;
  startQueue: (gameId: string, variant?: string) => void;
  stopQueue: () => void;
  setQueued: (
    queued: boolean,
    gameId?: string | null,
    variant?: string | null,
  ) => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set, get) => ({
  isQueued: false,
  gameId: null,
  variant: null,
  startTime: null,
  startQueue: (gameId, variant) => {
    set({
      isQueued: true,
      gameId,
      variant: variant ?? null,
      startTime: Date.now(),
    });
  },
  stopQueue: () => {
    const { isQueued } = get();
    if (isQueued) {
      set({ isQueued: false, gameId: null, variant: null, startTime: null });
    }
  },
  setQueued: (queued, gameId = null, variant = null) => {
    set({
      isQueued: queued,
      gameId,
      variant,
      startTime: queued ? Date.now() : null,
    });
  },
}));

export function useMatchmaking() {
  const { snapshot } = useSessionTokens();
  const store = useMatchmakingStore();

  const joinQueue = useCallback(
    async (gameId: string, variant?: string) => {
      store.startQueue(gameId, variant);

      let userId = snapshot.userId;
      if (!userId) {
        await getAnonymousIdWithSignature();
        userId = localStorage.getItem('arcadeum_anon_id');
      }
      if (!userId) return;
      void emitEncrypted(gameSocket, 'games.matchmaking.join', {
        userId,
        gameId,
        variant,
      });
    },
    [snapshot.userId, store],
  );

  const leaveQueue = useCallback(() => {
    const userId = snapshot.userId;
    if (!userId) return;
    store.stopQueue();
    void emitEncrypted(gameSocket, 'games.matchmaking.leave', { userId });
  }, [snapshot.userId, store]);

  return {
    isQueued: store.isQueued,
    gameId: store.gameId,
    variant: store.variant,
    startTime: store.startTime,
    joinQueue,
    leaveQueue,
  };
}

export function MatchmakingQueueModal() {
  const router = useRouter();
  const routes = useRoutes();
  const { isQueued, gameId, leaveQueue, startTime } = useMatchmaking();
  const [now, setNow] = useState(() => Date.now());

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
      useMatchmakingStore.getState().stopQueue();
      router.push(routes.gameRoom(payload.roomId));
    }
  });

  // Handle page navigation / unmount cleanup
  useEffect(() => {
    return () => {
      // Auto-cancel queue on unmount
      if (useMatchmakingStore.getState().isQueued) {
        leaveQueue();
      }
    };
  }, [leaveQueue]);

  if (!isQueued) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
        <YStack alignItems="center" gap="$4">
          <Spinner size="large" color="#d946ef" />
          <Text
            fontSize="$6"
            fontWeight="700"
            color="#f8fafc"
            textAlign="center"
          >
            Searching for Opponent
          </Text>
          <Text fontSize="$3" color="#94a3b8" textAlign="center">
            Finding a match for{' '}
            {gameId
              ? gameId.replace('_v1', '').replace('_', ' ').toUpperCase()
              : 'game'}
            ...
          </Text>
          <Text
            fontSize="$7"
            fontWeight="800"
            color="#38bdf8"
            fontFamily="$body"
          >
            {formatTime(elapsed)}
          </Text>
          <Button
            variant="primary"
            backgroundColor="#dc2626"
            hoverStyle={{ backgroundColor: '#b91c1c' }}
            onClick={leaveQueue}
            style={{ width: '100%', marginTop: 10 }}
          >
            Cancel Matchmaking
          </Button>
        </YStack>
      </div>
    </>,
    document.body,
  );
}
