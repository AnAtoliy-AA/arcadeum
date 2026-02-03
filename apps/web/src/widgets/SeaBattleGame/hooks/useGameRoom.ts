import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/shared/lib/socket';
import type { GameRoomSummary } from '@/shared/types/games';

export function useGameRoom(initialRoom: GameRoomSummary) {
  const [room, setRoom] = useState<GameRoomSummary>(initialRoom);

  // Update local state when initialRoom prop changes (e.g. from parent re-render)
  useEffect(() => {
    setRoom(initialRoom);
  }, [initialRoom]);

  const handleUpdate = useCallback((payload: unknown) => {
    const data = payload as { room: GameRoomSummary };
    if (data?.room) {
      setRoom((prev) => {
        // Only update if ID matches to prevent race conditions (though socket is room-scoped usually)
        if (data.room.id === prev.id) {
          return data.room;
        }
        return prev;
      });
    }
  }, []);

  useSocket('games.player.joined', handleUpdate);
  useSocket('games.player.left', handleUpdate);
  useSocket('games.room.updated', handleUpdate);
  useSocket('games.rematch.declined', handleUpdate);

  return room;
}
