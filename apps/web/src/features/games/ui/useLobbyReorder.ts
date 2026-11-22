'use client';

import { useCallback } from 'react';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';

/**
 * Reorder handler for lobbies whose parent does not supply one: persists the
 * new order through the REST API when an access token is available.
 */
export function useLobbyReorder(
  roomId: string | undefined,
  accessToken: string | null | undefined,
  override?: (newOrder: string[]) => void,
) {
  const fallback = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch {}
    },
    [accessToken, roomId],
  );
  return override ?? fallback;
}
