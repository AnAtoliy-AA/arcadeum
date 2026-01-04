import { useEffect } from 'react';
import { Alert } from 'react-native';
import type { Router } from 'expo-router';

import { showGlobalError } from '@/components/ui/ErrorToastProvider';
import {
  findApiMessageDescriptor,
  inferTranslationKeyFromMessageKey,
} from '@/lib/apiMessageCatalog';
import { gameSocket as socket } from '@/hooks/useSocket';
import { maybeDecrypt } from '@/lib/socket-encryption';

import { type GameRoomSummary, type GameSessionSummary } from '../api/gamesApi';
import { type ExplodingCatsRoomHandle } from '../gameIntegrations/ExplodingCats/ExplodingCatsRoom';
import { type TexasHoldemRoomHandle } from '../gameIntegrations/TexasHoldem/TexasHoldemRoom';
import {
  normalizeWsMessageCode,
  shouldExposeRawWsMessage,
} from './useGameRoomUtils';

interface UseGameRoomSocketParams {
  roomId: string | null | undefined;
  hydrated: boolean;
  userId: string | undefined;
  deleting: boolean;
  router: Router;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => string;
  setRoom: React.Dispatch<React.SetStateAction<GameRoomSummary | null>>;
  setSession: React.Dispatch<React.SetStateAction<GameSessionSummary | null>>;
  integrationRef: React.MutableRefObject<
    ExplodingCatsRoomHandle | TexasHoldemRoomHandle | null
  >;
}

export function useGameRoomSocket({
  roomId,
  hydrated,
  userId,
  deleting,
  router,
  t,
  setRoom,
  setSession,
  integrationRef,
}: UseGameRoomSocketParams): void {
  useEffect(() => {
    if (!roomId || !hydrated) {
      return;
    }

    const isParticipant = Boolean(userId);
    const joinEvent = isParticipant ? 'games.room.join' : 'games.room.watch';
    const joinPayload = isParticipant ? { roomId, userId } : { roomId };

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

    // Generic handler for action completion events (draw, action.played, etc.)
    const handleActionCompleted = (payload: { roomId?: string }) => {
      if (payload?.roomId && payload.roomId !== roomId) {
        return;
      }
      integrationRef.current?.onSessionSnapshot();
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

    // Decrypt wrapper for socket handlers
    const decryptHandler = <T>(handler: (payload: T) => void) => {
      return async (raw: unknown) => {
        const payload = await maybeDecrypt<T>(raw);
        handler(payload);
      };
    };

    // Create wrapped handlers
    const wrappedHandleJoined = decryptHandler(handleJoined);
    const wrappedHandleRoomUpdate = decryptHandler(handleRoomUpdate);
    const wrappedHandleRoomDeleted = decryptHandler(handleRoomDeleted);
    const wrappedHandleSnapshot = decryptHandler(handleSnapshot);
    const wrappedHandleSessionStarted = decryptHandler(handleSessionStarted);
    const wrappedHandleCatComboPlayed = decryptHandler(handleCatComboPlayed);
    const wrappedHandleActionCompleted = decryptHandler(handleActionCompleted);
    const wrappedHandleTexasHoldemStarted = decryptHandler(
      handleTexasHoldemStarted,
    );
    const wrappedHandleTexasHoldemActionPerformed = decryptHandler(
      handleTexasHoldemActionPerformed,
    );
    const wrappedHandleException = decryptHandler(handleException);

    socket.on('connect', handleConnect);
    socket.on('games.room.joined', wrappedHandleJoined);
    socket.on('games.room.watching', wrappedHandleJoined);
    socket.on('games.room.update', wrappedHandleRoomUpdate);
    socket.on('games.room.deleted', wrappedHandleRoomDeleted);
    socket.on('games.session.snapshot', wrappedHandleSnapshot);
    socket.on('games.session.started', wrappedHandleSessionStarted);
    socket.on('games.session.cat_combo.played', wrappedHandleCatComboPlayed);
    // Exploding Cats action completion events
    socket.on('games.session.drawn', wrappedHandleActionCompleted);
    socket.on('games.session.action.played', wrappedHandleActionCompleted);
    socket.on(
      'games.session.see_the_future.played',
      wrappedHandleActionCompleted,
    );
    socket.on('games.session.favor.played', wrappedHandleActionCompleted);
    socket.on('games.session.defuse.played', wrappedHandleActionCompleted);
    socket.on('games.session.nope.played', wrappedHandleActionCompleted);
    socket.on('games.session.holdem_started', wrappedHandleTexasHoldemStarted);
    socket.on(
      'games.session.holdem_action.performed',
      wrappedHandleTexasHoldemActionPerformed,
    );
    socket.on('exception', wrappedHandleException);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('games.room.joined', wrappedHandleJoined);
      socket.off('games.room.watching', wrappedHandleJoined);
      socket.off('games.room.update', wrappedHandleRoomUpdate);
      socket.off('games.room.deleted', wrappedHandleRoomDeleted);
      socket.off('games.session.snapshot', wrappedHandleSnapshot);
      socket.off('games.session.started', wrappedHandleSessionStarted);
      socket.off('games.session.cat_combo.played', wrappedHandleCatComboPlayed);
      // Exploding Cats action completion events
      socket.off('games.session.drawn', wrappedHandleActionCompleted);
      socket.off('games.session.action.played', wrappedHandleActionCompleted);
      socket.off(
        'games.session.see_the_future.played',
        wrappedHandleActionCompleted,
      );
      socket.off('games.session.favor.played', wrappedHandleActionCompleted);
      socket.off('games.session.defuse.played', wrappedHandleActionCompleted);
      socket.off('games.session.nope.played', wrappedHandleActionCompleted);
      socket.off(
        'games.session.holdem_started',
        wrappedHandleTexasHoldemStarted,
      );
      socket.off(
        'games.session.holdem_action.performed',
        wrappedHandleTexasHoldemActionPerformed,
      );
      socket.off('exception', wrappedHandleException);
    };
  }, [
    deleting,
    hydrated,
    roomId,
    router,
    t,
    userId,
    integrationRef,
    setRoom,
    setSession,
  ]);
}
