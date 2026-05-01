import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useTranslation } from '@/shared/lib/useTranslation';
import { historyApi } from '@/features/history/api';
import { routes } from '@/shared/config/routes';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryDetail } from '../types';

interface UseHistoryActionsOptions {
  detail: HistoryDetail | null;
  accessToken: string | null;
  currentUserId: string;
  onClose: () => void;
  onRefresh: () => void;
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
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);

  const { participantSelection, toggleParticipant, setParticipantSelection } =
    useHistoryStore();

  // Rematch state
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [manualRematchError, setManualRematchError] = useState<string | null>(
    null,
  );
  const [manualRemoveError, setManualRemoveError] = useState<string | null>(
    null,
  );

  // Sync participant selection when detail changes
  useEffect(() => {
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
  }, [detail, currentUserId, setParticipantSelection]);

  const { mutateAsync: rematch, isLoading: rematchLoading } = useMutation({
    mutationFn: async (vars: { roomId: string; participantIds: string[] }) => {
      return historyApi.rematch(vars.roomId, vars.participantIds, {
        token: accessToken || undefined,
      });
    },
    onSuccess: (data) => {
      router.push(routes.gameRoom(data.room.id));
      onClose();
      onRefresh(); // Refresh history list just in case
      triggerRefresh('history');
    },
  });

  const { mutateAsync: remove, isLoading: removeLoading } = useMutation({
    mutationFn: async (roomId: string) => {
      return historyApi.remove(roomId, { token: accessToken || undefined });
    },
    onSuccess: () => {
      onClose();
      onRefresh();
      triggerRefresh('history');
    },
  });

  const [rematchError, setRematchError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const resetErrors = useCallback(() => {
    setRematchError(null);
    setRemoveError(null);
    setManualRematchError(null);
    setManualRemoveError(null);
    setShowRemoveConfirm(false);
  }, []);

  const handleStartRematch = useCallback(async () => {
    setRematchError(null);
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
    } catch (err) {
      setRematchError(err instanceof Error ? err.message : String(err));
    }
  }, [detail, accessToken, participantSelection, t, rematch]);

  const confirmRemoveFromHistory = useCallback(async () => {
    setRemoveError(null);
    setManualRemoveError(null);
    if (!detail || !accessToken) {
      setManualRemoveError(t('history.errors.authRequired'));
      return;
    }

    try {
      await remove(detail.summary.roomId);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : String(err));
    }
  }, [detail, accessToken, t, remove]);

  const effectiveRematchError = manualRematchError || rematchError;
  const effectiveRemoveError = manualRemoveError || removeError;

  return {
    participantSelection,
    handleToggleParticipant: toggleParticipant,
    rematchLoading,
    rematchError: effectiveRematchError,
    handleStartRematch,
    removeLoading,
    removeError: effectiveRemoveError,
    showRemoveConfirm,
    setShowRemoveConfirm,
    confirmRemoveFromHistory,
    resetErrors,
  };
}
