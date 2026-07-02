'use client';

import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface UseRoomOptionsOptions {
  roomId: string;
  userId: string;
}

export function useRoomOptions({ roomId, userId }: UseRoomOptionsOptions) {
  const setOption = useCallback(
    (options: Record<string, unknown>) => {
      gameSocket.emit('games.room.set_option', { roomId, userId, options });
    },
    [roomId, userId],
  );

  return { setOption };
}
