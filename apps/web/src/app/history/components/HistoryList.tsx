'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { LoadingState, EmptyState, ErrorState } from '@/shared/ui';
import type { HistorySummary, HistoryParticipant } from '../types';
import { HistoryCard } from './HistoryCard';
import { EntriesGrid } from '../styles';

interface HistoryListProps {
  entries: HistorySummary[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasFilters: boolean;
  onRetry: () => void;
  onSelectEntry: (entry: HistorySummary) => void;
  formatParticipantName: (
    participant: HistoryParticipant | undefined | null,
  ) => string;
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
    return <LoadingState message={t('history.loading')} />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={onRetry}
        retryLabel={t('history.actions.retry')}
      />
    );
  }

  if (entries.length === 0) {
    const message = isAuthenticated
      ? hasFilters
        ? t('history.search.noResults')
        : t('history.list.emptyNoEntries')
      : t('history.list.emptySignedOut');

    return <EmptyState message={message} icon="📋" />;
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
