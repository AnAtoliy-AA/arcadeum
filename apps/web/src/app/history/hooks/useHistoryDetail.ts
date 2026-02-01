import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/shared/lib/useTranslation';
import { historyApi } from '@/features/history/api';
import { useHistoryStore } from '../store/historyStore';
import type {
  HistorySummary,
  HistoryDetail,
  HistoryParticipant,
} from '../types';

interface UseHistoryDetailOptions {
  accessToken: string | null;
}

interface UseHistoryDetailResult {
  selectedEntry: HistorySummary | null;
  detail: HistoryDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  handleSelectEntry: (entry: HistorySummary) => Promise<void>;
  handleCloseModal: () => void;
  formatParticipantName: (
    participant: HistoryParticipant | undefined | null,
  ) => string;
  formatLogMessage: (message: string) => string;
  formatDate: (dateString: string | null | undefined) => string;
  resetErrors: () => void;
}

export function useHistoryDetail({
  accessToken,
}: UseHistoryDetailOptions): UseHistoryDetailResult {
  const { t } = useTranslation();
  const { selectedEntry, selectEntry } = useHistoryStore();

  // UI-specific error state if we want to manually set errors (e.g. auth check)
  const [manualError, setManualError] = useState<string | null>(null);

  const {
    data: detail = null,
    isLoading: detailLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['history', 'detail', selectedEntry?.roomId],
    queryFn: async () => {
      if (!selectedEntry?.roomId || !accessToken) return null;
      try {
        return await historyApi.getDetail(selectedEntry.roomId, {
          token: accessToken,
        });
      } catch (err: unknown) {
        // Map specific error messages handled in UI
        if (
          err instanceof Error &&
          err.message === 'history_detail_removed_error'
        ) {
          throw new Error(t('history.errors.detailRemoved'));
        }
        throw new Error(t('history.errors.detailFailed'));
      }
    },
    enabled: !!selectedEntry && !!accessToken,
  });

  const detailError =
    manualError || (queryError ? (queryError as Error).message : null);

  const resetErrors = useCallback(() => {
    setManualError(null);
  }, []);

  const handleSelectEntry = useCallback(
    async (entry: HistorySummary) => {
      setManualError(null);
      if (!accessToken) {
        setManualError(t('history.errors.authRequired'));
      }
      selectEntry(entry);
    },
    [accessToken, t, selectEntry],
  );

  const handleCloseModal = useCallback(() => {
    selectEntry(null);
    setManualError(null);
  }, [selectEntry]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedEntry) {
        handleCloseModal();
      }
    };

    if (selectedEntry) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedEntry, handleCloseModal]);

  const formatParticipantName = useCallback(
    (participant: HistoryParticipant | undefined | null) => {
      if (!participant) {
        return '';
      }
      return (
        participant.username ||
        participant.email?.split('@')[0] ||
        participant.id
      );
    },
    [],
  );

  const participantReplacements = useMemo(() => {
    if (!detail) {
      return [];
    }

    const unique = new Map<string, string>();
    const register = (participant?: HistoryParticipant | null) => {
      if (!participant?.id) {
        return;
      }
      const displayName = formatParticipantName(participant);
      unique.set(participant.id, displayName);
    };

    register(detail.summary.host);
    detail.summary.participants.forEach(register);

    return Array.from(unique.entries()).sort(
      (a, b) => b[0].length - a[0].length,
    );
  }, [detail, formatParticipantName]);

  const formatLogMessage = useCallback(
    (message: string) => {
      if (!message || participantReplacements.length === 0) {
        return message;
      }

      return participantReplacements.reduce((acc, [id, name]) => {
        if (!id || !name || id === name || !acc.includes(id)) {
          return acc;
        }
        return acc.split(id).join(name);
      }, message);
    },
    [participantReplacements],
  );

  const formatDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleString() : '-';
  }, []);

  return {
    selectedEntry,
    detail,
    detailLoading,
    detailError,
    handleSelectEntry,
    handleCloseModal,
    formatParticipantName,
    formatLogMessage,
    formatDate,
    resetErrors,
  };
}
