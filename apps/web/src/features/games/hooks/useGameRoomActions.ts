import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import type { GameRoomSummary } from '@/shared/types/games';

/**
 * Resolves the live room from the game store (falling back to the initial
 * server-rendered room) and exposes the standard room-action callbacks that
 * every lobby needs (leave, delete, kick, refresh).
 */
export function useGameRoomActions(
  roomId: string,
  initialRoom: GameRoomSummary | null,
) {
  const storeRoom = useGameStore((s: GameState) => s.room);
  const deleteRoom = useGameStore((s: GameState) => s.deleteRoom);
  const kickPlayer = useGameStore((s: GameState) => s.kickPlayer);
  const leaveRoom = useGameStore((s: GameState) => s.leaveRoom);
  const refreshRoom = useGameStore((s: GameState) => s.refreshRoom);

  const room = (storeRoom?.id === roomId ? storeRoom : null) ?? initialRoom;

  return {
    room,
    onLeaveRoom: (userId: string) => leaveRoom(roomId, userId),
    onDeleteRoom: () => void deleteRoom(roomId),
    onKickPlayer: (targetUserId: string, callerUserId: string) =>
      kickPlayer(roomId, targetUserId, callerUserId),
    onRefresh: () => void refreshRoom(roomId),
  } as const;
}
