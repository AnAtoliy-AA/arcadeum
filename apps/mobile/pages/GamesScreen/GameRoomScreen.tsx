import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { showGlobalError } from '@/components/ui/ErrorToastProvider';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useTranslation } from '@/lib/i18n';
import {
  findApiMessageDescriptor,
  inferTranslationKeyFromMessageKey,
} from '@/lib/apiMessageCatalog';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';
import { gameSocket as socket } from '@/hooks/useSocket';

import {
  deleteGameRoom,
  leaveGameRoom,
  getGameRoom,
  getGameRoomSession,
  type GameRoomSummary,
  type GameSessionSummary,
} from './api/gamesApi';
import { formatRoomGame } from './roomUtils';
import {
  ExplodingCatsRoom,
  type ExplodingCatsRoomHandle,
} from './gameIntegrations/ExplodingCatsRoom';
import {
  TexasHoldemRoom,
  type TexasHoldemRoomHandle,
} from './gameIntegrations/TexasHoldemRoom';

type GameIntegrationId = 'exploding_cats_v1' | 'texas_holdem_v1';

const GAME_INTEGRATION_MAP: Record<string, GameIntegrationId> = {
  exploding_cats_v1: 'exploding_cats_v1',
  'exploding-kittens': 'exploding_cats_v1',
  texas_holdem_v1: 'texas_holdem_v1',
  'texas-holdem': 'texas_holdem_v1',
};

function resolveParam(value: string | string[] | undefined): string | undefined {
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
  const integrationRef = useRef<
    ExplodingCatsRoomHandle | TexasHoldemRoomHandle | null
  >(null);
  const params = useLocalSearchParams<{
    id?: string;
    gameId?: string;
    roomName?: string;
  }>();
  const router = useRouter();
  const { tokens, refreshTokens, hydrated } = useSessionTokens();
  const { t } = useTranslation();

  const roomId = useMemo(() => resolveParam(params?.id), [params]);
  const gameId = useMemo(() => resolveParam(params?.gameId), [params]);
  const fallbackName = useMemo(() => resolveParam(params?.roomName), [params]);

  const [room, setRoom] = useState<GameRoomSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<GameSessionSummary | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isHost = room?.hostId && tokens.userId ? room.hostId === tokens.userId : false;

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
    const joinPayload = isParticipant ? { roomId, userId: tokens.userId } : { roomId };

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
      integrationRef.current?.onException();

      Alert.alert(t('games.alerts.roomDeletedTitle'), t('games.alerts.roomDeletedMessage'), [
        {
          text: t('common.actions.ok'),
          onPress: () => {
            router.replace('/(tabs)/games');
          },
        },
      ]);
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
      integrationRef.current?.onSessionSnapshot();
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
      integrationRef.current?.onSessionStarted();
    };

    const handleCatComboPlayed = (payload: { roomId?: string }) => {
      if (payload?.roomId && payload.roomId !== roomId) {
        return;
      }
      const ref = integrationRef.current as ExplodingCatsRoomHandle | null;
      ref?.onCatComboPlayed?.();
    };

    const handleTexasHoldemStarted = (payload: {
      room: GameRoomSummary;
      session: GameSessionSummary;
    }) => {
      if (!payload?.room || payload.room.id !== roomId) {
        return;
      }
      setRoom(payload.room);
      setSession(payload.session);
      integrationRef.current?.onSessionStarted?.();
    };

    const handleTexasHoldemActionPerformed = (payload: { roomId?: string }) => {
      if (payload?.roomId && payload.roomId !== roomId) {
        return;
      }
      const ref = integrationRef.current as TexasHoldemRoomHandle | null;
      ref?.onHoldemActionPerformed?.();
    };

    const handleException = (payload: unknown) => {
      integrationRef.current?.onException();

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
        normalizeWsMessageCode(detail?.messageCode) ?? normalizeWsMessageCode(detail?.code);

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
          descriptor?.translationKey ?? inferTranslationKeyFromMessageKey(messageKey),
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
    socket.on('games.session.holdem_started', handleTexasHoldemStarted);
    socket.on('games.session.holdem_action.performed', handleTexasHoldemActionPerformed);
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
      socket.off('games.session.holdem_started', handleTexasHoldemStarted);
      socket.off('games.session.holdem_action.performed', handleTexasHoldemActionPerformed);
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
      integrationRef.current?.onException();
      router.replace('/(tabs)/games');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('games.alerts.couldNotLeaveMessage');
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
      integrationRef.current?.onException();
      router.replace('/(tabs)/games');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('games.alerts.genericError');
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

    Alert.alert(t('games.alerts.leavePromptTitle'), t('games.alerts.leavePromptMessage'), [
      { text: t('common.actions.stay'), style: 'cancel' },
      {
        text: t('common.actions.leave'),
        style: 'destructive',
        onPress: () => {
          void performLeave();
        },
      },
    ]);
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
      Alert.alert(t('games.alerts.signInRequiredTitle'), t('games.alerts.signInManageSeatMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.signIn'),
          onPress: () => router.push('/auth' as never),
        },
      ]);
      return;
    }

    if (deleting) {
      return;
    }

    Alert.alert(t('games.alerts.deletePromptTitle'), t('games.alerts.deletePromptMessage'), [
      { text: t('common.actions.stay'), style: 'cancel' },
      {
        text: t('games.room.buttons.deleteRoom'),
        style: 'destructive',
        onPress: () => {
          void performDelete();
        },
      },
    ]);
  }, [deleting, handleLeaveRoom, isHost, performDelete, roomId, router, t, tokens.accessToken]);

  const handleViewGame = useCallback(() => {
    const targetGameId = room?.gameId ?? gameId;
    if (!targetGameId) return;
    router.push({ pathname: '/games/[id]', params: { id: targetGameId } });
  }, [gameId, room?.gameId, router]);

  const displayGameId = room?.gameId ?? gameId ?? undefined;
  const integrationId = useMemo(() => {
    const engineId = session?.engine;
    if (engineId && GAME_INTEGRATION_MAP[engineId]) {
      return GAME_INTEGRATION_MAP[engineId];
    }
    if (room?.gameId && GAME_INTEGRATION_MAP[room.gameId]) {
      return GAME_INTEGRATION_MAP[room.gameId];
    }
    if (gameId && GAME_INTEGRATION_MAP[gameId]) {
      return GAME_INTEGRATION_MAP[gameId];
    }
    return undefined;
  }, [gameId, room?.gameId, session?.engine]);
  const handleRefresh = useCallback(() => fetchRoom('refresh'), [fetchRoom]);

  if (integrationId === 'exploding_cats_v1') {
    return (
      <ExplodingCatsRoom
        ref={integrationRef as React.Ref<ExplodingCatsRoomHandle>}
        room={room}
        session={session}
        fallbackName={fallbackName}
        gameId={displayGameId}
        tokens={tokens}
        refreshTokens={refreshTokens}
        insetsTop={insets.top}
        fetchRoom={fetchRoom}
        refreshing={refreshing}
        loading={loading}
        error={error}
        isHost={isHost}
        deleting={deleting}
        leaving={leaving}
        onDeleteRoom={handleDeleteRoom}
        onLeaveRoom={handleLeaveRoom}
        onViewGame={handleViewGame}
        setRoom={setRoom}
        setSession={setSession}
      />
    );
  }

  if (integrationId === 'texas_holdem_v1') {
    return (
      <TexasHoldemRoom
        ref={integrationRef as React.Ref<TexasHoldemRoomHandle>}
        room={room}
        session={session}
        fallbackName={fallbackName}
        gameId={displayGameId}
        tokens={tokens}
        refreshTokens={refreshTokens}
        insetsTop={insets.top}
        fetchRoom={fetchRoom}
        refreshing={refreshing}
        loading={loading}
        error={error}
        isHost={isHost}
        deleting={deleting}
        leaving={leaving}
        onDeleteRoom={handleDeleteRoom}
        onLeaveRoom={handleLeaveRoom}
        onViewGame={handleViewGame}
        setRoom={setRoom}
        setSession={setSession}
      />
    );
  }

  return (
    <UnsupportedGameView
      gameId={displayGameId}
      fallbackName={fallbackName}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRefresh={handleRefresh}
      onLeaveRoom={handleLeaveRoom}
      onDeleteRoom={isHost ? handleDeleteRoom : undefined}
      isHost={isHost}
      deleting={deleting}
      leaving={leaving}
    />
  );
}

interface UnsupportedGameViewProps {
  gameId?: string;
  fallbackName?: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onLeaveRoom: () => void;
  onDeleteRoom?: () => void;
  isHost: boolean;
  deleting: boolean;
  leaving: boolean;
}

function UnsupportedGameView({
  gameId,
  fallbackName,
  loading,
  refreshing,
  error,
  onRefresh,
  onLeaveRoom,
  onDeleteRoom,
  isHost,
  deleting,
  leaving,
}: UnsupportedGameViewProps) {
  const styles = useThemedStyles(createFallbackStyles);
  const { t } = useTranslation();

  const displayName = fallbackName ?? t('games.room.defaultName');
  const displayGame = gameId ? formatRoomGame(gameId) : t('games.rooms.unknownGame');
  const subtitle = displayGame
    ? `${displayGame} is not available in this version yet.`
    : 'This game is not available in this version yet.';

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <IconSymbol name="questionmark.circle" size={42} color={styles.icon.color as string} />
        <ThemedText type="title" style={styles.title} numberOfLines={2}>
          {displayName}
        </ThemedText>
        <ThemedText style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </ThemedText>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, refreshing || loading ? styles.disabled : null]}
            onPress={onRefresh}
            disabled={refreshing || loading}
          >
            <ThemedText style={styles.primaryButtonText}>{t('common.retry')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, leaving ? styles.disabled : null]}
            onPress={onLeaveRoom}
            disabled={leaving}
          >
            <ThemedText style={styles.secondaryButtonText}>{t('common.actions.leave')}</ThemedText>
          </TouchableOpacity>
          {isHost && onDeleteRoom ? (
            <TouchableOpacity
              style={[styles.destructiveButton, deleting ? styles.disabled : null]}
              onPress={onDeleteRoom}
              disabled={deleting}
            >
              <ThemedText style={styles.destructiveButtonText}>{t('games.room.buttons.deleteRoom')}</ThemedText>
            </TouchableOpacity>
          ) : null}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

function createFallbackStyles(palette: Palette) {
  const isLight = palette.isLight;

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: palette.background,
    },
    card: {
      width: '100%',
      alignItems: 'center',
      gap: 16,
      borderRadius: 24,
      paddingVertical: 48,
      paddingHorizontal: 24,
      backgroundColor: palette.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      ...platformShadow({
        color: palette.gameRoom.surfaceShadow,
        opacity: isLight ? 0.35 : 0.55,
        radius: 14,
        offset: { width: 0, height: 6 },
        elevation: 2,
      }),
    },
    icon: {
      color: palette.tint,
    },
    title: {
      textAlign: 'center',
      fontSize: 26,
      fontWeight: '700',
    },
    subtitle: {
      textAlign: 'center',
      color: palette.icon,
      fontSize: 16,
    },
    error: {
      marginTop: 12,
      textAlign: 'center',
      color: palette.error,
    },
    actions: {
      marginTop: 24,
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: palette.tint,
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    secondaryButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: palette.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
    },
    secondaryButtonText: {
      color: palette.text,
      fontWeight: '600',
    },
    destructiveButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 16,
  backgroundColor: palette.destructive,
    },
    destructiveButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
