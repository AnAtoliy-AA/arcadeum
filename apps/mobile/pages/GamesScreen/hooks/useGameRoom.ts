import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showGlobalError } from '@/components/ui/ErrorToastProvider';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useTranslation } from '@/lib/i18n';
import {
  findApiMessageDescriptor,
  inferTranslationKeyFromMessageKey,
} from '@/lib/apiMessageCatalog';
import { gameSocket as socket } from '@/hooks/useSocket';

import {
  deleteGameRoom,
  leaveGameRoom,
  getGameRoom,
  getGameRoomSession,
  type GameRoomSummary,
  type GameSessionSummary,
} from '../api/gamesApi';
import { type ExplodingCatsRoomHandle } from '../gameIntegrations/ExplodingCats/ExplodingCatsRoom';
import { type TexasHoldemRoomHandle } from '../gameIntegrations/TexasHoldem/TexasHoldemRoom';
import {
  resolveParam,
  normalizeWsMessageCode,
  shouldExposeRawWsMessage,
  resolveIntegrationId,
} from './useGameRoomUtils';

export function useGameRoom(
  integrationRef: React.MutableRefObject<
    ExplodingCatsRoomHandle | TexasHoldemRoomHandle | null
  >,
) {
  const insets = useSafeAreaInsets();
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
  const isHost =
    room?.hostId && tokens.userId ? room.hostId === tokens.userId : false;

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
      integrationRef.current?.onException();

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
    socket.on('games.session.holdem_started', handleTexasHoldemStarted);
    socket.on(
      'games.session.holdem_action.performed',
      handleTexasHoldemActionPerformed,
    );
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
      socket.off(
        'games.session.holdem_action.performed',
        handleTexasHoldemActionPerformed,
      );
      socket.off('exception', handleException);
    };
  }, [deleting, hydrated, roomId, router, t, tokens.userId, integrationRef]);

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
        err instanceof Error
          ? err.message
          : t('games.alerts.couldNotLeaveMessage');
      Alert.alert(t('games.alerts.couldNotLeaveTitle'), message);
    } finally {
      setLeaving(false);
    }
  }, [refreshTokens, roomId, router, t, tokens.accessToken, integrationRef]);

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
      const message =
        err instanceof Error ? err.message : t('games.alerts.genericError');
      Alert.alert(t('games.alerts.actionFailedTitle'), message);
    } finally {
      setDeleting(false);
    }
  }, [refreshTokens, roomId, router, t, tokens.accessToken, integrationRef]);

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

  const handleViewGame = useCallback(() => {
    const targetGameId = room?.gameId ?? gameId;
    if (!targetGameId) return;
    router.push({ pathname: '/games/[id]', params: { id: targetGameId } });
  }, [gameId, room?.gameId, router]);

  const displayGameId = room?.gameId ?? gameId ?? undefined;
  const integrationId = useMemo(
    () => resolveIntegrationId(session?.engine, room?.gameId, gameId),
    [gameId, room?.gameId, session?.engine],
  );

  return {
    room,
    setRoom,
    session,
    setSession,
    loading,
    refreshing,
    error,
    isHost,
    deleting,
    leaving,
    fetchRoom,
    handleLeaveRoom,
    handleDeleteRoom,
    handleViewGame,
    fallbackName,
    displayGameId,
    integrationId,
    tokens,
    refreshTokens,
    insets,
  };
}
