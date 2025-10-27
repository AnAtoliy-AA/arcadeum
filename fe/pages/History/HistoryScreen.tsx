import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSessionTokens } from '@/stores/sessionTokens';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n/messages';
import { gamesCatalog } from '@/pages/GamesScreen/catalog';
import {
  fetchHistory,
  fetchHistoryDetail,
  requestRematch,
  type HistoryDetail,
  type HistorySummary,
} from './api/historyApi';

type HistoryHookParams = {
  accessToken?: string | null;
  refreshTokens?: () => Promise<SessionTokensSnapshot>;
};

type ParticipantsSelection = Record<string, boolean>;

const STATUS_TRANSLATION_KEYS: Record<HistorySummary['status'], TranslationKey> = {
  lobby: 'history.status.lobby',
  in_progress: 'history.status.inProgress',
  completed: 'history.status.completed',
  waiting: 'history.status.waiting',
  active: 'history.status.active',
};

const gameNameLookup = new Map(gamesCatalog.map((game) => [game.id, game.name]));

function resolveGameName(gameId: string): string | undefined {
  const trimmed = gameId.trim();
  if (!trimmed) {
    return undefined;
  }
  return gameNameLookup.get(trimmed);
}

function useHistoryList(params: HistoryHookParams) {
  const { accessToken, refreshTokens } = params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<HistorySummary[]>([]);

  const fetchOptions = useMemo(
    () => (refreshTokens ? { refreshTokens } : undefined),
    [refreshTokens],
  );

  const loadHistory = useCallback(async () => {
    if (!accessToken) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchHistory(accessToken, fetchOptions);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchOptions]);

  useEffect(() => {
    if (accessToken) {
      loadHistory();
    } else {
      setLoading(false);
      setEntries([]);
    }
  }, [accessToken, loadHistory]);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      setRefreshing(true);
      const data = await fetchHistory(accessToken, fetchOptions);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRefreshing(false);
    }
  }, [accessToken, fetchOptions]);

  return {
    loading,
    refreshing,
    entries,
    error,
    refresh,
    reload: loadHistory,
    fetchOptions,
  };
}

function formatParticipantDisplayName(id: string, username: string | null | undefined) {
  return username?.trim().length ? username : id;
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

  const {
    loading,
    refreshing,
    entries,
    error,
    refresh,
    reload,
    fetchOptions,
  } = useHistoryList({ accessToken, refreshTokens });

  const mutedTextColor = useThemeColor({}, 'icon') as string;
  const tintColor = useThemeColor({}, 'tint') as string;
  const buttonTextColor = useThemeColor({}, 'background') as string;

  const [selectedSummary, setSelectedSummary] = useState<HistorySummary | null>(null);
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [participantSelection, setParticipantSelection] = useState<ParticipantsSelection>({});
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);

  const isHost = detail?.summary.host.id === currentUserId;

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.navigate('/');
  }, [router]);

  const handleCloseModal = useCallback(() => {
    setSelectedSummary(null);
    setDetail(null);
    setDetailError(null);
    setParticipantSelection({});
    setRematchError(null);
  }, []);

  const handleSelectEntry = useCallback(
    async (entry: HistorySummary) => {
      setSelectedSummary(entry);
      setDetail(null);
      setDetailError(null);
      setParticipantSelection({});
      setRematchError(null);

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
      } catch (err) {
        setDetailError(
          err instanceof Error
            ? err.message
            : t('history.errors.detailFailed'),
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [accessToken, fetchOptions, t],
  );

  useEffect(() => {
    if (!detail) {
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
    if (!detail || !accessToken) {
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

  const renderItem = useCallback(
    ({ item }: { item: HistorySummary }) => {
      const statusLabel = t(STATUS_TRANSLATION_KEYS[item.status]);
      const displayName = resolveGameName(item.gameId) ?? t('history.unknownGame');
      const others = item.participants
        .filter((participant) => participant.id !== currentUserId)
        .map((participant) =>
          formatParticipantDisplayName(participant.id, participant.username),
        )
        .join(', ');
      const lastActivity = new Date(item.lastActivityAt).toLocaleString();

      return (
        <TouchableOpacity
          style={styles.entry}
          onPress={() => handleSelectEntry(item)}
        >
          <View style={styles.entryHeader}>
            <ThemedText style={styles.entryGameName} numberOfLines={1}>
              {displayName}
            </ThemedText>
            <ThemedText style={styles.entryStatus}>{statusLabel}</ThemedText>
          </View>
          <ThemedText style={styles.entryRoomName} numberOfLines={1}>
            {item.roomName}
          </ThemedText>
          <ThemedText style={styles.entryParticipants} numberOfLines={1}>
            {others ||
              formatParticipantDisplayName(item.host.id, item.host.username)}
          </ThemedText>
          <View style={styles.entryFooter}>
            <IconSymbol name="clock" size={14} color={mutedTextColor} />
            <ThemedText style={styles.entryTimestamp}>{lastActivity}</ThemedText>
          </View>
          <View style={styles.entryCTA}>
            <ThemedText style={styles.entryCTAtext}>
              {t('history.actions.viewDetails')}
            </ThemedText>
            <IconSymbol name="chevron.right" size={14} color={tintColor} />
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelectEntry, mutedTextColor, tintColor, styles, t, currentUserId],
  );

  const keyExtractor = useCallback((item: HistorySummary) => item.roomId, []);

  const emptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator />
          <ThemedText style={styles.placeholderText}>{t('common.loading')}</ThemedText>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={reload}>
            <ThemedText style={styles.retryText}>{t('common.retry')}</ThemedText>
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
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.placeholderText}>
          {t('history.list.emptyNoEntries')}
        </ThemedText>
      </View>
    );
  }, [loading, error, styles, t, isAuthenticated, reload]);

  if (shouldBlock) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={[styles.loadingContainer, { paddingBottom: insetStyles.bottom }]}>
          <ActivityIndicator size="large" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
  <ThemedView style={[styles.container, { paddingBottom: insetStyles.bottom }] }>
        <FlatList
          data={entries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <IconSymbol name="chevron.left" size={16} color={tintColor} />
                <ThemedText style={styles.backButtonLabel}>{t('common.back')}</ThemedText>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={emptyComponent}
        />
      </ThemedView>
      <Modal
        visible={Boolean(selectedSummary)}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={[styles.modalContainer, { paddingBottom: insetStyles.bottom }] }>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalBackButton} onPress={handleCloseModal}>
                <IconSymbol name="chevron.left" size={18} color={tintColor} />
                <ThemedText style={styles.modalBackLabel}>
                  {t('history.detail.backToList')}
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle} numberOfLines={2}>
                {selectedSummary
                  ? resolveGameName(selectedSummary.gameId) ?? t('history.unknownGame')
                  : ''}
              </ThemedText>
              <View style={styles.modalBackSpacer} />
            </View>
            {detailLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" />
                <ThemedText style={styles.placeholderText}>
                  {t('common.loading')}
                </ThemedText>
              </View>
            ) : detailError ? (
              <View style={styles.modalLoading}>
                <ThemedText style={styles.errorText}>{detailError}</ThemedText>
              </View>
            ) : detail ? (
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                <ThemedText style={styles.detailTimestamp}>
                  {t('history.detail.lastActivity', {
                    timestamp: new Date(detail.summary.lastActivityAt).toLocaleString(),
                  })}
                </ThemedText>

                {isHost ? (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.sectionTitle}>
                      {t('history.detail.rematchTitle')}
                    </ThemedText>
                    <ThemedText style={styles.sectionDescription}>
                      {t('history.detail.rematchDescription')}
                    </ThemedText>
                    {rematchError ? (
                      <ThemedText style={styles.errorText}>{rematchError}</ThemedText>
                    ) : null}
                    <TouchableOpacity
                      style={[
                        styles.rematchButton,
                        rematchLoading && styles.rematchButtonDisabled,
                      ]}
                      onPress={handleStartRematch}
                      disabled={rematchLoading}
                    >
                      {rematchLoading ? (
                        <ActivityIndicator size="small" color={buttonTextColor} />
                      ) : (
                        <>
                          <IconSymbol
                            name="arrow.counterclockwise"
                            size={16}
                            color={buttonTextColor}
                          />
                          <ThemedText style={styles.rematchButtonText}>
                            {t('history.detail.rematchAction')}
                          </ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>
                    {t('history.detail.participantsTitle')}
                  </ThemedText>
                  {detail.summary.participants.map((participant) => {
                    const name = formatParticipantDisplayName(
                      participant.id,
                      participant.username,
                    );
                    const hostBadge = participant.isHost
                      ? t('history.detail.hostLabel')
                      : null;
                    const canToggle =
                      isHost && participant.id !== currentUserId;

                    return (
                      <View style={styles.participantRow} key={participant.id}>
                        <View style={styles.participantInfo}>
                          <IconSymbol
                            name={participant.isHost ? 'crown.fill' : 'person.fill'}
                            size={18}
                            color={participant.isHost ? tintColor : mutedTextColor}
                          />
                          <ThemedText style={styles.participantName} numberOfLines={1}>
                            {name}
                          </ThemedText>
                          {hostBadge ? (
                            <ThemedText style={styles.hostBadge}>{hostBadge}</ThemedText>
                          ) : null}
                        </View>
                        {canToggle ? (
                          <Switch
                            value={participantSelection[participant.id] ?? false}
                            onValueChange={(value) => handleToggleParticipant(participant.id, value)}
                          />
                        ) : null}
                      </View>
                    );
                  })}
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>
                    {t('history.detail.logsTitle')}
                  </ThemedText>
                  {detail.logs.length === 0 ? (
                    <ThemedText style={styles.placeholderText}>
                      {t('history.detail.noLogs')}
                    </ThemedText>
                  ) : (
                    detail.logs.map((log) => (
                      <View style={styles.logItem} key={log.id}>
                        <View style={styles.logHeader}>
                          <ThemedText style={styles.logTimestamp}>
                            {new Date(log.createdAt).toLocaleString()}
                          </ThemedText>
                          <ThemedText style={styles.logScope}>
                            {log.scope === 'players'
                              ? t('history.detail.scopePlayers')
                              : t('history.detail.scopeAll')}
                          </ThemedText>
                        </View>
                        {log.sender ? (
                          <ThemedText style={styles.logSender}>
                            {t('history.detail.sender', {
                              name: formatParticipantDisplayName(
                                log.sender.id,
                                log.sender.username,
                              ),
                            })}
                          </ThemedText>
                        ) : null}
                        <ThemedText style={styles.logMessage}>{log.message}</ThemedText>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
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
    listHeader: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
    },
    backButtonLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.tint,
    },
    entry: {
      marginHorizontal: 16,
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      backgroundColor: palette.background,
      gap: 6,
    },
    entryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    entryGameName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    entryStatus: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.tint,
    },
    entryRoomName: {
      fontSize: 14,
      color: palette.text,
    },
    entryParticipants: {
      fontSize: 13,
      color: palette.icon,
    },
    entryFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    entryTimestamp: {
      fontSize: 12,
      color: palette.icon,
    },
    entryCTA: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
      marginTop: 8,
    },
    entryCTAtext: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.tint,
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
    modalSafeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: palette.background,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    modalCloseButton: {
      padding: 6,
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
    },
    modalBackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 4,
      minWidth: 32,
    },
    modalBackLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.tint,
    },
    modalBackSpacer: {
      width: 32,
      height: 32,
    },
    modalTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      paddingHorizontal: 12,
    },
    modalLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    modalScroll: {
      flex: 1,
    },
    modalScrollContent: {
      paddingBottom: 32,
    },
    modalSection: {
      marginBottom: 24,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    sectionDescription: {
      fontSize: 13,
      color: palette.icon,
    },
    participantRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      gap: 12,
    },
    participantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    participantName: {
      flex: 1,
      fontSize: 15,
      color: palette.text,
    },
    hostBadge: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.tint,
    },
    logItem: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
      paddingBottom: 12,
      marginBottom: 12,
      gap: 4,
    },
    logHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logTimestamp: {
      fontSize: 12,
      color: palette.icon,
    },
    logScope: {
      fontSize: 12,
      color: palette.icon,
    },
    logSender: {
      fontSize: 12,
      color: palette.icon,
    },
    logMessage: {
      fontSize: 14,
      color: palette.text,
    },
    rematchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: palette.tint,
    },
    rematchButtonDisabled: {
      opacity: 0.6,
    },
    rematchButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.background,
    },
    detailTimestamp: {
      fontSize: 13,
      color: palette.icon,
    },
  });
}
