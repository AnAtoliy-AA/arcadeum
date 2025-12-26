import { useState, useEffect, useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import type { GameRoomSummary } from '@/shared/types/games';

interface UseGameRoomOptions {
  roomId: string;
  userId: string | null;
  accessToken: string | null;
  mode?: 'play' | 'watch';
  enabled?: boolean;
}

interface UseGameRoomReturn {
  room: GameRoomSummary | null;
  session: unknown | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  joinRoom: () => void;
  leaveRoom: () => void;
}

/**
 * Hook for managing game room connection and state
 * Handles join/leave, room updates, and provides room data
 */
export function useGameRoom(options: UseGameRoomOptions): UseGameRoomReturn {
  const {
    roomId,
    userId,
    accessToken,
    mode = 'play',
    enabled = true,
  } = options;

  const [room, setRoom] = useState<GameRoomSummary | null>(null);
  const [session, setSession] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHost = room?.hostId === userId;

  const joinRoom = useCallback(() => {
    if (!roomId) {
      return;
    }

    // For watch mode, userId is optional
    if (mode === 'watch') {
      gameSocket.emit('games.room.watch', { roomId });
    } else {
      if (!userId) {
        return;
      }
      gameSocket.emit('games.room.join', { roomId, userId });
    }
  }, [roomId, userId, mode]);

  const leaveRoom = useCallback(() => {
    if (!roomId || !userId) return;

    gameSocket.emit('games.room.leave', { roomId, userId });
  }, [roomId, userId]);

  useEffect(() => {
    // Don't run if not enabled
    if (!enabled) {
      return;
    }

    // For watch mode, we can work without authentication
    const isWatchMode = mode === 'watch';

    // If not watch mode and no access token, don't connect
    if (!isWatchMode && !accessToken) {
      return;
    }

    const handleJoined = (payload: {
      room?: GameRoomSummary;
      session?: unknown;
    }) => {
      setLoading(false);
      if (payload?.room && payload.room.id === roomId) {
        setRoom(payload.room);
        setSession(payload.session ?? null);
        setError(null);
      }
    };

    const handleRoomUpdate = (payload: { room?: GameRoomSummary }) => {
      if (payload?.room && payload.room.id === roomId) {
        setRoom(payload.room);
      }
    };

    const handleGameStarted = (payload: {
      room?: GameRoomSummary;
      session?: unknown;
    }) => {
      if (payload?.room && payload.room.id === roomId) {
        setRoom(payload.room);
        setSession(payload.session ?? null);
      }
    };

    const handleException = (payload: { message?: string }) => {
      const message = payload?.message || 'An error occurred';
      setError(message);
      setLoading(false);

      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    };

    const handleConnect = () => {
      // Join room once socket is connected
      joinRoom();
    };

    const handleDisconnect = () => {
      setLoading(true);
    };

    const handleConnectError = (_error: Error) => {
      setError('Failed to connect to game server');
      setLoading(false);
    };

    const handlePlayerJoined = (payload: {
      room?: GameRoomSummary;
      userId?: string;
    }) => {
      if (payload?.room && payload.room.id === roomId) {
        setRoom(payload.room);
      }
    };

    // Decrypt wrapper for socket handlers
    const decryptHandler = <T>(handler: (payload: T) => void) => {
      return async (raw: unknown) => {
        const payload = await maybeDecrypt<T>(raw);
        handler(payload);
      };
    };

    // Create wrapped handlers
    const wrappedHandleJoined = decryptHandler(handleJoined);
    const wrappedHandleRoomUpdate = decryptHandler(handleRoomUpdate);
    const wrappedHandlePlayerJoined = decryptHandler(handlePlayerJoined);
    const wrappedHandleGameStarted = decryptHandler(handleGameStarted);
    const wrappedHandleException = decryptHandler(handleException);

    // Register listeners
    gameSocket.on('games.room.joined', wrappedHandleJoined);
    gameSocket.on('games.room.watching', wrappedHandleJoined);
    gameSocket.on('games.room.update', wrappedHandleRoomUpdate);
    gameSocket.on('games.player.joined', wrappedHandlePlayerJoined);
    gameSocket.on('games.game.started', wrappedHandleGameStarted);
    gameSocket.on('exception', wrappedHandleException);
    gameSocket.on('connect', handleConnect);
    gameSocket.on('disconnect', handleDisconnect);
    gameSocket.on('connect_error', handleConnectError);

    // If already connected, join immediately
    if (gameSocket.connected) {
      joinRoom();
    } else {
    }

    // Cleanup
    return () => {
      gameSocket.off('games.room.joined', wrappedHandleJoined);
      gameSocket.off('games.room.watching', wrappedHandleJoined);
      gameSocket.off('games.room.update', wrappedHandleRoomUpdate);
      gameSocket.off('games.player.joined', wrappedHandlePlayerJoined);
      gameSocket.off('games.game.started', wrappedHandleGameStarted);
      gameSocket.off('exception', wrappedHandleException);
      gameSocket.off('connect', handleConnect);
      gameSocket.off('disconnect', handleDisconnect);
      gameSocket.off('connect_error', handleConnectError);
    };
  }, [roomId, accessToken, mode, joinRoom, enabled]);

  return {
    room,
    session,
    loading,
    error,
    isHost,
    joinRoom,
    leaveRoom,
  };
}
