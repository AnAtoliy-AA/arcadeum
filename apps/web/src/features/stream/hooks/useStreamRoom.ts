'use client';

import { useEffect, useState } from 'react';
import { getOrCreateAnonymousId } from '@/shared/lib/api-client';
import { gamesApi } from '@/features/games/api';
import { useGameRoom } from '@/features/games/hooks/useGameRoom';
import { useGameSession } from '@/features/games/hooks/useGameSession';
import { useGameStore } from '@/features/games/store/gameStore';
import type {
  GameInitialData,
  GameRoomSummary,
  GameSessionSummary,
} from '@/shared/types/games';
import { useAnonymousSpectatorSocket } from './useAnonymousSpectatorSocket';

const RETRY_MIN_MS = 2000;
const RETRY_MAX_MS = 10000;

export interface StreamRoomState {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  /**
   * Anonymous id of this viewer, or null until resolved. Widgets decide
   * "am I a player?" by comparing it with the seats, so handing them a real
   * non-player id (instead of null) is what puts them in spectator mode.
   */
  viewerId: string | null;
  /** Raw session as the store holds it (handed to the game widget). */
  storeSession: GameSessionSummary | null;
  isConnected: boolean;
}

/**
 * Spectator view of one room for the broadcast scene.
 *
 * Reuses the regular room store in `watch` mode (the same path as
 * `?mode=watch`) with a null user, so the viewer is always an anonymous
 * spectator even if a login cookie exists in the capture browser.
 *
 * Failure policy: never expose an error. The initial room fetch retries
 * with a capped backoff, and after a socket drop the store keeps the last
 * room/session so the picture stays on screen until the socket is back.
 */
export function useStreamRoom(roomId: string): StreamRoomState {
  const [initial, setInitial] = useState<{
    roomId: string;
    data: GameInitialData;
  } | null>(null);

  useAnonymousSpectatorSocket();

  const [viewerId, setViewerId] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getOrCreateAnonymousId()
      .then((id) => {
        if (alive) setViewerId(id);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const load = async () => {
      try {
        const data = await gamesApi.getRoomInfo(roomId);
        if (!cancelled) setInitial({ roomId, data });
      } catch {
        if (cancelled) return;
        attempt += 1;
        const delay = Math.min(RETRY_MIN_MS * attempt, RETRY_MAX_MS);
        timer = setTimeout(() => void load(), delay);
      }
    };
    void load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [roomId]);

  const initialData = initial?.roomId === roomId ? initial.data : undefined;

  const { room, session: storeSession } = useGameRoom({
    roomId,
    userId: null,
    accessToken: null,
    mode: 'watch',
    enabled: true,
    initialData,
  });

  // The store keeps the previous room's session until the new one arrives;
  // only trust it when it belongs to this room.
  const storeRoomId = useGameStore((s) => s.room?.id);
  const typedStoreSession = ((storeRoomId === roomId ? storeSession : null) ??
    initialData?.session ??
    null) as GameSessionSummary | null; // the store types it as unknown

  const { session } = useGameSession({
    roomId,
    initialSession: typedStoreSession,
  });

  const isConnected = useGameStore((s) => s.isConnected);

  return {
    room,
    session: session ?? typedStoreSession,
    viewerId,
    storeSession: typedStoreSession,
    isConnected,
  };
}
