import { useCallback } from 'react';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import type { GameRoomSummary } from '@/shared/types/games';

export function useGameRoomActions(
  roomId: string,
  initialRoom: GameRoomSummary | null,
) {
  const storeRoom = useGameStore((s: GameState) => s.room);
  const deleteRoom = useGameStore((s: GameState) => s.deleteRoom);
  const kickPlayer = useGameStore((s: GameState) => s.kickPlayer);
  const leaveRoom = useGameStore((s: GameState) => s.leaveRoom);
  const refreshRoom = useGameStore((s: GameState) => s.refreshRoom);
  const accessToken = useGameStore((s: GameState) => s.accessToken);

  const room = (storeRoom?.id === roomId ? storeRoom : null) ?? initialRoom;

  const onReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken ?? '');
      } catch {
        void refreshRoom(roomId);
      }
    },
    [roomId, accessToken, refreshRoom],
  );

  return {
    room,
    onLeaveRoom: (userId: string) => leaveRoom(roomId, userId),
    onDeleteRoom: () => void deleteRoom(roomId),
    onKickPlayer: (targetUserId: string, callerUserId: string) =>
      kickPlayer(roomId, targetUserId, callerUserId),
    onRefresh: () => void refreshRoom(roomId),
    onReorderPlayers,
  } as const;
}
