"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";

export function HistoryPage() {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [entries, setEntries] = useState<HistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Detail modal state
  const [selectedEntry, setSelectedEntry] = useState<HistorySummary | null>(null);
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Rematch state
  const [participantSelection, setParticipantSelection] = useState<Record<string, boolean>>({});
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);

  // Remove state
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const currentUserId = snapshot.userId ?? "";
  const isHost = detail?.summary.host.id === currentUserId;

  const fetchHistory = useCallback(
    async (page = 1, append = false) => {
      if (!snapshot.accessToken) {
        setLoading(false);
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const url = resolveApiUrl(`/games/history?${params.toString()}`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await response.json();
        const newEntries = data.entries || [];

        if (append) {
          setEntries((prev) => [...prev, ...newEntries]);
        } else {
          setEntries(newEntries);
        }

        setTotalCount(data.total || 0);
        setCurrentPage(page);
        const nextHasMore =
          typeof data.hasMore === "boolean"
            ? data.hasMore
            : newEntries.length === pageSize;
        setHasMore(nextHasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [snapshot.accessToken, pageSize, searchQuery, statusFilter]
  );

  const refresh = useCallback(async () => {
    if (!snapshot.accessToken) {
      return;
    }
    setRefreshing(true);
    setCurrentPage(1);
    await fetchHistory(1, false);
    setRefreshing(false);
  }, [snapshot.accessToken, fetchHistory]);

  useEffect(() => {
    setCurrentPage(1);
    fetchHistory(1, false);
  }, [fetchHistory]);

  const handleSelectEntry = useCallback(
    async (entry: HistorySummary) => {
      setSelectedEntry(entry);
      setDetail(null);
      setDetailError(null);
      setRematchError(null);
      setRemoveError(null);
      setShowRemoveConfirm(false);

      if (!snapshot.accessToken) {
        setDetailError(t("history.errors.authRequired"));
        return;
      }

      try {
        setDetailLoading(true);
        const url = resolveApiUrl(`/games/history/${encodeURIComponent(entry.roomId)}`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${snapshot.accessToken}`,
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
    [snapshot.accessToken, t]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
    setDetail(null);
    setDetailError(null);
    setParticipantSelection({});
    setRematchError(null);
    setRemoveError(null);
    setShowRemoveConfirm(false);
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
    if (!detail || !snapshot.accessToken) {
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
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
        body: JSON.stringify({ participantIds: consenting }),
      });

      if (!response.ok) {
        throw new Error("Failed to create rematch");
      }

      const data = await response.json();
      handleCloseModal();
      await fetchHistory();
      router.push(`/games/rooms/${data.room.id}`);
    } catch (err) {
      setRematchError(err instanceof Error ? err.message : String(err));
    } finally {
      setRematchLoading(false);
    }
  }, [detail, snapshot.accessToken, participantSelection, t, handleCloseModal, fetchHistory, router]);

  const confirmRemoveFromHistory = useCallback(async () => {
    if (!detail || !snapshot.accessToken) {
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
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove from history");
      }

      handleCloseModal();
      await fetchHistory();
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : t("history.errors.removeFailed"));
    } finally {
      setRemoveLoading(false);
    }
  }, [detail, snapshot.accessToken, t, handleCloseModal, fetchHistory]);

  const formatParticipantName = useCallback((participant: HistoryParticipant) => {
    return participant.username || participant.email?.split("@")[0] || participant.id;
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing || loadingMore) {
      return;
    }
    await fetchHistory(currentPage + 1, true);
  }, [hasMore, loading, refreshing, loadingMore, currentPage, fetchHistory]);

  return (
    <>
      <Page>
        <Container>
          <Header>
            <Title>{t("navigation.historyTab")}</Title>
            <RefreshButton
              onClick={refresh}
              disabled={loading || refreshing}
              aria-label={t("history.actions.refresh")}
            >
              <RefreshIcon $spinning={refreshing}>↻</RefreshIcon>
              {t("history.actions.refresh")}
            </RefreshButton>
          </Header>

          <FilterBar>
            <SearchInput
              type="text"
              placeholder={t("history.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t("history.search.label")}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t("history.filter.label")}
            >
              <option value="all">{t("history.filter.all")}</option>
              <option value="lobby">{t("history.status.lobby")}</option>
              <option value="in_progress">{t("history.status.inProgress")}</option>
              <option value="completed">{t("history.status.completed")}</option>
              <option value="waiting">{t("history.status.waiting")}</option>
              <option value="active">{t("history.status.active")}</option>
            </FilterSelect>
            {(searchQuery || statusFilter !== "all") && (
              <ClearFiltersButton onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                {t("history.filter.clear")}
              </ClearFiltersButton>
            )}
          </FilterBar>

          {loading ? (
            <Loading>
              <Spinner aria-label={t("history.loading")} />
              <div>{t("history.loading")}</div>
            </Loading>
          ) : error ? (
            <ErrorContainer>
              <ErrorText>{error}</ErrorText>
              <RetryButton onClick={() => fetchHistory(1, false)}>
                {t("history.actions.retry")}
              </RetryButton>
            </ErrorContainer>
          ) : entries.length === 0 ? (
            <Empty>
              {snapshot.accessToken
                ? (searchQuery || statusFilter !== "all")
                  ? t("history.search.noResults")
                  : t("history.list.emptyNoEntries")
                : t("history.list.emptySignedOut")}
            </Empty>
          ) : (
            <>
              <ResultsInfo>
                {t("history.pagination.showing", {
                  count: String(entries.length),
                  total: String(totalCount || entries.length),
                })}
              </ResultsInfo>
              <EntriesGrid>
                {entries.map((entry) => (
                  <EntryCard key={entry.roomId} onClick={() => handleSelectEntry(entry)}>
                    <EntryHeader>
                      <EntryGameName>{entry.roomName}</EntryGameName>
                      <EntryStatus>
                        {t(`history.status.${entry.status}`) || entry.status}
                      </EntryStatus>
                    </EntryHeader>
                    <EntryMeta>
                      {entry.participants
                        .filter((p) => p.id !== currentUserId)
                        .map((p) => formatParticipantName(p))
                        .join(", ") || formatParticipantName(entry.host)}
                    </EntryMeta>
                    <EntryFooter>
                      <EntryTimestamp>
                        {new Date(entry.lastActivityAt).toLocaleString()}
                      </EntryTimestamp>
                      <EntryViewDetails>{t("history.actions.viewDetails")} →</EntryViewDetails>
                    </EntryFooter>
                  </EntryCard>
                ))}
              </EntriesGrid>
              {hasMore && (
                <LoadMoreContainer>
                  <LoadMoreButton
                    onClick={loadMore}
                    disabled={loadingMore}
                    aria-busy={loadingMore}
                  >
                    {loadingMore
                      ? t("history.pagination.loading")
                      : t("history.pagination.loadMore")}
                  </LoadMoreButton>
                </LoadMoreContainer>
              )}
            </>
          )}
        </Container>
      </Page>

      {selectedEntry && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <BackButton onClick={handleCloseModal}>
                ← {t("history.detail.backToList")}
              </BackButton>
              <ModalTitle>{selectedEntry.roomName}</ModalTitle>
            </ModalHeader>

            {detailLoading ? (
              <ModalLoading>
                <Spinner />
                <div>{t("history.detail.loading")}</div>
              </ModalLoading>
            ) : detailError ? (
              <ModalError>
                <ErrorText>{detailError}</ErrorText>
              </ModalError>
            ) : detail ? (
              <ModalBody>
                <DetailTimestamp>
                  {t("history.detail.lastActivity", {
                    timestamp: new Date(detail.summary.lastActivityAt).toLocaleString(),
                  })}
                </DetailTimestamp>

                {isHost && (
                  <Section>
                    <SectionTitle>{t("history.detail.rematchTitle")}</SectionTitle>
                    <SectionDescription>
                      {t("history.detail.rematchDescription")}
                    </SectionDescription>
                    {rematchError && <ErrorText>{rematchError}</ErrorText>}
                    <ActionButton
                      onClick={handleStartRematch}
                      disabled={rematchLoading}
                      $primary
                    >
                      {rematchLoading ? t("history.detail.rematchCreating") : t("history.detail.rematchAction")}
                    </ActionButton>
                  </Section>
                )}

                <Section>
                  <SectionTitle>{t("history.detail.participantsTitle")}</SectionTitle>
                  {detail.summary.participants.map((participant) => (
                    <ParticipantRow key={participant.id}>
                      <ParticipantInfo>
                        <ParticipantIcon $isHost={participant.isHost}>
                          {participant.isHost ? "👑" : "👤"}
                        </ParticipantIcon>
                        <ParticipantName>{formatParticipantName(participant)}</ParticipantName>
                        {participant.isHost && (
                          <HostBadge>{t("history.detail.hostLabel")}</HostBadge>
                        )}
                      </ParticipantInfo>
                      {isHost && participant.id !== currentUserId && (
                        <Checkbox
                          type="checkbox"
                          checked={participantSelection[participant.id] ?? false}
                          onChange={(e) =>
                            handleToggleParticipant(participant.id, e.target.checked)
                          }
                        />
                      )}
                    </ParticipantRow>
                  ))}
                </Section>

                <Section>
                  <SectionTitle>{t("history.detail.logsTitle")}</SectionTitle>
                  {detail.logs.length === 0 ? (
                    <Empty>{t("history.detail.noLogs")}</Empty>
                  ) : (
                    detail.logs.map((log) => (
                      <LogItem key={log.id}>
                        <LogHeader>
                          <LogTimestamp>
                            {new Date(log.createdAt).toLocaleString()}
                          </LogTimestamp>
                          <LogScope>
                            {log.scope === "players"
                              ? t("history.detail.scopePlayers")
                              : t("history.detail.scopeAll")}
                          </LogScope>
                        </LogHeader>
                        {log.sender && (
                          <LogSender>
                            {t("history.detail.sender", {
                              name: formatParticipantName(log.sender),
                            })}
                          </LogSender>
                        )}
                        <LogMessage>{log.message}</LogMessage>
                      </LogItem>
                    ))
                  )}
                </Section>

                <Section>
                  <SectionTitle>{t("history.detail.removeTitle")}</SectionTitle>
                  <SectionDescription>
                    {t("history.detail.removeDescription")}
                  </SectionDescription>
                  {removeError && <ErrorText>{removeError}</ErrorText>}
                  {showRemoveConfirm ? (
                    <ConfirmRow>
                      <ActionButton onClick={() => setShowRemoveConfirm(false)}>
                        {t("history.detail.removeCancel")}
                      </ActionButton>
                      <ActionButton
                        onClick={confirmRemoveFromHistory}
                        disabled={removeLoading}
                        $danger
                      >
                        {removeLoading ? t("history.detail.removeRemoving") : t("history.detail.removeConfirm")}
                      </ActionButton>
                    </ConfirmRow>
                  ) : (
                    <ActionButton
                      onClick={() => setShowRemoveConfirm(true)}
                      $danger
                    >
                      {t("history.detail.removeAction")}
                    </ActionButton>
                  )}
                </Section>
              </ModalBody>
            ) : null}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

// Types

interface HistoryParticipant {
  id: string;
  username: string;
  email: string | null;
  isHost: boolean;
}

interface HistorySummary {
  roomId: string;
  sessionId: string | null;
  gameId: string;
  roomName: string;
  status: "lobby" | "in_progress" | "completed" | "waiting" | "active";
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string;
  host: HistoryParticipant;
  participants: HistoryParticipant[];
}

interface HistoryLogEntry {
  id: string;
  type: "system" | "action" | "message";
  message: string;
  createdAt: string;
  scope?: "all" | "players";
  sender?: HistoryParticipant;
}

interface HistoryDetail {
  summary: HistorySummary;
  logs: HistoryLogEntry[];
}

// Styles

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.9375rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
  }

  @media (max-width: 640px) {
    min-width: 100%;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.9375rem;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const ClearFiltersButton = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: transparent;
  color: ${({ theme }) => theme.text.muted};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background};
    border-color: ${({ theme }) => theme.text.muted};
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: transparent;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RefreshIcon = styled.span<{ $spinning: boolean }>`
  display: inline-block;
  font-size: 1.25rem;
  animation: ${({ $spinning }) => ($spinning ? "spin 1s linear infinite" : "none")};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EntriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
`;

const EntryCard = styled.button`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
  }
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const EntryGameName = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

const EntryStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
`;

const EntryMeta = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const EntryFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const EntryTimestamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
`;

const EntryViewDetails = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
`;

const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.surfaces.card.border};
  border-top-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Empty = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;

const ResultsInfo = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
  padding: 0.5rem 0;
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;

const LoadMoreButton = styled.button`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorContainer = styled.div`
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

const ErrorText = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: transparent;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.background.base};
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ModalLoading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
`;

const ModalError = styled.div`
  padding: 3rem;
  text-align: center;
`;

const DetailTimestamp = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const SectionDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const ParticipantRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const ParticipantIcon = styled.span<{ $isHost: boolean }>`
  font-size: 1.25rem;
`;

const ParticipantName = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

const HostBadge = styled.span`
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const LogItem = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const LogTimestamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
`;

const LogScope = styled.div`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.muted};
`;

const LogSender = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.muted};
`;

const LogMessage = styled.div`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text.primary};
`;

const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid
    ${({ theme, $primary, $danger }) =>
      $danger
        ? theme.text.muted
        : $primary
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ theme, $primary }) =>
    $primary ? theme.buttons.primary.gradientStart : "transparent"};
  color: ${({ theme, $primary, $danger }) =>
    $danger
      ? theme.text.muted
      : $primary
      ? theme.buttons.primary.text
      : theme.text.primary};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmRow = styled.div`
  display: flex;
  gap: 1rem;

  button {
    flex: 1;
  }
`;
