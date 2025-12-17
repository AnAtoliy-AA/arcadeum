import { useState, useCallback, useEffect, useMemo } from "react";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";
import type { HistorySummary, HistoryDetail, HistoryParticipant } from "../types";

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
  formatParticipantName: (participant: HistoryParticipant | undefined | null) => string;
  formatLogMessage: (message: string) => string;
  formatDate: (dateString: string | null | undefined) => string;
  resetErrors: () => void;
}

export function useHistoryDetail({
  accessToken,
}: UseHistoryDetailOptions): UseHistoryDetailResult {
  const { t } = useTranslation();
  const [selectedEntry, setSelectedEntry] = useState<HistorySummary | null>(null);
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const resetErrors = useCallback(() => {
    setDetailError(null);
  }, []);

  const handleSelectEntry = useCallback(
    async (entry: HistorySummary) => {
      setSelectedEntry(entry);
      setDetail(null);
      setDetailError(null);

      if (!accessToken) {
        setDetailError(t("history.errors.authRequired"));
        return;
      }

      try {
        setDetailLoading(true);
        const url = resolveApiUrl(`/games/history/${encodeURIComponent(entry.roomId)}`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setDetailError(t("history.errors.detailRemoved"));
          } else {
            throw new Error("Failed to fetch details");
          }
          return;
        }

        const data = await response.json();
        setDetail(data);
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : t("history.errors.detailFailed"));
      } finally {
        setDetailLoading(false);
      }
    },
    [accessToken, t]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
    setDetail(null);
    setDetailError(null);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedEntry) {
        handleCloseModal();
      }
    };

    if (selectedEntry) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [selectedEntry, handleCloseModal]);

  const formatParticipantName = useCallback((participant: HistoryParticipant | undefined | null) => {
    if (!participant) {
      return "";
    }
    return participant.username || participant.email?.split("@")[0] || participant.id;
  }, []);

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
      (a, b) => b[0].length - a[0].length
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
    [participantReplacements]
  );

  const formatDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleString() : "-";
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
