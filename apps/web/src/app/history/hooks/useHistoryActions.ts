import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";
import type { HistoryDetail } from "../types";

interface UseHistoryActionsOptions {
  detail: HistoryDetail | null;
  accessToken: string | null;
  currentUserId: string;
  onClose: () => void;
  onRefresh: () => Promise<void>;
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

  // Participant selection
  const [participantSelection, setParticipantSelection] = useState<Record<string, boolean>>({});

  // Rematch state
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);

  // Remove state
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const resetErrors = useCallback(() => {
    setRematchError(null);
    setRemoveError(null);
    setShowRemoveConfirm(false);
  }, []);

  // Initialize participant selection when detail changes
  useEffect(() => {
    if (!detail) {
      setParticipantSelection({});
      return;
    }

    const nextSelection: Record<string, boolean> = {};
    detail.summary.participants.forEach((participant) => {
      if (participant.id !== currentUserId) {
        nextSelection[participant.id] = true;
      }
    });
    setParticipantSelection(nextSelection);
  }, [detail, currentUserId]);

  const handleToggleParticipant = useCallback((id: string, value: boolean) => {
    setParticipantSelection((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleStartRematch = useCallback(async () => {
    if (!detail || !accessToken) {
      setRematchError(t("history.errors.authRequired"));
      return;
    }

    const consenting = Object.entries(participantSelection)
      .filter(([, include]) => include)
      .map(([id]) => id);

    if (!consenting.length) {
      setRematchError(t("history.errors.rematchMinimum"));
      return;
    }

    try {
      setRematchLoading(true);
      setRematchError(null);
      const url = resolveApiUrl(`/games/history/${encodeURIComponent(detail.summary.roomId)}/rematch`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ participantIds: consenting }),
      });

      if (!response.ok) {
        throw new Error("Failed to create rematch");
      }

      const data = await response.json();
      onClose();
      await onRefresh();
      router.push(`/games/rooms/${data.room.id}`);
    } catch (err) {
      setRematchError(err instanceof Error ? err.message : String(err));
    } finally {
      setRematchLoading(false);
    }
  }, [detail, accessToken, participantSelection, t, onClose, onRefresh, router]);

  const confirmRemoveFromHistory = useCallback(async () => {
    if (!detail || !accessToken) {
      setRemoveError(t("history.errors.authRequired"));
      return;
    }

    try {
      setRemoveLoading(true);
      setRemoveError(null);
      const url = resolveApiUrl(`/games/history/${encodeURIComponent(detail.summary.roomId)}`);
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove from history");
      }

      onClose();
      await onRefresh();
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : t("history.errors.removeFailed"));
    } finally {
      setRemoveLoading(false);
    }
  }, [detail, accessToken, t, onClose, onRefresh]);

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
