import { useState, useEffect } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import type { GameSessionSummary } from '@/shared/types/games';

interface UseGameSessionOptions {
  roomId: string;
  enabled?: boolean;
  initialSession?: GameSessionSummary | null;
}

interface UseGameSessionReturn {
  session: GameSessionSummary | null;
  startBusy: boolean;
  actionBusy: string | null;
  setActionBusy: (action: string | null) => void;
}

/**
 * Hook for managing game session state
 * Handles session snapshots, updates, and action states
 */
export function useGameSession(
  options: UseGameSessionOptions,
): UseGameSessionReturn {
  const { roomId, enabled = true, initialSession } = options;

  const [session, setSession] = useState<GameSessionSummary | null>(
    initialSession ?? null,
  );

  const [prevRoomId, setPrevRoomId] = useState(roomId);
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId);
    setSession(null);
  }

  const [prevInitialSession, setPrevInitialSession] = useState(initialSession);
  if (initialSession !== prevInitialSession) {
    setPrevInitialSession(initialSession);
    if (initialSession) {
      setSession(initialSession);
    }
  }

  const [startBusy, setStartBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleSnapshot = (payload: {
      roomId?: string;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.roomId && payload.roomId !== roomId) return;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'session')) {
        setSession(payload?.session ?? null);
      }
      setActionBusy(null);
    };

    const handleSessionStarted = (payload: {
      room?: unknown;
      session?: GameSessionSummary | null;
    }) => {
      setStartBusy(false);
      if (payload?.session) {
        setSession(payload.session);
      }
      setActionBusy(null);
    };

    const handleRoomJoined = (payload: {
      room?: unknown;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.session) {
        setSession(payload.session);
      }
    };

    // Decrypt wrapper for socket handlers
    const decryptHandler = <T>(handler: (payload: T) => void) => {
      return async (raw: unknown) => {
        const payload = await maybeDecrypt<T>(raw);
        if (payload !== null) {
          handler(payload);
        }
      };
    };

    // Create wrapped handlers
    const wrappedHandleSnapshot = decryptHandler(handleSnapshot);
    const wrappedHandleSessionStarted = decryptHandler(handleSessionStarted);
    const wrappedHandleRoomJoined = decryptHandler(handleRoomJoined);

    // Register listeners
    gameSocket.on('games.session.snapshot', wrappedHandleSnapshot);
    gameSocket.on('games.session.started', wrappedHandleSessionStarted);
    gameSocket.on('games.room.joined', wrappedHandleRoomJoined);

    // Initial check if we should join or sync
    // (This part is usually handled by the component or a dedicated effect)

    // Cleanup
    return () => {
      gameSocket.off('games.session.snapshot', wrappedHandleSnapshot);
      gameSocket.off('games.session.started', wrappedHandleSessionStarted);
      gameSocket.off('games.room.joined', wrappedHandleRoomJoined);
    };
  }, [roomId, enabled]);

  return {
    session,
    startBusy,
    actionBusy,
    setActionBusy,
  };
}
