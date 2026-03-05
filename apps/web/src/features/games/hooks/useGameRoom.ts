import { useEffect, useCallback } from 'react';
import type { GameRoomSummary, GameInitialData } from '@/shared/types/games';
import { useGameStore } from '../store/gameStore';

interface UseGameRoomOptions {
  roomId: string;
  userId: string | null;
  accessToken: string | null;
  mode?: 'play' | 'watch';
  inviteCode?: string;
  enabled?: boolean;
  initialData?: GameInitialData;
}

interface UseGameRoomReturn {
  room: GameRoomSummary | null;
  session: unknown | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  joinRoom: (code?: string) => void;
  leaveRoom: () => void;
  deleteRoom: (roomId: string) => Promise<void>;
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
    inviteCode,
    enabled = true,
    initialData,
  } = options;

  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const loading = useGameStore((s) => s.loading);
  const error = useGameStore((s) => s.error);
  const connect = useGameStore((s) => s.connect);
  const disconnect = useGameStore((s) => s.disconnect);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const storeLeaveRoom = useGameStore((s) => s.leaveRoom);
  const storeDeleteRoom = useGameStore((s) => s.deleteRoom);
  const isHost = room?.hostId === userId;

  useEffect(() => {
    if (!enabled || !roomId) {
      return;
    }

    // Allow play mode without access token if we have a userId (anonymous play)
    if (mode === 'play' && !accessToken && !userId) {
      return;
    }

    connect(roomId, userId, accessToken, mode, inviteCode, initialData);

    return () => {
      disconnect();
    };
  }, [
    roomId,
    userId,
    accessToken,
    mode,
    inviteCode,
    enabled,
    initialData,
    connect,
    disconnect,
  ]);

  const handleJoinRoom = useCallback(
    (code?: string) => {
      joinRoom(roomId, userId, mode, code || inviteCode);
    },
    [roomId, userId, mode, inviteCode, joinRoom],
  );

  const handleLeaveRoom = useCallback(() => {
    storeLeaveRoom(roomId, userId);
  }, [roomId, userId, storeLeaveRoom]);

  return {
    room: (room?.id === roomId ? room : null) || initialData?.room || null,
    session,
    loading,
    error,
    isHost,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    deleteRoom: storeDeleteRoom,
  };
}
