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
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { socket } from '@/hooks/useSocket';
import { useSessionTokens } from '@/stores/sessionTokens';
import {
  leaveGameRoom,
  listGameRooms,
  startGameRoom,
  type GameRoomSummary,
  type GameSessionSummary,
} from './api/gamesApi';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from './roomUtils';
import { ExplodingCatsTable } from './components/ExplodingCatsTable';
import { useTranslation } from '@/lib/i18n';

function resolveParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default function GameRoomScreen() {
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{ id?: string; gameId?: string; roomName?: string }>();
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();
  const { t } = useTranslation();

  const roomId = useMemo(() => resolveParam(params?.id), [params]);
  const gameId = useMemo(() => resolveParam(params?.gameId), [params]);
  const fallbackName = useMemo(() => resolveParam(params?.roomName), [params]);

  const [room, setRoom] = useState<GameRoomSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<GameSessionSummary | null>(null);
  const [actionBusy, setActionBusy] = useState<'draw' | 'skip' | 'attack' | null>(null);
  const [startBusy, setStartBusy] = useState(false);
  const isHost = room?.hostId && tokens.userId ? room.hostId === tokens.userId : false;
  const [leaving, setLeaving] = useState(false);

  const fetchRoom = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!roomId) {
        setRoom(null);
        setSession(null);
        setError(t('games.room.errors.notFound'));
        return;
      }

      if (!tokens.accessToken) {
        setRoom(null);
        setSession(null);
        setError(t('games.room.errors.signInRequired'));
        return;
      }

      const setFlag = mode === 'initial' ? setLoading : setRefreshing;
      setFlag(true);

      try {
        const response = await listGameRooms(gameId, {
          accessToken: tokens.accessToken,
          refreshTokens,
        });
        const nextRoom = response.rooms.find((item) => item.id === roomId);
        if (nextRoom) {
          setRoom(nextRoom);
          setError(null);
        } else {
          setRoom(null);
          setSession(null);
          setError(t('games.room.errors.inactive'));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : t('games.errors.loadRoomDetails');
        setRoom(null);
        setSession(null);
        setError(message);
      } finally {
        setFlag(false);
      }
    },
    [gameId, refreshTokens, roomId, t, tokens.accessToken],
  );

  useEffect(() => {
    void fetchRoom();
  }, [fetchRoom]);

  useFocusEffect(
    useCallback(() => {
      void fetchRoom('refresh');
      return undefined;
    }, [fetchRoom]),
  );

  useEffect(() => {
    if (!roomId || !tokens.userId) {
      return;
    }

    const handleConnect = () => {
      socket.emit('games.room.join', {
        roomId,
        userId: tokens.userId,
      });
    };

    const handleJoined = (payload: { room?: GameRoomSummary; session?: GameSessionSummary | null }) => {
      if (payload?.room) {
        setRoom(payload.room);
      }
      if (payload?.session) {
        setSession(payload.session);
      }
    };

    const handleRoomUpdate = (payload: { room?: GameRoomSummary }) => {
      if (payload?.room && payload.room.id === roomId) {
        setRoom(payload.room);
      }
    };

    const handleSnapshot = (payload: { roomId?: string; session?: GameSessionSummary }) => {
      if (payload?.roomId && payload.roomId !== roomId) {
        return;
      }
      if (payload?.session) {
        setSession(payload.session);
      }
      setActionBusy(null);
    };

    const handleSessionStarted = (payload: { room: GameRoomSummary; session: GameSessionSummary }) => {
      if (!payload?.room || payload.room.id !== roomId) {
        return;
      }
      setRoom(payload.room);
      setSession(payload.session);
      setStartBusy(false);
      setActionBusy(null);
    };

    const handleException = (payload: { message?: string }) => {
      const message = payload?.message ?? t('games.alerts.genericError');
      setActionBusy(null);
      setStartBusy(false);
      Alert.alert(t('games.alerts.actionFailedTitle'), message);
    };

    socket.on('connect', handleConnect);
    socket.on('games.room.joined', handleJoined);
    socket.on('games.room.update', handleRoomUpdate);
    socket.on('games.session.snapshot', handleSnapshot);
    socket.on('games.session.started', handleSessionStarted);
    socket.on('exception', handleException);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('games.room.joined', handleJoined);
      socket.off('games.room.update', handleRoomUpdate);
      socket.off('games.session.snapshot', handleSnapshot);
      socket.off('games.session.started', handleSessionStarted);
      socket.off('exception', handleException);
    };
  }, [roomId, t, tokens.userId]);

  const performLeave = useCallback(async () => {
    if (!roomId || !tokens.accessToken) {
      return;
    }

    setLeaving(true);
    try {
      await leaveGameRoom(
        { roomId },
        {
          accessToken: tokens.accessToken,
          refreshTokens,
        },
      );

      setSession(null);
      setActionBusy(null);
      setStartBusy(false);
      router.replace('/(tabs)/games');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('games.alerts.couldNotLeaveMessage');
      Alert.alert(t('games.alerts.couldNotLeaveTitle'), message);
    } finally {
      setLeaving(false);
    }
  }, [refreshTokens, roomId, router, t, tokens.accessToken]);

  const handleLeaveRoom = useCallback(() => {
    if (!roomId) {
      return;
    }

    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInManageSeatMessage'),
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

    if (leaving) {
      return;
    }

    Alert.alert(
      t('games.alerts.leavePromptTitle'),
      t('games.alerts.leavePromptMessage'),
      [
        { text: t('common.actions.stay'), style: 'cancel' },
        {
          text: t('common.actions.leave'),
          style: 'destructive',
          onPress: () => {
            void performLeave();
          },
        },
      ],
    );
  }, [leaving, performLeave, roomId, router, t, tokens.accessToken]);

  const handleStartMatch = useCallback(() => {
    if (!roomId) {
      return;
    }

    if (!tokens.accessToken) {
      Alert.alert(t('games.alerts.signInRequiredTitle'), t('games.alerts.signInStartMatchMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.signIn'),
          onPress: () => router.push('/auth' as never),
        },
      ]);
      return;
    }

    if (!isHost || startBusy) {
      return;
    }

    setStartBusy(true);
    startGameRoom(
      { roomId, engine: 'exploding_cats_v1' },
      {
        accessToken: tokens.accessToken,
        refreshTokens,
      },
    )
      .then((response) => {
        setRoom(response.room);
        setSession(response.session);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : t('games.alerts.unableToStartMessage');
        Alert.alert(t('games.alerts.unableToStartTitle'), message);
      })
      .finally(() => {
        setStartBusy(false);
      });
  }, [isHost, refreshTokens, roomId, router, startBusy, t, tokens.accessToken]);

  const handleDrawCard = useCallback(() => {
    if (!roomId || !tokens.userId) {
      Alert.alert(t('games.alerts.signInRequiredTitle'), t('games.alerts.signInTakeTurnMessage'));
      return;
    }

    if (actionBusy) {
      return;
    }

    setActionBusy('draw');
    socket.emit('games.session.draw', {
      roomId,
      userId: tokens.userId,
    });
  }, [actionBusy, roomId, t, tokens.userId]);

  const handlePlayCard = useCallback(
    (card: 'skip' | 'attack') => {
      if (!roomId || !tokens.userId) {
        Alert.alert(t('games.alerts.signInRequiredTitle'), t('games.alerts.signInPlayCardMessage'));
        return;
      }

      if (actionBusy) {
        return;
      }

      setActionBusy(card);
      socket.emit('games.session.play_action', {
        roomId,
        userId: tokens.userId,
        card,
      });
    },
    [actionBusy, roomId, t, tokens.userId],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/games');
    }
  }, [router]);

  const handleViewGame = useCallback(() => {
    const targetGameId = room?.gameId ?? gameId;
    if (!targetGameId) return;
    router.push({ pathname: '/games/[id]', params: { id: targetGameId } });
  }, [gameId, room?.gameId, router]);

  const statusStyle = useMemo(() => {
    if (!room) return styles.statusLobby;
    switch (room.status) {
      case 'in_progress':
        return styles.statusInProgress;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusLobby;
    }
  }, [room, styles.statusCompleted, styles.statusInProgress, styles.statusLobby]);

  const displayName = room?.name ?? fallbackName ?? t('games.room.defaultName');
  const displayGameRaw = room ? formatRoomGame(room.gameId) : gameId ? formatRoomGame(gameId) : undefined;
  const displayGame = displayGameRaw === 'Unknown game' ? t('games.rooms.unknownGame') : displayGameRaw;

  const isLoading = loading && !refreshing;
  const hasSessionSnapshot = Boolean(
    session?.state && typeof session.state === 'object' && (session.state as Record<string, any>).snapshot,
  );

  const renderTopBar = useCallback(
    (variant: 'lobby' | 'table') => (
      <View style={variant === 'table' ? styles.fullscreenTopBar : styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={20} color={styles.backButtonText.color as string} />
          <ThemedText style={styles.backButtonText}>{t('games.detail.backToLobby')}</ThemedText>
        </TouchableOpacity>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.gameButton} onPress={handleViewGame} disabled={!room && !gameId}>
            <IconSymbol name="book" size={16} color={styles.gameButtonText.color as string} />
            <ThemedText style={styles.gameButtonText}>{t('games.room.buttons.viewGame')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.leaveButton, leaving ? styles.leaveButtonDisabled : null]}
            onPress={handleLeaveRoom}
            disabled={leaving}
          >
            {leaving ? (
              <ActivityIndicator size="small" color={styles.leaveSpinner.color as string} />
            ) : (
              <>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color={styles.leaveButtonText.color as string} />
                <ThemedText style={styles.leaveButtonText}>{t('common.actions.leave')}</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    ),
    [gameId, handleBack, handleLeaveRoom, handleViewGame, leaving, room, styles, t],
  );

  const topBar = renderTopBar(hasSessionSnapshot ? 'table' : 'lobby');

  if (hasSessionSnapshot) {
    return (
      <ThemedView style={styles.fullscreenContainer}>
        {topBar}
        <View style={styles.fullscreenTableWrapper}>
          <ExplodingCatsTable
            room={room}
            session={session}
            currentUserId={tokens.userId}
            actionBusy={actionBusy}
            startBusy={startBusy}
            isHost={isHost}
            onStart={handleStartMatch}
            onDraw={handleDrawCard}
            onPlay={handlePlayCard}
            fullScreen
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRoom('refresh')}
            tintColor={styles.refreshTint.color as string}
          />
        )}
      >
        {topBar}

        <ThemedView style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.nameBlock}>
              <ThemedText type="title" style={styles.roomTitle} numberOfLines={2}>{displayName}</ThemedText>
              {displayGame ? (
                <ThemedText style={styles.gameLabel}>{displayGame}</ThemedText>
              ) : null}
            </View>
            <View style={[styles.statusPill, statusStyle]}>
              <ThemedText style={styles.statusText}>{t(getRoomStatusLabel(room?.status ?? 'lobby'))}</ThemedText>
            </View>
          </View>

          {room ? (
            <View style={styles.metaGrid}>
              {(() => {
                const hostLabelRaw = formatRoomHost(room.hostId);
                const hostValue = hostLabelRaw === 'mystery captain' ? t('games.rooms.mysteryHost') : hostLabelRaw;
                const playersValue = room.maxPlayers
                  ? t('games.rooms.capacityWithMax', { current: room.playerCount, max: room.maxPlayers })
                  : t('games.rooms.capacityWithoutMax', { count: room.playerCount });
                const createdRaw = formatRoomTimestamp(room.createdAt);
                const createdValue = createdRaw === 'Just created' ? t('games.rooms.justCreated') : createdRaw;
                const accessValue = room.visibility === 'private'
                  ? t('games.rooms.visibility.private')
                  : t('games.rooms.visibility.public');
                return (
                  <>
                    <MetaItem
                      icon="person.crop.circle"
                      label={t('games.room.meta.host')}
                      value={hostValue}
                    />
                    <MetaItem
                      icon="person.3.fill"
                      label={t('games.room.meta.players')}
                      value={playersValue}
                    />
                    <MetaItem
                      icon="clock.fill"
                      label={t('games.room.meta.created')}
                      value={t('games.rooms.created', { timestamp: createdValue })}
                    />
                    <MetaItem
                      icon={room.visibility === 'private' ? 'lock.fill' : 'sparkles'}
                      label={t('games.room.meta.access')}
                      value={accessValue}
                    />
                    {room.inviteCode ? (
                      <MetaItem icon="number" label={t('games.room.meta.inviteCode')} value={room.inviteCode} />
                    ) : null}
                  </>
                );
              })()}
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={styles.refreshTint.color as string} />
              <ThemedText style={styles.loadingText}>{t('games.room.loading')}</ThemedText>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={18} color={styles.errorText.color as string} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.bodyCard}>
          <View style={styles.bodyHeader}>
            <IconSymbol name="sparkles" size={18} color={styles.bodyHeaderText.color as string} />
            <ThemedText style={styles.bodyHeaderText}>{t('games.room.preparationTitle')}</ThemedText>
          </View>
          <ThemedText style={styles.bodyCopy}>{t('games.room.preparationCopy')}</ThemedText>
        </ThemedView>

        <ExplodingCatsTable
          room={room}
          session={session}
          currentUserId={tokens.userId}
          actionBusy={actionBusy}
          startBusy={startBusy}
          isHost={isHost}
          onStart={handleStartMatch}
          onDraw={handleDrawCard}
          onPlay={handlePlayCard}
        />

        <ThemedView style={styles.footerCard}>
          <IconSymbol name="arrow.clockwise" size={18} color={styles.footerIcon.color as string} />
          <View style={styles.footerCopy}>
            <ThemedText type="subtitle">{t('games.room.waitingTitle')}</ThemedText>
            <ThemedText style={styles.footerText}>{t('games.room.waitingCopy')}</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function MetaItem({ icon, label, value }: { icon: Parameters<typeof IconSymbol>[0]['name']; label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaItem}>
      <IconSymbol name={icon} size={16} color={styles.metaItemLabel.color as string} />
      <View style={styles.metaItemCopy}>
        <ThemedText style={styles.metaItemLabel}>{label}</ThemedText>
        <ThemedText style={styles.metaItemValue}>{value}</ThemedText>
      </View>
    </View>
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
  const leaveBackground = isLight ? '#FEE2E2' : '#3A2020';
  const leaveDisabledBackground = isLight ? '#E2E8F0' : '#31353C';
  const leaveTint = isLight ? '#B91C1C' : '#FCA5A5';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    fullscreenContainer: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 20,
      paddingBottom: 48,
    },
    refreshTint: {
      color: palette.tint,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fullscreenTopBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    fullscreenTableWrapper: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    actionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    backButtonText: {
      color: palette.tint,
      fontWeight: '600',
    },
    gameButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
    },
    gameButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    leaveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: leaveBackground,
    },
    leaveButtonDisabled: {
      backgroundColor: leaveDisabledBackground,
      opacity: 0.7,
    },
    leaveButtonText: {
      color: leaveTint,
      fontWeight: '600',
      fontSize: 13,
    },
    leaveSpinner: {
      color: leaveTint,
    },
    headerCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      gap: 16,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
    },
    nameBlock: {
      flex: 1,
      gap: 6,
    },
    roomTitle: {
      color: palette.text,
    },
    gameLabel: {
      color: palette.icon,
      fontSize: 13,
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    statusLobby: {
      backgroundColor: statusLobbyBg,
    },
    statusInProgress: {
      backgroundColor: statusInProgressBg,
    },
    statusCompleted: {
      backgroundColor: statusCompletedBg,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: '45%',
    },
    metaItemCopy: {
      gap: 2,
    },
    metaItemLabel: {
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
    },
    metaItemValue: {
      color: palette.text,
      fontWeight: '600',
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadingText: {
      color: palette.icon,
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor: '#F9731620',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#F9731655',
    },
    errorText: {
      color: '#F97316',
      fontWeight: '600',
    },
    bodyCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      gap: 14,
      shadowColor: surfaceShadow,
      shadowRadius: 10,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    bodyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bodyHeaderText: {
      color: palette.text,
      fontWeight: '600',
    },
    bodyCopy: {
      color: palette.icon,
      lineHeight: 20,
    },
    footerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 20,
      borderRadius: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    footerIcon: {
      color: palette.tint,
    },
    footerCopy: {
      flex: 1,
      gap: 4,
    },
    footerText: {
      color: palette.icon,
      lineHeight: 19,
    },
  });
}
