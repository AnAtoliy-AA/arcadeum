import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/shared/lib/useTranslation';
import { historyApi } from '@/features/history/api';
import type { HistoryDetail } from '../types';

interface UseHistoryActionsOptions {
  detail: HistoryDetail | null;
  accessToken: string | null;
  currentUserId: string;
  onClose: () => void;
  onRefresh: () => void; // Changed promise to void as refetch is usually void or we don't await strictly perfectly here
}

interface UseHistoryActionsResult {
  // Participant selection
  participantSelection: Record<string, boolean>;
  handleToggleParticipant: (id: string, value: boolean) => void;

  // Rematch
  rematchLoading: boolean;
  rematchError: string | null;
  handleStartRematch: () => Promise<void>;

  // Remove
  removeLoading: boolean;
  removeError: string | null;
  showRemoveConfirm: boolean;
  setShowRemoveConfirm: (show: boolean) => void;
  confirmRemoveFromHistory: () => Promise<void>;

  // Reset
  resetErrors: () => void;
}

export function useHistoryActions({
  detail,
  accessToken,
  currentUserId,
  onClose,
  onRefresh,
}: UseHistoryActionsOptions): UseHistoryActionsResult {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Participant selection
  const [participantSelection, setParticipantSelection] = useState<
    Record<string, boolean>
  >({});

  // Rematch state
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [manualRematchError, setManualRematchError] = useState<string | null>(
    null,
  );
  const [manualRemoveError, setManualRemoveError] = useState<string | null>(
    null,
  );

  const {
    mutateAsync: rematch,
    isPending: rematchLoading,
    error: queryRematchError,
  } = useMutation({
    mutationFn: async (vars: { roomId: string; participantIds: string[] }) => {
      return historyApi.rematch(vars.roomId, vars.participantIds, {
        token: accessToken || undefined,
      });
    },
    onSuccess: (data) => {
      onClose();
      onRefresh(); // Refresh history list just in case
      router.push(`/games/rooms/${data.room.id}`);
    },
  });

  const {
    mutateAsync: remove,
    isPending: removeLoading,
    error: queryRemoveError,
  } = useMutation({
    mutationFn: async (roomId: string) => {
      return historyApi.remove(roomId, { token: accessToken || undefined });
    },
    onSuccess: () => {
      onClose();
      onRefresh(); // This likely calls refetch which we want
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const rematchError =
    manualRematchError ||
    (queryRematchError ? (queryRematchError as Error).message : null);
  const removeError =
    manualRemoveError ||
    (queryRemoveError ? (queryRemoveError as Error).message : null);

  const resetErrors = useCallback(() => {
    setManualRematchError(null);
    setManualRemoveError(null);
    setShowRemoveConfirm(false);
  }, []);

  // Calculate derived state for participant selection (sync with props)
  // Calculate derived state for participant selection (sync with props)
  const [prevDetailId, setPrevDetailId] = useState<string | null>(null);

  const currentId = detail?.summary.roomId || null;
  if (currentId !== prevDetailId) {
    setPrevDetailId(currentId);

    if (detail) {
      const nextSelection: Record<string, boolean> = {};
      detail.summary.participants.forEach((participant) => {
        if (participant.id !== currentUserId) {
          nextSelection[participant.id] = true;
        }
      });
      setParticipantSelection(nextSelection);
    } else {
      setParticipantSelection({});
    }
  }

  const handleToggleParticipant = useCallback((id: string, value: boolean) => {
    setParticipantSelection((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleStartRematch = useCallback(async () => {
    setManualRematchError(null);
    if (!detail || !accessToken) {
      setManualRematchError(t('history.errors.authRequired'));
      return;
    }

    const consenting = Object.entries(participantSelection)
      .filter(([, include]) => include)
      .map(([id]) => id);

    if (!consenting.length) {
      setManualRematchError(t('history.errors.rematchMinimum'));
      return;
    }

    try {
      await rematch({
        roomId: detail.summary.roomId,
        participantIds: consenting,
      });
    } catch (_err) {
      // Error handled by query state, but we might want to log it or handle specific cases?
      // For now, let useMutation state handle it.
      // But we are using mutateAsync so it throws. We need to catch it to prevent unhandled rejection if we don't want to crash.
      // However, useMutation sets 'error' state, so we just need to consume that.
      // But with mutateAsync we MUST catch.
    }
  }, [detail, accessToken, participantSelection, t, rematch]);

  const confirmRemoveFromHistory = useCallback(async () => {
    setManualRemoveError(null);
    if (!detail || !accessToken) {
      setManualRemoveError(t('history.errors.authRequired'));
      return;
    }

    try {
      await remove(detail.summary.roomId);
    } catch (_err) {
      // Handled by query state
    }
  }, [detail, accessToken, t, remove]);

  return {
    participantSelection,
    handleToggleParticipant,
    rematchLoading,
    rematchError,
    handleStartRematch,
    removeLoading,
    removeError,
    showRemoveConfirm,
    setShowRemoveConfirm,
    confirmRemoveFromHistory,
    resetErrors,
  };
}
