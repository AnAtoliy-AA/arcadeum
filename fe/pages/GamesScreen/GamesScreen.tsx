import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import {
  joinGameRoom,
  listGameRooms,
  type GameRoomSummary,
  type ListGameRoomsParams,
} from './api/gamesApi';
import { useSessionTokens } from '@/stores/sessionTokens';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from './roomUtils';
import { InviteCodeDialog } from './InviteCodeDialog';
import { interpretJoinError } from './joinErrorUtils';
import { useTranslation } from '@/lib/i18n';
import { platformShadow } from '@/lib/platformShadow';

type InvitePromptState = {
  visible: boolean;
  room: GameRoomSummary | null;
  mode: 'room' | 'manual';
  loading: boolean;
  error: string | null;
};

type StatusFilterValue = 'all' | 'lobby' | 'in_progress' | 'completed';
type ParticipationFilterValue =
  | 'all'
  | 'hosting'
  | 'joined'
  | 'not_joined';

export default function GamesScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();
  const { t } = useTranslation();
  const navigateToCreate = useCallback((gameId?: string) => {
    if (gameId) {
      router.push({ pathname: '/games/create', params: { gameId } } as never);
    } else {
      router.push('/games/create' as never);
    }
  }, [router]);
  const { shouldBlock } = useSessionScreenGate({
    enableOn: ['web'],
  });

  const [rooms, setRooms] = useState<GameRoomSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsRefreshing, setRoomsRefreshing] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [invitePrompt, setInvitePrompt] = useState<InvitePromptState>({
    visible: false,
    room: null,
    mode: 'room',
    loading: false,
    error: null,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [participationFilter, setParticipationFilter] =
    useState<ParticipationFilterValue>('all');
  const isAuthenticated = Boolean(tokens.accessToken && tokens.userId);

  const statusOptions = useMemo(() => {
    const options: { value: StatusFilterValue; label: string }[] = [
      { value: 'all', label: t('games.lounge.filters.status.all') },
      { value: 'lobby', label: t('games.lounge.filters.status.lobby') },
      {
        value: 'in_progress',
        label: t('games.lounge.filters.status.inProgress'),
      },
      {
        value: 'completed',
        label: t('games.lounge.filters.status.completed'),
      },
    ];
    return options;
  }, [t]);

  const participationOptions = useMemo(() => {
    const options: {
      value: ParticipationFilterValue;
      label: string;
      requiresAuth: boolean;
    }[] = [
      {
        value: 'all',
        label: t('games.lounge.filters.participation.all'),
        requiresAuth: false,
      },
      {
        value: 'hosting',
        label: t('games.lounge.filters.participation.hosting'),
        requiresAuth: true,
      },
      {
        value: 'joined',
        label: t('games.lounge.filters.participation.joined'),
        requiresAuth: true,
      },
      {
        value: 'not_joined',
        label: t('games.lounge.filters.participation.notJoined'),
        requiresAuth: true,
      },
    ];
    return options;
  }, [t]);

  const filtersActive = useMemo(() => {
    return statusFilter !== 'all' || participationFilter !== 'all';
  }, [participationFilter, statusFilter]);

  useEffect(() => {
    if (!isAuthenticated && participationFilter !== 'all') {
      setParticipationFilter('all');
    }
  }, [isAuthenticated, participationFilter]);

  const fetchRooms = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      const setLoadingFlag =
        mode === 'initial' ? setRoomsLoading : setRoomsRefreshing;
      setLoadingFlag(true);

      try {
        const authOptions = tokens.accessToken
          ? {
              accessToken: tokens.accessToken,
              refreshTokens,
            }
          : undefined;

        const filters: ListGameRoomsParams = {};
        if (statusFilter !== 'all') {
          filters.statuses = [statusFilter];
        }
        if (participationFilter !== 'all') {
          filters.participation = participationFilter;
        }

        const response = await listGameRooms(
          Object.keys(filters).length > 0 ? filters : undefined,
          authOptions,
        );
        setRooms(response.rooms ?? []);
        setRoomsError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('games.errors.loadRooms');
        setRoomsError(message);
      } finally {
        setLoadingFlag(false);
      }
    },
    [
      participationFilter,
      refreshTokens,
      statusFilter,
      t,
      tokens.accessToken,
    ],
  );

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useFocusEffect(
    useCallback(() => {
      fetchRooms('refresh');
    }, [fetchRooms]),
  );

  const sortedRooms = useMemo(() => {
    if (!rooms.length) return [];
    return [...rooms].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rooms]);

  const updateRoomList = useCallback((room: GameRoomSummary) => {
    setRooms((current) => {
      const next = [...current];
      const existingIndex = next.findIndex((existing) => existing.id === room.id);
      if (existingIndex >= 0) {
        next[existingIndex] = room;
        return next;
      }
      return [room, ...next];
    });
  }, []);

  const navigateToRoomScreen = useCallback((room: GameRoomSummary) => {
    router.push({
      pathname: '/games/rooms/[id]',
      params: {
        id: room.id,
        gameId: room.gameId,
        roomName: room.name,
      },
    });
  }, [router]);

  const joinRoom = useCallback(async (room: GameRoomSummary, inviteCode?: string) => {
    setJoiningRoomId(room.id);
    if (inviteCode) {
      setInvitePrompt({ visible: true, room, mode: 'room', loading: true, error: null });
    }

    try {
      const response = await joinGameRoom(
        { roomId: room.id, inviteCode },
        {
          accessToken: tokens.accessToken,
          refreshTokens,
        },
      );

      updateRoomList(response.room);

      setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });

      navigateToRoomScreen(response.room);
      void fetchRooms('refresh');
    } catch (error) {
      const { type, message: rawMessage } = interpretJoinError(error);

      if (!inviteCode && type === 'invite-required') {
        setInvitePrompt({ visible: true, room, mode: 'room', loading: false, error: null });
        return;
      }

      if (inviteCode && (type === 'invite-required' || type === 'invite-invalid')) {
        setInvitePrompt({
          visible: true,
          room,
          mode: 'room',
          loading: false,
          error:
            type === 'invite-required'
              ? t('games.alerts.inviteRequired')
              : t('games.alerts.inviteInvalid'),
        });
        return;
      }

      if (type === 'room-full') {
        Alert.alert(t('games.alerts.roomFullTitle'), t('games.alerts.roomFullMessage'));
        return;
      }

      if (type === 'room-locked') {
        Alert.alert(t('games.alerts.roomLockedTitle'), t('games.alerts.roomLockedMessage'));
        return;
      }

      const fallbackMessage = rawMessage && rawMessage !== 'Something went wrong.'
        ? rawMessage
        : t('games.alerts.genericError');
      Alert.alert(t('games.alerts.genericJoinFailedTitle'), fallbackMessage);
    } finally {
      setJoiningRoomId(null);
    }
  }, [fetchRooms, navigateToRoomScreen, refreshTokens, t, tokens.accessToken, updateRoomList]);

  const joinRoomByInviteCode = useCallback(async (code: string) => {
    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInInviteMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.signIn'),
            onPress: () => router.push('/auth' as never),
          },
        ],
      );
      return;
    }

    setInvitePrompt({
      visible: true,
      room: null,
      mode: 'manual',
      loading: true,
      error: null,
    });

    try {
      const response = await joinGameRoom(
        { inviteCode: code },
        {
          accessToken: tokens.accessToken,
          refreshTokens,
        },
      );

      updateRoomList(response.room);

      setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });

      navigateToRoomScreen(response.room);
      void fetchRooms('refresh');
    } catch (error) {
      const { type, message: rawMessage } = interpretJoinError(error);

      if (type === 'room-full') {
        setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });
        Alert.alert(t('games.alerts.roomFullTitle'), t('games.alerts.roomFullManualMessage'));
        return;
      }

      if (type === 'room-locked') {
        setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });
        Alert.alert(t('games.alerts.roomLockedTitle'), t('games.alerts.roomLockedManualMessage'));
        return;
      }

      setInvitePrompt({
        visible: true,
        room: null,
        mode: 'manual',
        loading: false,
        error:
          type === 'invite-invalid'
            ? t('games.alerts.inviteInvalidManual')
            : type === 'invite-required'
              ? t('games.alerts.inviteRequired')
              : rawMessage && rawMessage !== 'Something went wrong.'
                ? rawMessage
                : t('games.alerts.genericError'),
      });
    }
  }, [fetchRooms, navigateToRoomScreen, refreshTokens, router, t, tokens.accessToken, updateRoomList]);

  const handleJoinRoom = useCallback((room: GameRoomSummary) => {
    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInJoinMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.signIn'),
            onPress: () => {
              router.push('/auth' as never);
            },
          },
        ],
      );
      return;
    }

    void joinRoom(room);
  }, [joinRoom, router, t, tokens.accessToken]);

  const handleWatchRoom = useCallback(
    (room: GameRoomSummary) => {
      navigateToRoomScreen(room);
    },
    [navigateToRoomScreen],
  );

  const handleInviteCancel = useCallback(() => {
    setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });
  }, []);

  const handleInviteSubmit = useCallback((code: string) => {
    if (invitePrompt.mode === 'manual') {
      void joinRoomByInviteCode(code);
      return;
    }

    if (!invitePrompt.room) {
      return;
    }

    void joinRoom(invitePrompt.room, code);
  }, [invitePrompt.mode, invitePrompt.room, joinRoom, joinRoomByInviteCode]);

  const handleManualInvite = useCallback(() => {
    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInInviteMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.signIn'),
            onPress: () => router.push('/auth' as never),
          },
        ],
      );
      return;
    }

    setInvitePrompt({ visible: true, room: null, mode: 'manual', loading: false, error: null });
  }, [router, t, tokens.accessToken]);

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={roomsRefreshing}
            onRefresh={() => fetchRooms('refresh')}
            tintColor={styles.refreshControlTint.color as string}
          />
        )}
      >
        <View style={styles.header}>
          <View>
            <ThemedText type="title">{t('games.lounge.activeTitle')}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('games.lounge.activeCaption')}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigateToCreate()}>
            <IconSymbol name="sparkles" size={18} color={styles.headerButtonText.color as string} />
            <ThemedText style={styles.headerButtonText}>{t('games.common.createRoom')}</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.manualInviteTrigger} onPress={handleManualInvite}>
          <IconSymbol name="lock.open" size={16} color={styles.manualInviteTriggerText.color as string} />
          <ThemedText style={styles.manualInviteTriggerText}>{t('games.lounge.haveInvite')}</ThemedText>
        </TouchableOpacity>

        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <ThemedText style={styles.filterLabel}>
              {t('games.lounge.filters.statusLabel')}
            </ThemedText>
            <View style={styles.filterChipsRow}>
              {statusOptions.map((option) => {
                const selected = option.value === statusFilter;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipActive,
                    ]}
                    onPress={() => {
                      setStatusFilter(option.value);
                    }}
                    disabled={selected}
                  >
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        selected && styles.filterChipTextActive,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <ThemedText style={styles.filterLabel}>
              {t('games.lounge.filters.participationLabel')}
            </ThemedText>
            <View style={styles.filterChipsRow}>
              {participationOptions.map((option) => {
                const selected = option.value === participationFilter;
                const disabled = option.requiresAuth && !isAuthenticated;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipActive,
                      disabled && styles.filterChipDisabled,
                    ]}
                    onPress={() => {
                      if (disabled) {
                        return;
                      }
                      setParticipationFilter(option.value);
                    }}
                    disabled={disabled || selected}
                  >
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        selected && styles.filterChipTextActive,
                        disabled && styles.filterChipTextDisabled,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!isAuthenticated && (
              <ThemedText style={styles.filterHelperText}>
                {t('games.lounge.filters.participationSignedOut')}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.roomsContainer}>
          {roomsLoading ? (
            <ThemedView style={styles.roomSkeleton}>
              <ActivityIndicator size="small" color={styles.roomSkeletonSpinner.color as string} />
              <ThemedText style={styles.roomSkeletonText}>{t('games.lounge.loadingRooms')}</ThemedText>
            </ThemedView>
          ) : roomsError ? (
            <ThemedView style={styles.roomErrorCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={styles.roomErrorIcon.color as string} />
              <View style={styles.roomErrorCopy}>
                <ThemedText style={styles.roomErrorTitle}>{t('games.lounge.errorTitle')}</ThemedText>
                <ThemedText style={styles.roomErrorText}>{roomsError}</ThemedText>
              </View>
              <TouchableOpacity style={styles.roomRetryButton} onPress={() => fetchRooms('refresh')}>
                <IconSymbol name="arrow.clockwise" size={16} color={styles.roomRetryText.color as string} />
                <ThemedText style={styles.roomRetryText}>{t('common.retry')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : sortedRooms.length === 0 ? (
            <ThemedView style={styles.roomEmptyCard}>
              <IconSymbol name="sparkles" size={22} color={styles.roomEmptyIcon.color as string} />
              <ThemedText style={styles.roomEmptyTitle}>
                {filtersActive
                  ? t('games.lounge.filterEmptyTitle')
                  : t('games.lounge.emptyTitle')}
              </ThemedText>
              <ThemedText style={styles.roomEmptyText}>
                {filtersActive
                  ? t('games.lounge.filterEmptyDescription')
                  : t('games.lounge.emptyDescription')}
              </ThemedText>
            </ThemedView>
          ) : (
            sortedRooms.map(room => {
              const statusStyle =
                room.status === 'lobby'
                  ? styles.roomStatusLobby
                  : room.status === 'in_progress'
                    ? styles.roomStatusInProgress
                    : styles.roomStatusCompleted;

              const statusKey = getRoomStatusLabel(room.status);
              const statusLabel = t(statusKey);
              const capacityLabel = room.maxPlayers
                ? t('games.rooms.capacityWithMax', { current: room.playerCount, max: room.maxPlayers })
                : t('games.rooms.capacityWithoutMax', { count: room.playerCount });
              const playerNames = room.members?.map((member) => member.displayName).filter(Boolean).join(', ');
              const capacityDetail = playerNames ? `${capacityLabel} • ${playerNames}` : capacityLabel;
              const createdLabel = formatRoomTimestamp(room.createdAt);
              const createdTimestamp = createdLabel === 'Just created'
                ? t('games.rooms.justCreated')
                : createdLabel;
              const isJoining = joiningRoomId === room.id;
              const isPrivate = room.visibility === 'private';
              const hostDisplay = room.host?.displayName
                ?? (room.hostId ? formatRoomHost(room.hostId) : t('games.rooms.mysteryHost'));
              const gameName = formatRoomGame(room.gameId);
              const gameLabel = gameName === 'Unknown game' ? t('games.rooms.unknownGame') : gameName;
              const canWatch = room.visibility === 'public' || Boolean(tokens.accessToken);

              return (
                <ThemedView key={room.id} style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.roomTitle}>{room.name}</ThemedText>
                    <View style={[styles.roomStatusPill, statusStyle]}>
                      <ThemedText style={styles.roomStatusText}>{statusLabel}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.roomGameLabel}>{gameLabel}</ThemedText>
                  <View style={styles.roomMetaRow}>
                    <IconSymbol name="person.crop.circle" size={16} color={styles.roomMetaIcon.color as string} />
                    <ThemedText style={styles.roomMetaText}>{t('games.rooms.hostedBy', { host: hostDisplay })}</ThemedText>
                  </View>
                  <View style={styles.roomMetaRow}>
                    <IconSymbol name="person.3.fill" size={16} color={styles.roomMetaIcon.color as string} />
                    <ThemedText style={styles.roomMetaText}>{capacityDetail}</ThemedText>
                  </View>
                  <View style={styles.roomFooter}>
                    <View style={styles.roomBadgeRow}>
                      <View
                        style={[
                          styles.roomVisibilityChip,
                          isPrivate
                            ? styles.roomVisibilityChipPrivate
                            : styles.roomVisibilityChipPublic,
                        ]}
                      >
                        <IconSymbol
                          name={isPrivate ? 'lock.fill' : 'sparkles'}
                          size={14}
                          color={styles.roomVisibilityChipIcon.color as string}
                        />
                        <ThemedText style={styles.roomVisibilityChipText}>
                          {isPrivate ? t('games.rooms.visibility.private') : t('games.rooms.visibility.public')}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.roomTimestamp}>
                        {t('games.rooms.created', { timestamp: createdTimestamp })}
                      </ThemedText>
                    </View>
                    <View style={styles.roomActionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.roomWatchButton,
                          !canWatch ? styles.roomWatchButtonDisabled : null,
                        ]}
                        onPress={() => handleWatchRoom(room)}
                        disabled={!canWatch}
                      >
                        <IconSymbol
                          name="eye.fill"
                          size={16}
                          color={styles.roomWatchButtonText.color as string}
                        />
                        <ThemedText style={styles.roomWatchButtonText}>
                          {t('games.common.watchRoom')}
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.roomJoinButton, isJoining && styles.roomJoinButtonDisabled]}
                        onPress={() => handleJoinRoom(room)}
                        disabled={isJoining}
                      >
                        {isJoining ? (
                          <ActivityIndicator
                            size="small"
                            color={styles.roomJoinButtonText.color as string}
                          />
                        ) : (
                          <>
                            <IconSymbol
                              name="arrow.right.circle.fill"
                              size={18}
                              color={styles.roomJoinButtonText.color as string}
                            />
                            <ThemedText style={styles.roomJoinButtonText}>{t('games.common.joinRoom')}</ThemedText>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </ThemedView>
              );
            })
          )}
        </View>
      </ScrollView>
      <InviteCodeDialog
        visible={invitePrompt.visible}
        roomName={invitePrompt.room?.name}
        mode={invitePrompt.mode}
        loading={invitePrompt.loading}
        error={invitePrompt.error}
        onSubmit={handleInviteSubmit}
        onCancel={handleInviteCancel}
      />
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const surfaceShadow = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(8, 10, 15, 0.45)';
  const statusLobbyBg = isLight ? '#DCFCE7' : '#1D3A28';
  const statusInProgressBg = isLight ? '#FDE68A' : '#42381F';
  const statusCompletedBg = isLight ? '#E2E8F0' : '#2B3038';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 16,
      paddingBottom: 48,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    subtitle: {
      marginTop: 6,
      color: palette.icon,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 8,
        offset: { width: 0, height: 2 },
        elevation: 1,
      }),
    },
    headerButtonText: {
      color: palette.tint,
      fontWeight: '600',
    },
    refreshControlTint: {
      color: palette.tint,
    },
    manualInviteTrigger: {
      marginTop: 12,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    manualInviteTriggerText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    filtersContainer: {
      marginTop: 8,
      gap: 16,
    },
    filterGroup: {
      gap: 8,
    },
    filterLabel: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
    },
    filterChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: raisedBackground,
    },
    filterChipActive: {
      backgroundColor: palette.tint,
      borderColor: palette.tint,
    },
    filterChipDisabled: {
      opacity: 0.6,
    },
    filterChipText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: palette.background,
    },
    filterChipTextDisabled: {
      color: palette.icon,
    },
    filterHelperText: {
      color: palette.icon,
      fontSize: 12,
      lineHeight: 16,
    },
    roomsContainer: {
      gap: 12,
    },
    roomSkeleton: {
      borderRadius: 16,
      padding: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    roomSkeletonSpinner: {
      color: palette.tint,
    },
    roomSkeletonText: {
      color: palette.icon,
    },
    roomErrorCard: {
      borderRadius: 16,
      padding: 18,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    roomErrorIcon: {
      color: '#F97316',
    },
    roomErrorCopy: {
      flex: 1,
      gap: 4,
    },
    roomErrorTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomErrorText: {
      color: palette.icon,
    },
    roomRetryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: raisedBackground,
    },
    roomRetryText: {
      color: palette.tint,
      fontWeight: '600',
    },
    roomEmptyCard: {
      borderRadius: 16,
      padding: 24,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      alignItems: 'center',
      gap: 10,
    },
    roomEmptyIcon: {
      color: palette.tint,
    },
    roomEmptyTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomEmptyText: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
    roomCard: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 20,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    roomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    roomTitle: {
      color: palette.text,
      fontSize: 16,
    },
    roomStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    roomStatusLobby: {
      backgroundColor: statusLobbyBg,
    },
    roomStatusInProgress: {
      backgroundColor: statusInProgressBg,
    },
    roomStatusCompleted: {
      backgroundColor: statusCompletedBg,
    },
    roomStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    roomGameLabel: {
      color: palette.icon,
      fontSize: 13,
    },
    roomMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roomMetaIcon: {
      color: palette.tint,
    },
    roomMetaText: {
      color: palette.text,
      fontSize: 13,
    },
    roomFooter: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    roomBadgeRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    roomActionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roomVisibilityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    roomVisibilityChipPrivate: {
      backgroundColor: '#bf5af233',
    },
    roomVisibilityChipPublic: {
      backgroundColor: '#22c55e33',
    },
    roomVisibilityChipIcon: {
      color: palette.tint,
    },
    roomVisibilityChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    roomTimestamp: {
      color: palette.icon,
      fontSize: 11,
    },
    roomWatchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.tint,
      backgroundColor: 'transparent',
    },
    roomWatchButtonDisabled: {
      opacity: 0.6,
    },
    roomWatchButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    roomJoinButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    roomJoinButtonDisabled: {
      opacity: 0.7,
    },
    roomJoinButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 13,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
  });
}

