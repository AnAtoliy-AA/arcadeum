"use client";

import { useTranslation } from "@/shared/lib/useTranslation";
import type { HistorySummary, HistoryParticipant } from "../types";
import { HistoryCard } from "./HistoryCard";
import {
  Loading,
  Spinner,
  Empty,
  ErrorContainer,
  ErrorText,
  RetryButton,
  EntriesGrid,
} from "../styles";

interface HistoryListProps {
  entries: HistorySummary[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasFilters: boolean;
  onRetry: () => void;
  onSelectEntry: (entry: HistorySummary) => void;
  formatParticipantName: (participant: HistoryParticipant | undefined | null) => string;
  formatDate: (dateString: string | null | undefined) => string;
}

export function HistoryList({
  entries,
  loading,
  error,
  isAuthenticated,
  hasFilters,
  onRetry,
  onSelectEntry,
  formatParticipantName,
  formatDate,
}: HistoryListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Loading>
        <Spinner aria-label={t("history.loading")} />
        <div>{t("history.loading")}</div>
      </Loading>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
        <RetryButton onClick={onRetry}>
          {t("history.actions.retry")}
        </RetryButton>
      </ErrorContainer>
    );
  }

  if (entries.length === 0) {
    return (
      <Empty>
        {isAuthenticated
          ? hasFilters
            ? t("history.search.noResults")
            : t("history.list.emptyNoEntries")
          : t("history.list.emptySignedOut")}
      </Empty>
    );
  }

  return (
    <EntriesGrid>
      {entries.map((entry) => (
        <HistoryCard
          key={entry.roomId}
          entry={entry}
          onSelect={onSelectEntry}
          formatParticipantName={formatParticipantName}
          formatDate={formatDate}
        />
      ))}
    </EntriesGrid>
  );
}
