'use client';

import { useRouter } from 'next/navigation';
import {
  Button,
  EmptyState,
  Section,
  PageLayout,
  Container,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useHistoryFetch, useHistoryDetail, useHistoryActions } from './hooks';
import {
  HistoryHeader,
  HistoryFilters,
  HistoryList,
  HistoryDetailModal,
} from './components';
import { HistorySummary } from './types';

export interface HistoryPageProps {
  initialData?:
    | {
        entries: HistorySummary[];
        total: number;
        hasMore: boolean;
        page: number;
      }
    | undefined;
}

export default function HistoryPage({ initialData }: HistoryPageProps) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const currentUserId = snapshot.userId ?? '';

  const {
    entries,
    loading,
    refreshing,
    error,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    fetchHistory,
    refresh,
    hasMore,
    loadingMore,
    loadMore,
  } = useHistoryFetch({
    accessToken: snapshot.accessToken,
    initialData,
  });

  const {
    selectedEntry,
    detail,
    detailLoading,
    detailError,
    handleSelectEntry,
    handleCloseModal,
    formatParticipantName,
    formatLogMessage,
    formatDate,
  } = useHistoryDetail({
    accessToken: snapshot.accessToken,
  });

  const {
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
  } = useHistoryActions({
    detail,
    accessToken: snapshot.accessToken,
    currentUserId,
    onClose: handleCloseModal,
    onRefresh: () => fetchHistory(0, false),
  });

  if (!snapshot.accessToken) {
    return (
      <PageLayout>
        <Container size="xl" gap="$5" ai="center" jc="center" p="$10" flex={1}>
          <EmptyState
            icon="🔒"
            message={
              t('history.loginRequired') || 'Login required to view history'
            }
          />
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/auth')}
          >
            Log In
          </Button>
        </Container>
      </PageLayout>
    );
  }

  const isHost = detail?.summary.host.id === currentUserId;
  const hasFilters = Boolean(searchQuery || statusFilter !== 'all');

  return (
    <>
      <PageLayout>
        <Container size="xl" gap="$5">
          <HistoryHeader
            loading={loading}
            refreshing={refreshing}
            onRefresh={refresh}
          />

          <Section
            title={t('history.filters.title')}
            description={t('history.filters.description')}
          >
            <HistoryFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
            />
          </Section>

          <HistoryList
            entries={entries}
            loading={loading}
            hasNextPage={hasMore}
            isFetchingNextPage={loadingMore}
            onLoadMore={loadMore}
            error={error}
            isAuthenticated={Boolean(snapshot.accessToken)}
            hasFilters={hasFilters}
            onRetry={() => fetchHistory(0, false)}
            onSelectEntry={handleSelectEntry}
            formatParticipantName={formatParticipantName}
            formatDate={formatDate}
          />
        </Container>
      </PageLayout>

      {selectedEntry && (
        <HistoryDetailModal
          selectedEntry={selectedEntry}
          detail={detail}
          detailLoading={detailLoading}
          detailError={detailError}
          isHost={isHost}
          currentUserId={currentUserId}
          participantSelection={participantSelection}
          rematchLoading={rematchLoading}
          rematchError={rematchError}
          removeLoading={removeLoading}
          removeError={removeError}
          showRemoveConfirm={showRemoveConfirm}
          onClose={handleCloseModal}
          onToggleParticipant={handleToggleParticipant}
          onStartRematch={handleStartRematch}
          onRemove={confirmRemoveFromHistory}
          onSetShowRemoveConfirm={setShowRemoveConfirm}
          formatParticipantName={formatParticipantName}
          formatLogMessage={formatLogMessage}
          formatDate={formatDate}
        />
      )}
    </>
  );
}
