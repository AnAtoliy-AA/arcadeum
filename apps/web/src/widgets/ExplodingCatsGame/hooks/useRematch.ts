import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

interface UseRematchOptions {
  roomId: string;
}

interface UseRematchResult {
  rematchLoading: boolean;
  rematchError: string | null;
  showRematchModal: boolean;
  openRematchModal: () => void;
  closeRematchModal: () => void;
  handleRematch: (participantIds: string[]) => Promise<void>;
}

export function useRematch({ roomId }: UseRematchOptions): UseRematchResult {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [showRematchModal, setShowRematchModal] = useState(false);

  const openRematchModal = useCallback(() => {
    setShowRematchModal(true);
    setRematchError(null);
  }, []);

  const closeRematchModal = useCallback(() => {
    setShowRematchModal(false);
  }, []);

  const handleRematch = useCallback(
    async (participantIds: string[]) => {
      if (!snapshot.accessToken) {
        setRematchError('Authentication required');
        return;
      }

      try {
        setRematchLoading(true);
        setRematchError(null);

        const url = resolveApiUrl(
          `/games/history/${encodeURIComponent(roomId)}/rematch`,
        );
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
          body: JSON.stringify({ participantIds }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create rematch');
        }

        const data = await response.json();
        // API returns { room: "roomId" } - room is the ID string directly
        const newRoomId =
          typeof data.room === 'string' ? data.room : data.room?.id;
        if (!newRoomId) {
          throw new Error('Invalid response: missing room ID');
        }
        setShowRematchModal(false);
        router.push(`/games/rooms/${newRoomId}`);
      } catch (err) {
        setRematchError(err instanceof Error ? err.message : String(err));
      } finally {
        setRematchLoading(false);
      }
    },
    [roomId, snapshot.accessToken, router],
  );

  return {
    rematchLoading,
    rematchError,
    showRematchModal,
    openRematchModal,
    closeRematchModal,
    handleRematch,
  };
}
