import { useEffect, useCallback } from 'react';
import type { GameRoomSummary } from '@/shared/types/games';
import { useGameStore } from '../store/gameStore';

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

  const {
    room,
    session,
    loading,
    error,
    connect,
    disconnect,
    joinRoom,
    leaveRoom: storeLeaveRoom,
  } = useGameStore();

  const isHost = room?.hostId === userId;

  useEffect(() => {
    if (!enabled || !roomId) {
      return;
    }

    if (mode === 'play' && !accessToken) {
      return;
    }

    connect(roomId, userId, accessToken, mode);

    return () => {
      disconnect();
    };
  }, [roomId, userId, accessToken, mode, enabled, connect, disconnect]);

  const handleJoinRoom = useCallback(() => {
    joinRoom(roomId, userId, mode);
  }, [roomId, userId, mode, joinRoom]);

  const handleLeaveRoom = useCallback(() => {
    storeLeaveRoom(roomId, userId);
  }, [roomId, userId, storeLeaveRoom]);

  return {
    room,
    session,
    loading,
    error,
    isHost,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
  };
}
