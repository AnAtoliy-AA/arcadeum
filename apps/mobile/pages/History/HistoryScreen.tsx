import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSessionTokens } from '@/stores/sessionTokens';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import { HistoryListItem } from '@/components/history/HistoryListItem';
import { HistoryFilterSection } from '@/components/history/HistoryFilterSection';
import { HistoryDetailModal } from '@/components/history/HistoryDetailModal';
import {
  fetchHistory,
  fetchHistoryDetail,
  requestRematch,
  removeHistoryEntry,
  ApiError,
  type HistoryDetail,
  type HistorySummary,
  type HistoryStatus,
  type FetchHistoryParams,
} from './api/historyApi';

type HistoryHookParams = {
  accessToken?: string | null;
  refreshTokens?: () => Promise<SessionTokensSnapshot>;
};

type ParticipantsSelection = Record<string, boolean>;

type UseHistoryListParams = HistoryHookParams & {
  searchQuery?: string;
  statusFilter?: HistoryStatus | 'all';
};

function useHistoryList(params: UseHistoryListParams) {
  const { accessToken, refreshTokens, searchQuery, statusFilter } = params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<HistorySummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOptions = useMemo(
    () => (refreshTokens ? { refreshTokens } : undefined),
    [refreshTokens],
  );

  const loadHistory = useCallback(
    async (page = 1, append = false) => {
      if (!accessToken) {
        setEntries([]);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setError(null);
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const historyParams: FetchHistoryParams = {
          page,
          limit: 20,
        };

        if (searchQuery && searchQuery.trim()) {
          historyParams.search = searchQuery.trim();
        }

        if (statusFilter && statusFilter !== 'all') {
          historyParams.status = statusFilter;
        }

        const data = await fetchHistory(accessToken, historyParams, fetchOptions);

        const deduplicate = (items: HistorySummary[]) => {
          const seen = new Set<string>();
          return items.filter((item) => {
            if (seen.has(item.roomId)) {
              return false;
            }
            seen.add(item.roomId);
            return true;
          });
        };

        if (append) {
          setEntries((prev) => deduplicate([...prev, ...data.entries]));
        } else {
          setEntries(deduplicate(data.entries));
        }

        setHasMore(data.hasMore);
        setCurrentPage(page);
        const totalRecords =
          typeof data.total === 'number' && Number.isFinite(data.total)
            ? data.total
            : data.entries.length;
        setTotalCount(totalRecords);
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
    [accessToken, fetchOptions, searchQuery, statusFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadHistory(1, false);
  }, [loadHistory]);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      setRefreshing(true);
      setCurrentPage(1);
      await loadHistory(1, false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRefreshing(false);
    }
  }, [accessToken, loadHistory]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) {
      return;
    }
    await loadHistory(currentPage + 1, true);
  }, [hasMore, loadingMore, loading, currentPage, loadHistory]);

  const reload = useCallback(() => loadHistory(1, false), [loadHistory]);

  return {
    loading,
    refreshing,
    loadingMore,
    entries,
    error,
    refresh,
    reload,
    loadMore,
    hasMore,
    totalCount,
    fetchOptions,
  };
}

export default function HistoryScreen() {
  const styles = useThemedStyles(createStyles);
  const insetStyles = useSafeAreaInsets();
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();
  const accessToken = tokens.accessToken;
  const currentUserId = tokens.userId ?? '';
  const { t } = useTranslation();
  const { shouldBlock, isAuthenticated } = useSessionScreenGate({
    whenUnauthenticated: '/auth',
    enableOn: ['web'],
    blockWhenUnauthenticated: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<HistoryStatus | 'all'>('all');

  const {
    loading,
    refreshing,
    loadingMore,
    entries,
    error,
    refresh,
    reload,
    loadMore,
    hasMore,
    totalCount,
    fetchOptions,
  } = useHistoryList({ accessToken, refreshTokens, searchQuery, statusFilter });

  const mutedTextColor = useThemeColor({}, 'icon') as string;
  const tintColor = useThemeColor({}, 'tint') as string;
  const buttonTextColor = useThemeColor({}, 'background') as string;
  const dangerColor = useThemeColor({}, 'error') as string;

  const [selectedSummary, setSelectedSummary] = useState<HistorySummary | null>(
    null,
  );
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailErrorNeedsRefresh, setDetailErrorNeedsRefresh] = useState(false);
  const [participantSelection, setParticipantSelection] =
    useState<ParticipantsSelection>({});
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const isHost = detail?.summary?.host?.id === currentUserId;

  const handleCloseModal = useCallback(() => {
    setSelectedSummary(null);
    setDetail(null);
    setDetailError(null);
    setDetailErrorNeedsRefresh(false);
    setParticipantSelection({});
    setRematchError(null);
    setRemoveError(null);
    setRemoveLoading(false);
  }, []);

  const handleSelectEntry = useCallback(
    async (entry: HistorySummary) => {
      setSelectedSummary(entry);
      setDetail(null);
      setDetailError(null);
      setDetailErrorNeedsRefresh(false);
      setParticipantSelection({});
      setRematchError(null);
      setRemoveError(null);
      setRemoveLoading(false);

      if (!accessToken) {
        setDetailError(t('history.errors.authRequired'));
        return;
      }

      try {
        setDetailLoading(true);
        const result = await fetchHistoryDetail(
          entry.roomId,
          accessToken,
          fetchOptions,
        );
        setDetail(result);
        setDetailErrorNeedsRefresh(false);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setDetailError(t('history.errors.detailRemoved'));
          setDetailErrorNeedsRefresh(true);
        } else {
          setDetailError(
            err instanceof Error
              ? err.message
              : t('history.errors.detailFailed'),
          );
          setDetailErrorNeedsRefresh(false);
        }
      } finally {
        setDetailLoading(false);
      }
    },
    [accessToken, fetchOptions, t],
  );

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) {
        return;
      }

      void reload();
    }, [accessToken, reload]),
  );

  useEffect(() => {
    if (!detail?.summary) {
      setParticipantSelection({});
      return;
    }

    const nextSelection: ParticipantsSelection = {};
    detail.summary.participants.forEach((participant) => {
      if (participant.id !== currentUserId) {
        nextSelection[participant.id] = true;
      }
    });
    setParticipantSelection(nextSelection);
  }, [detail, currentUserId]);

  const handleToggleParticipant = useCallback((id: string, value: boolean) => {
    setParticipantSelection((previous) => ({ ...previous, [id]: value }));
  }, []);

  const handleStartRematch = useCallback(async () => {
    if (!detail?.summary || !accessToken) {
      setRematchError(t('history.errors.authRequired'));
      return;
    }

    const consenting = Object.entries(participantSelection)
      .filter(([, include]) => include)
      .map(([id]) => id);

    if (!consenting.length) {
      setRematchError(t('history.errors.rematchMinimum'));
      return;
    }

    try {
      setRematchLoading(true);
      setRematchError(null);
      const response = await requestRematch(
        detail.summary.roomId,
        { participantIds: consenting },
        accessToken,
        fetchOptions,
      );
      handleCloseModal();
      await reload();
      router.push({
        pathname: '/games/rooms/[id]',
        params: { id: response.room.id },
      });
    } catch (err) {
      setRematchError(err instanceof Error ? err.message : String(err));
    } finally {
      setRematchLoading(false);
    }
  }, [
    detail,
    accessToken,
    participantSelection,
    fetchOptions,
    router,
    t,
    handleCloseModal,
    reload,
  ]);

  const confirmRemoveFromHistory = useCallback(async () => {
    if (!detail?.summary || !accessToken) {
      setRemoveError(t('history.errors.authRequired'));
      return;
    }

    try {
      setRemoveLoading(true);
      setRemoveError(null);
      await removeHistoryEntry(
        detail.summary.roomId,
        accessToken,
        fetchOptions,
      );
      handleCloseModal();
      await reload();
    } catch (err) {
      setRemoveError(
        err instanceof Error ? err.message : t('history.errors.removeFailed'),
      );
    } finally {
      setRemoveLoading(false);
    }
  }, [detail, accessToken, fetchOptions, handleCloseModal, reload, t]);

  const handleRemoveRequest = useCallback(() => {
    if (!detail?.summary || removeLoading) {
      return;
    }

    Alert.alert(
      t('history.detail.removeTitle'),
      t('history.detail.removeDescription'),
      [
        {
          text: t('history.detail.removeCancel'),
          style: 'cancel',
        },
        {
          text: t('history.detail.removeConfirm'),
          style: 'destructive',
          onPress: () => {
            void confirmRemoveFromHistory();
          },
        },
      ],
    );
  }, [detail, removeLoading, t, confirmRemoveFromHistory]);

  const handleRefreshHistoryAfterRemoval = useCallback(() => {
    handleCloseModal();
    void reload();
  }, [handleCloseModal, reload]);

  const handleManualRefresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }
    void reload();
  }, [loading, refreshing, reload]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      void loadMore();
    }
  }, [hasMore, loadingMore, loading, loadMore]);

  const renderItem = useCallback(
    ({ item }: { item: HistorySummary }) => (
      <HistoryListItem
        item={item}
        onSelect={handleSelectEntry}
        currentUserId={currentUserId}
        mutedTextColor={mutedTextColor}
        tintColor={tintColor}
        t={t}
      />
    ),
    [handleSelectEntry, currentUserId, mutedTextColor, tintColor, t],
  );

  const keyExtractor = useCallback((item: HistorySummary) => item.roomId, []);

  const emptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator />
          <ThemedText style={styles.placeholderText}>
            {t('common.loading')}
          </ThemedText>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={reload}>
            <ThemedText style={styles.retryText}>
              {t('common.retry')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    if (!isAuthenticated) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.placeholderText}>
            {t('history.list.emptySignedOut')}
          </ThemedText>
        </View>
      );
    }
    if (entries.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.placeholderText}>
            {t('history.list.emptyNoEntries')}
          </ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.placeholderText}>
          {t('history.search.noResults')}
        </ThemedText>
      </View>
    );
  }, [loading, error, entries.length, styles, t, isAuthenticated, reload]);

  if (shouldBlock) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ThemedView
          style={[
            styles.loadingContainer,
            { paddingBottom: insetStyles.bottom },
          ]}
        >
          <ActivityIndicator size="large" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ThemedView
        style={[styles.container, { paddingBottom: insetStyles.bottom }]}
      >
        <FlatList
          data={entries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <HistoryFilterSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              loading={loading}
              refreshing={refreshing}
              handleManualRefresh={handleManualRefresh}
              totalCount={totalCount}
              entriesLength={entries.length}
              t={t}
              mutedTextColor={mutedTextColor}
              tintColor={tintColor}
            />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={emptyComponent}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" />
                <ThemedText style={styles.footerLoadingText}>
                  {t('history.pagination.loading')}
                </ThemedText>
              </View>
            ) : hasMore && entries.length > 0 ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                <ThemedText style={styles.loadMoreText}>
                  {t('history.pagination.loadMore')}
                </ThemedText>
              </TouchableOpacity>
            ) : null
          }
        />
      </ThemedView>
      <HistoryDetailModal
        visible={Boolean(selectedSummary)}
        onClose={handleCloseModal}
        selectedSummary={selectedSummary}
        detail={detail}
        detailLoading={detailLoading}
        detailError={detailError}
        detailErrorNeedsRefresh={detailErrorNeedsRefresh}
        onRefreshHistoryAfterRemoval={handleRefreshHistoryAfterRemoval}
        isHost={isHost}
        rematchError={rematchError}
        rematchLoading={rematchLoading}
        onStartRematch={handleStartRematch}
        participantSelection={participantSelection}
        onToggleParticipant={handleToggleParticipant}
        removeError={removeError}
        removeLoading={removeLoading}
        onRemoveRequest={handleRemoveRequest}
        currentUserId={currentUserId}
        mutedTextColor={mutedTextColor}
        tintColor={tintColor}
        buttonTextColor={buttonTextColor}
        dangerColor={dangerColor}
        t={t}
        onSettingsPress={() => {}}
        settingsDisabled={true}
      />
    </SafeAreaView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
    listContent: {
      paddingVertical: 16,
      gap: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      gap: 12,
    },
    placeholderText: {
      fontSize: 14,
      color: palette.icon,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: palette.error,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
    },
    retryText: {
      color: palette.tint,
      fontSize: 14,
      fontWeight: '600',
    },
    footerLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
    },
    footerLoadingText: {
      fontSize: 13,
      color: palette.icon,
    },
    loadMoreButton: {
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.tint,
    },
  });
}
