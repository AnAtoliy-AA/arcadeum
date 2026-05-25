'use client';

import { useEffect, useRef } from 'react';
import { TranslationKey, useTranslation } from '@/shared/lib/useTranslation';
import { LoadingState, EmptyState, ErrorState, Spinner } from '@/shared/ui';
import type { HistorySummary, HistoryParticipant } from '../types';
import { HistoryCard } from './HistoryCard';
import { EntriesGrid, PaginationSpinner, EndOfListText } from '../styles';
import { TamaguiElement } from 'tamagui';

interface HistoryListProps {
  entries: HistorySummary[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasFilters: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
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
  hasNextPage,
  isFetchingNextPage,
  onRetry,
  onLoadMore,
  onSelectEntry,
  formatParticipantName,
  formatDate,
}: HistoryListProps) {
  const { t } = useTranslation();
  const observerTarget = useRef<TamaguiElement & Element>(null);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (loading && entries.length === 0) {
    return <LoadingState message={t('history.loading')} />;
  }

  if (error && entries.length === 0) {
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

      {hasNextPage || isFetchingNextPage ? (
        <PaginationSpinner ref={observerTarget}>
          {isFetchingNextPage && <Spinner size="md" />}
        </PaginationSpinner>
      ) : entries.length > 0 ? (
        <EndOfListText>
          {t('history.list.noMoreEntries' as TranslationKey) ||
            'No more entries to show'}
        </EndOfListText>
      ) : null}
    </EntriesGrid>
  );
}
