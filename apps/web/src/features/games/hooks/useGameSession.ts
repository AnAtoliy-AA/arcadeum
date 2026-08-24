import { useState, useEffect } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import type { GameSessionSummary } from '@/shared/types/games';
import { offlineBusOn } from '@/features/offline/lib/offline-bus';
import { isOfflineRoomId as routeOfflineRoomId } from '@/features/offline/lib/offline-room';

interface UseGameSessionOptions {
  roomId: string;
  enabled?: boolean;
  initialSession?: GameSessionSummary | null;
}

interface UseGameSessionReturn {
  session: GameSessionSummary | null;
  startBusy: boolean;
  setStartBusy: (busy: boolean) => void;
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

    // Offline rooms never touch sockets — snapshots arrive via the local bus.
    if (routeOfflineRoomId(roomId)) {
      const handleSnapshot = (payload: unknown) => {
        const p = payload as {
          roomId?: string;
          session?: GameSessionSummary | null;
        };
        if (p?.roomId && p.roomId !== roomId) return;
        setSession(p?.session ?? null);
        setActionBusy(null);
      };
      const offSnapshot = offlineBusOn(
        'games.session.snapshot',
        handleSnapshot,
      );
      const offStarted = offlineBusOn('games.session.started', (payload) => {
        const p = payload as { session?: GameSessionSummary | null };
        setStartBusy(false);
        if (p?.session) setSession(p.session);
        setActionBusy(null);
      });
      return () => {
        offSnapshot();
        offStarted();
      };
    }

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

    const handleGameStarted = (payload: {
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

    const handleException = () => {
      setStartBusy(false);
      setActionBusy(null);
    };

    // Decrypt wrapper for socket handlers — skips handler when decryption
    // fails (e.g. anonymous clients without encryption key, or key not yet received)
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
    const wrappedHandleGameStarted = decryptHandler(handleGameStarted);
    const wrappedHandleRoomJoined = decryptHandler(handleRoomJoined);

    // Register listeners
    gameSocket.on('games.session.snapshot', wrappedHandleSnapshot);
    gameSocket.on('games.session.started', wrappedHandleSessionStarted);
    gameSocket.on('games.game.started', wrappedHandleGameStarted);
    gameSocket.on('games.room.joined', wrappedHandleRoomJoined);
    gameSocket.on('exception', handleException);

    // Raw listeners — always clear startBusy/actionBusy even if decryption
    // fails (anonymous clients without encryption key)
    const onRawGameStarted = () => setStartBusy(false);
    const onRawSessionStarted = () => setStartBusy(false);
    gameSocket.on('games.game.started', onRawGameStarted);
    gameSocket.on('games.session.started', onRawSessionStarted);

    // Cleanup
    return () => {
      gameSocket.off('games.session.snapshot', wrappedHandleSnapshot);
      gameSocket.off('games.session.started', wrappedHandleSessionStarted);
      gameSocket.off('games.game.started', wrappedHandleGameStarted);
      gameSocket.off('games.room.joined', wrappedHandleRoomJoined);
      gameSocket.off('exception', handleException);
      gameSocket.off('games.game.started', onRawGameStarted);
      gameSocket.off('games.session.started', onRawSessionStarted);
    };
  }, [roomId, enabled]);

  return {
    session,
    startBusy,
    setStartBusy,
    actionBusy,
    setActionBusy,
  };
}
