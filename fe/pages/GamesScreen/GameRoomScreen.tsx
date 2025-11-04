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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { gameSocket as socket } from '@/hooks/useSocket';
import { useSessionTokens } from '@/stores/sessionTokens';
import { showGlobalError } from '@/components/ui/ErrorToastProvider';
import {
  findApiMessageDescriptor,
  inferTranslationKeyFromMessageKey,
} from '@/lib/apiMessageCatalog';
import { platformShadow } from '@/lib/platformShadow';
import {
  deleteGameRoom,
  leaveGameRoom,
  getGameRoom,
  getGameRoomSession,
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
import {
  ExplodingCatsTable,
  type ExplodingCatsCatComboInput,
  type LogVisibility,
} from './components/ExplodingCatsTable';
import { useTranslation } from '@/lib/i18n';
import { platform } from '@/constants/platform';

function resolveParam(
  value: string | string[] | undefined,
): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function normalizeWsMessageCode(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function shouldExposeRawWsMessage(message?: string): boolean {
  if (!message) {
    return false;
  }

  return /\s/.test(message);
}

export default function GameRoomScreen() {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{
    id?: string;
    gameId?: string;
    roomName?: string;
  }>();
  const router = useRouter();
  const { tokens, refreshTokens, hydrated } = useSessionTokens();
  const { t } = useTranslation();
  const iosTopInset = platform.isIos ? insets.top : 0;
  const lobbyContentStyle = useMemo(
    () => [styles.content, { paddingTop: 24 + iosTopInset }],
    [styles.content, iosTopInset],
  );
  const fullscreenContainerStyle = useMemo(
    () => [
      styles.fullscreenContainer,
      platform.isIos ? { paddingTop: iosTopInset } : null,
    ],
    [styles.fullscreenContainer, iosTopInset],
  );

  const roomId = useMemo(() => resolveParam(params?.id), [params]);
  const gameId = useMemo(() => resolveParam(params?.gameId), [params]);
  const fallbackName = useMemo(() => resolveParam(params?.roomName), [params]);

  const [room, setRoom] = useState<GameRoomSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<GameSessionSummary | null>(null);
  const [actionBusy, setActionBusy] = useState<
    'draw' | 'skip' | 'attack' | 'cat_pair' | 'cat_trio' | null
  >(null);
  const [startBusy, setStartBusy] = useState(false);
  const isHost =
    room?.hostId && tokens.userId ? room.hostId === tokens.userId : false;
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tableFullScreen, setTableFullScreen] = useState(false);

  const fetchRoom = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!roomId) {
        setRoom(null);
        setSession(null);
        setError(t('games.room.errors.notFound'));
        return;
      }

      if (!hydrated) {
        return;
      }

      const setFlag = mode === 'initial' ? setLoading : setRefreshing;
      setFlag(true);

      try {
        const authOptions = tokens.accessToken
          ? {
              accessToken: tokens.accessToken,
              refreshTokens,
            }
          : undefined;

        const response = await getGameRoom(roomId, authOptions);
        setRoom(response.room);
        setError(null);

        try {
          const sessionResponse = await getGameRoomSession(roomId, authOptions);
          setSession(sessionResponse.session ?? null);
        } catch {
          setSession(null);
        }
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : t('games.errors.loadRoomDetails');
        setRoom(null);
        setSession(null);
        setError(message);
      } finally {
        setFlag(false);
      }
    },
    [hydrated, refreshTokens, roomId, t, tokens.accessToken],
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
    if (!roomId || !hydrated) {
      return;
    }

    const isParticipant = Boolean(tokens.userId);
    const joinEvent = isParticipant ? 'games.room.join' : 'games.room.watch';
    const joinPayload = isParticipant
      ? { roomId, userId: tokens.userId }
      : { roomId };

    const handleConnect = () => {
      socket.emit(joinEvent, joinPayload);
    };

    const handleJoined = (payload: {
      room?: GameRoomSummary;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.room) {
        setRoom(payload.room);
      }
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'session')) {
        setSession(payload?.session ?? null);
      }
    };

    const handleRoomUpdate = (payload: { room?: GameRoomSummary }) => {
      if (payload?.room && payload.room.id === roomId) {
        setRoom(payload.room);
      }
    };

    const handleRoomDeleted = (payload: { roomId?: string }) => {
      if (payload?.roomId && payload.roomId !== roomId) {
        return;
      }

      if (deleting) {
        return;
      }

      setRoom(null);
      setSession(null);
      setActionBusy(null);
      setStartBusy(false);

      Alert.alert(
        t('games.alerts.roomDeletedTitle'),
        t('games.alerts.roomDeletedMessage'),
        [
          {
            text: t('common.actions.ok'),
            onPress: () => {
              router.replace('/(tabs)/games');
            },
          },
        ],
      );
    };

    const handleSnapshot = (payload: {
      roomId?: string;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.roomId && payload.roomId !== roomId) {
        return;
      }
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'session')) {
        setSession(payload?.session ?? null);
      }
      setActionBusy(null);
    };

    const handleSessionStarted = (payload: {
      room: GameRoomSummary;
      session: GameSessionSummary;
    }) => {
      if (!payload?.room || payload.room.id !== roomId) {
        return;
      }
      setRoom(payload.room);
      setSession(payload.session);
      setStartBusy(false);
      setActionBusy(null);
    };

    const handleCatComboPlayed = (payload: { roomId?: string }) => {
      if (payload?.roomId && payload.roomId !== roomId) {
        return;
      }
      setActionBusy(null);
    };

    const handleException = (payload: unknown) => {
      setActionBusy(null);
      setStartBusy(false);

      const detail =
        payload && typeof payload === 'object'
          ? (payload as Record<string, unknown>)
          : undefined;

      const message =
        typeof detail?.message === 'string'
          ? detail.message
          : typeof payload === 'string'
            ? payload
            : undefined;

      const messageKey =
        typeof detail?.messageKey === 'string' ? detail.messageKey : undefined;
      const messageCode =
        normalizeWsMessageCode(detail?.messageCode) ??
        normalizeWsMessageCode(detail?.code);

      const descriptor = findApiMessageDescriptor({
        code: messageCode,
        messageKey,
        message,
      });

      const fallback =
        descriptor?.fallbackMessage ??
        message ??
        t('games.alerts.genericError');

      showGlobalError({
        translationKey:
          descriptor?.translationKey ??
          inferTranslationKeyFromMessageKey(messageKey),
        fallbackMessage: fallback,
        rawMessage: shouldExposeRawWsMessage(message) ? message : undefined,
      });
    };

    socket.on('connect', handleConnect);
    socket.on('games.room.joined', handleJoined);
    socket.on('games.room.watching', handleJoined);
    socket.on('games.room.update', handleRoomUpdate);
    socket.on('games.room.deleted', handleRoomDeleted);
    socket.on('games.session.snapshot', handleSnapshot);
    socket.on('games.session.started', handleSessionStarted);
    socket.on('games.session.cat_combo.played', handleCatComboPlayed);
    socket.on('exception', handleException);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('games.room.joined', handleJoined);
      socket.off('games.room.watching', handleJoined);
      socket.off('games.room.update', handleRoomUpdate);
      socket.off('games.room.deleted', handleRoomDeleted);
      socket.off('games.session.snapshot', handleSnapshot);
      socket.off('games.session.started', handleSessionStarted);
      socket.off('games.session.cat_combo.played', handleCatComboPlayed);
      socket.off('exception', handleException);
    };
  }, [deleting, hydrated, roomId, router, t, tokens.userId]);

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
      const message =
        err instanceof Error
          ? err.message
          : t('games.alerts.couldNotLeaveMessage');
      Alert.alert(t('games.alerts.couldNotLeaveTitle'), message);
    } finally {
      setLeaving(false);
    }
  }, [refreshTokens, roomId, router, t, tokens.accessToken]);

  const performDelete = useCallback(async () => {
    if (!roomId || !tokens.accessToken) {
      return;
    }

    setDeleting(true);
    try {
      await deleteGameRoom(
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
      const message =
        err instanceof Error ? err.message : t('games.alerts.genericError');
      Alert.alert(t('games.alerts.actionFailedTitle'), message);
    } finally {
      setDeleting(false);
    }
  }, [refreshTokens, roomId, router, t, tokens.accessToken]);

  const handleLeaveRoom = useCallback(() => {
    if (!roomId) {
      return;
    }

    if (!tokens.accessToken) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/games');
      }
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

  const handleDeleteRoom = useCallback(() => {
    if (!roomId) {
      return;
    }

    if (!isHost) {
      handleLeaveRoom();
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

    if (deleting) {
      return;
    }

    Alert.alert(
      t('games.alerts.deletePromptTitle'),
      t('games.alerts.deletePromptMessage'),
      [
        { text: t('common.actions.stay'), style: 'cancel' },
        {
          text: t('games.room.buttons.deleteRoom'),
          style: 'destructive',
          onPress: () => {
            void performDelete();
          },
        },
      ],
    );
  }, [
    deleting,
    handleLeaveRoom,
    isHost,
    performDelete,
    roomId,
    router,
    t,
    tokens.accessToken,
  ]);

  const handleStartMatch = useCallback(() => {
    if (!roomId) {
      return;
    }

    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInStartMatchMessage'),
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
        const message =
          err instanceof Error
            ? err.message
            : t('games.alerts.unableToStartMessage');
        Alert.alert(t('games.alerts.unableToStartTitle'), message);
      })
      .finally(() => {
        setStartBusy(false);
      });
  }, [isHost, refreshTokens, roomId, router, startBusy, t, tokens.accessToken]);

  const handleDrawCard = useCallback(() => {
    if (!roomId || !tokens.userId) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInTakeTurnMessage'),
      );
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
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInPlayCardMessage'),
        );
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

  const handlePlayCatCombo = useCallback(
    (input: ExplodingCatsCatComboInput) => {
      if (!roomId || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInPlayCardMessage'),
        );
        return;
      }

      if (actionBusy) {
        return;
      }

      setActionBusy(input.mode === 'pair' ? 'cat_pair' : 'cat_trio');
      socket.emit('games.session.play_cat_combo', {
        roomId,
        userId: tokens.userId,
        cat: input.cat,
        mode: input.mode,
        targetPlayerId: input.targetPlayerId,
        desiredCard: input.mode === 'trio' ? input.desiredCard : undefined,
      });
    },
    [actionBusy, roomId, t, tokens.userId],
  );

  const handlePostHistoryNote = useCallback(
    (message: string, scope: LogVisibility) => {
      if (!roomId || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInTakeTurnMessage'),
        );
        return Promise.resolve();
      }

      const trimmed = message.trim();
      if (!trimmed) {
        return Promise.resolve();
      }

      socket.emit('games.session.history_note', {
        roomId,
        userId: tokens.userId,
        message: trimmed,
        scope,
      });

      return Promise.resolve();
    },
    [roomId, t, tokens.userId],
  );

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
  }, [
    room,
    styles.statusCompleted,
    styles.statusInProgress,
    styles.statusLobby,
  ]);

  const displayName = room?.name ?? fallbackName ?? t('games.room.defaultName');
  const displayGameRaw = room
    ? formatRoomGame(room.gameId)
    : gameId
      ? formatRoomGame(gameId)
      : undefined;
  const displayGame =
    displayGameRaw === 'Unknown game'
      ? t('games.rooms.unknownGame')
      : displayGameRaw;

  const isLoading = loading && !refreshing;
  const hasSessionSnapshot = Boolean(
    session?.state &&
      typeof session.state === 'object' &&
      (session.state as Record<string, any>).snapshot,
  );

  useEffect(() => {
    if (!hasSessionSnapshot) {
      setTableFullScreen(false);
    }
  }, [hasSessionSnapshot]);

  const handleEnterFullScreen = useCallback(() => {
    setTableFullScreen(true);
  }, []);

  const handleExitFullScreen = useCallback(() => {
    setTableFullScreen(false);
  }, []);

  const renderTopBar = useCallback(
    (variant: 'lobby' | 'table') => (
      <View
        style={[
          variant === 'table' ? styles.fullscreenTopBar : styles.topBar,
          styles.topBarContent,
        ]}
      >
        <View style={styles.actionGroup}>
          {hasSessionSnapshot ? (
            <TouchableOpacity
              style={[
                styles.gameButton,
                tableFullScreen ? styles.buttonDisabled : null,
              ]}
              onPress={handleEnterFullScreen}
              disabled={tableFullScreen}
              accessibilityRole="button"
              accessibilityLabel={t('games.room.buttons.enterFullscreen')}
            >
              <IconSymbol
                name="arrow.up.left.and.arrow.down.right"
                size={16}
                color={styles.gameButtonText.color as string}
              />
              <ThemedText style={styles.gameButtonText}>
                {t('games.room.buttons.enterFullscreen')}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.gameButton}
            onPress={handleViewGame}
            disabled={!room && !gameId}
          >
            <IconSymbol
              name="book"
              size={16}
              color={styles.gameButtonText.color as string}
            />
            <ThemedText style={styles.gameButtonText}>
              {t('games.room.buttons.viewGame')}
            </ThemedText>
          </TouchableOpacity>
          {isHost ? (
            <>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  deleting ? styles.deleteButtonDisabled : null,
                ]}
                onPress={handleDeleteRoom}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator
                    size="small"
                    color={styles.deleteSpinner.color as string}
                  />
                ) : (
                  <>
                    <IconSymbol
                      name="trash"
                      size={16}
                      color={styles.deleteButtonText.color as string}
                    />
                    <ThemedText style={styles.deleteButtonText}>
                      {t('games.room.buttons.deleteRoom')}
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.leaveButton,
                  leaving ? styles.leaveButtonDisabled : null,
                ]}
                onPress={handleLeaveRoom}
                disabled={leaving}
              >
                {leaving ? (
                  <ActivityIndicator
                    size="small"
                    color={styles.leaveSpinner.color as string}
                  />
                ) : (
                  <>
                    <IconSymbol
                      name="rectangle.portrait.and.arrow.right"
                      size={16}
                      color={styles.leaveButtonText.color as string}
                    />
                    <ThemedText style={styles.leaveButtonText}>
                      {t('common.actions.leave')}
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.leaveButton,
                leaving ? styles.leaveButtonDisabled : null,
              ]}
              onPress={handleLeaveRoom}
              disabled={leaving}
            >
              {leaving ? (
                <ActivityIndicator
                  size="small"
                  color={styles.leaveSpinner.color as string}
                />
              ) : (
                <>
                  <IconSymbol
                    name="rectangle.portrait.and.arrow.right"
                    size={16}
                    color={styles.leaveButtonText.color as string}
                  />
                  <ThemedText style={styles.leaveButtonText}>
                    {t('common.actions.leave')}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [
      deleting,
      gameId,
      handleDeleteRoom,
      handleEnterFullScreen,
      handleLeaveRoom,
      handleViewGame,
      hasSessionSnapshot,
      isHost,
      leaving,
      room,
      styles,
      t,
      tableFullScreen,
    ],
  );

  if (tableFullScreen && hasSessionSnapshot) {
    return (
      <ThemedView style={fullscreenContainerStyle}>
        <View style={styles.fullscreenTableWrapper}>
          <ExplodingCatsTable
            room={room}
            session={session}
            currentUserId={tokens.userId ?? null}
            actionBusy={actionBusy}
            startBusy={startBusy}
            isHost={isHost}
            onStart={handleStartMatch}
            onDraw={handleDrawCard}
            onPlay={handlePlayCard}
            onPlayCatCombo={handlePlayCatCombo}
            onPostHistoryNote={handlePostHistoryNote}
            fullScreen
            tableOnly
          />
        </View>
        <TouchableOpacity
          style={[styles.tableOnlyCloseButton, { top: iosTopInset + 16 }]}
          onPress={handleExitFullScreen}
          accessibilityRole="button"
          accessibilityLabel={t('games.room.buttons.exitFullscreen')}
        >
          <IconSymbol
            name="xmark"
            size={18}
            color={styles.tableOnlyCloseIcon.color as string}
          />
          <ThemedText style={styles.tableOnlyCloseText}>
            {t('games.room.buttons.exitFullscreen')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const topBar = renderTopBar(hasSessionSnapshot ? 'table' : 'lobby');

  if (hasSessionSnapshot) {
    return (
      <ThemedView style={fullscreenContainerStyle}>
        {topBar}
        <View style={styles.fullscreenTableWrapper}>
          <ExplodingCatsTable
            room={room}
            session={session}
            currentUserId={tokens.userId ?? null}
            actionBusy={actionBusy}
            startBusy={startBusy}
            isHost={isHost}
            onStart={handleStartMatch}
            onDraw={handleDrawCard}
            onPlay={handlePlayCard}
            onPlayCatCombo={handlePlayCatCombo}
            onPostHistoryNote={handlePostHistoryNote}
            fullScreen
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={lobbyContentStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRoom('refresh')}
            tintColor={styles.refreshTint.color as string}
          />
        }
      >
        {topBar}

        <ThemedView style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.nameBlock}>
              <ThemedText
                type="title"
                style={styles.roomTitle}
                numberOfLines={2}
              >
                {displayName}
              </ThemedText>
              {displayGame ? (
                <ThemedText style={styles.gameLabel}>{displayGame}</ThemedText>
              ) : null}
            </View>
            <View style={[styles.statusPill, statusStyle]}>
              <ThemedText style={styles.statusText}>
                {t(getRoomStatusLabel(room?.status ?? 'lobby'))}
              </ThemedText>
            </View>
          </View>

          {room ? (
            <View style={styles.metaGrid}>
              {(() => {
                const hostLabelRaw =
                  room.host?.displayName ?? formatRoomHost(room.hostId);
                const hostValue =
                  hostLabelRaw === 'mystery captain'
                    ? t('games.rooms.mysteryHost')
                    : hostLabelRaw;
                const baseCapacity = room.maxPlayers
                  ? t('games.rooms.capacityWithMax', {
                      current: room.playerCount,
                      max: room.maxPlayers,
                    })
                  : t('games.rooms.capacityWithoutMax', {
                      count: room.playerCount,
                    });
                const playerNames = room.members
                  ?.map((member) => member.displayName)
                  .filter(Boolean)
                  .join(', ');
                const playersValue = playerNames
                  ? `${baseCapacity} • ${playerNames}`
                  : baseCapacity;
                const createdRaw = formatRoomTimestamp(room.createdAt);
                const createdValue =
                  createdRaw === 'Just created'
                    ? t('games.rooms.justCreated')
                    : createdRaw;
                const accessValue =
                  room.visibility === 'private'
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
                      value={t('games.rooms.created', {
                        timestamp: createdValue,
                      })}
                    />
                    <MetaItem
                      icon={
                        room.visibility === 'private' ? 'lock.fill' : 'sparkles'
                      }
                      label={t('games.room.meta.access')}
                      value={accessValue}
                    />
                    {room.inviteCode ? (
                      <MetaItem
                        icon="number"
                        label={t('games.room.meta.inviteCode')}
                        value={room.inviteCode}
                      />
                    ) : null}
                  </>
                );
              })()}
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                size="small"
                color={styles.refreshTint.color as string}
              />
              <ThemedText style={styles.loadingText}>
                {t('games.room.loading')}
              </ThemedText>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorCard}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={18}
                color={styles.errorText.color as string}
              />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.bodyCard}>
          <View style={styles.bodyHeader}>
            <IconSymbol
              name="sparkles"
              size={18}
              color={styles.bodyHeaderText.color as string}
            />
            <ThemedText style={styles.bodyHeaderText}>
              {t('games.room.preparationTitle')}
            </ThemedText>
          </View>
          <ThemedText style={styles.bodyCopy}>
            {t('games.room.preparationCopy')}
          </ThemedText>
        </ThemedView>

        <ExplodingCatsTable
          room={room}
          session={session}
          currentUserId={tokens.userId ?? null}
          actionBusy={actionBusy}
          startBusy={startBusy}
          isHost={isHost}
          onStart={handleStartMatch}
          onDraw={handleDrawCard}
          onPlay={handlePlayCard}
          onPlayCatCombo={handlePlayCatCombo}
          onPostHistoryNote={handlePostHistoryNote}
        />

        <ThemedView style={styles.footerCard}>
          <IconSymbol
            name="arrow.clockwise"
            size={18}
            color={styles.footerIcon.color as string}
          />
          <View style={styles.footerCopy}>
            <ThemedText type="subtitle">
              {t('games.room.waitingTitle')}
            </ThemedText>
            <ThemedText style={styles.footerText}>
              {t('games.room.waitingCopy')}
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  value: string;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaItem}>
      <IconSymbol
        name={icon}
        size={16}
        color={styles.metaItemLabel.color as string}
      />
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
  const surfaceShadow = isLight
    ? 'rgba(15, 23, 42, 0.08)'
    : 'rgba(8, 10, 15, 0.45)';
  const statusLobbyBg = isLight ? '#DCFCE7' : '#1D3A28';
  const statusInProgressBg = isLight ? '#FDE68A' : '#42381F';
  const statusCompletedBg = isLight ? '#E2E8F0' : '#2B3038';
  const leaveBackground = isLight ? '#FEE2E2' : '#3A2020';
  const leaveDisabledBackground = isLight ? '#E2E8F0' : '#31353C';
  const leaveTint = isLight ? '#B91C1C' : '#FCA5A5';
  const deleteBackground = isLight ? '#F97316' : '#4A1D0D';
  const deleteDisabledBackground = isLight ? '#E2E8F0' : '#31353C';
  const deleteTint = isLight ? '#7C2D12' : '#FCD7BE';

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
      width: '100%',
      paddingTop: 4,
      paddingRight: 48,
    },
    fullscreenTopBar: {
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    topBarContent: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 12,
      width: '100%',
      paddingRight: 48,
    },
    fullscreenTableWrapper: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    actionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 8,
      alignSelf: 'stretch',
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
    buttonDisabled: {
      opacity: 0.6,
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
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: deleteBackground,
    },
    deleteButtonDisabled: {
      backgroundColor: deleteDisabledBackground,
      opacity: 0.7,
    },
    deleteButtonText: {
      color: deleteTint,
      fontWeight: '600',
      fontSize: 13,
    },
    deleteSpinner: {
      color: deleteTint,
    },
    headerCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      gap: 16,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
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
      ...platformShadow({
        color: surfaceShadow,
        radius: 10,
        opacity: isLight ? 1 : 0.6,
        offset: { width: 0, height: 4 },
        elevation: 1,
      }),
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
    tableOnlyCloseButton: {
      position: 'absolute',
      left: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: palette.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.85 : 0.75,
        radius: 12,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
    },
    tableOnlyCloseIcon: {
      color: palette.text,
    },
    tableOnlyCloseText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
    },
  });
}
