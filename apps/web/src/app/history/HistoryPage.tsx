"use client";

import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { useHistoryFetch, useHistoryDetail, useHistoryActions } from "./hooks";
import { HistoryHeader, HistoryFilters, HistoryList, HistoryDetailModal } from "./components";
import { Page, Container } from "./styles";

export function HistoryPage() {
  const { snapshot } = useSessionTokens();
  const currentUserId = snapshot.userId ?? "";

  // Data fetching
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
  } = useHistoryFetch({
    accessToken: snapshot.accessToken,
  });

  // Detail modal
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

  // Actions (rematch, remove)
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
    onRefresh: () => fetchHistory(1, false),
  });

  const isHost = detail?.summary.host.id === currentUserId;
  const hasFilters = Boolean(searchQuery || statusFilter !== "all");

  return (
    <>
      <Page>
        <Container>
          <HistoryHeader
            loading={loading}
            refreshing={refreshing}
            onRefresh={refresh}
          />

          <HistoryFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
          />

          <HistoryList
            entries={entries}
            loading={loading}
            error={error}
            isAuthenticated={Boolean(snapshot.accessToken)}
            hasFilters={hasFilters}
            onRetry={() => fetchHistory(1, false)}
            onSelectEntry={handleSelectEntry}
            formatParticipantName={formatParticipantName}
            formatDate={formatDate}
          />
        </Container>
      </Page>

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
