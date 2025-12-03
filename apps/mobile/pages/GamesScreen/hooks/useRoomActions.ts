import { useCallback } from 'react';
import { Alert } from 'react-native';
import type { Router } from 'expo-router';
import { useTranslation } from '@/lib/i18n';
import {
  joinGameRoom,
  listGameRooms,
  type GameRoomSummary,
  type ListGameRoomsParams,
} from '../api/gamesApi';
import { interpretJoinError } from '../joinErrorUtils';
import type {
  InvitePromptState,
  StatusFilterValue,
  ParticipationFilterValue,
} from '../types';

type UseRoomActionsParams = {
  tokens: { accessToken: string | null; userId: string | null };
  refreshTokens: () => Promise<any>;
  statusFilter: StatusFilterValue;
  participationFilter: ParticipationFilterValue;
  setRooms: (rooms: GameRoomSummary[]) => void;
  setRoomsLoading: (loading: boolean) => void;
  setRoomsRefreshing: (refreshing: boolean) => void;
  setRoomsError: (error: string | null) => void;
  setJoiningRoomId: (id: string | null) => void;
  setInvitePrompt: (state: InvitePromptState) => void;
  updateRoomList: (room: GameRoomSummary) => void;
  router: Router;
};

export function useRoomActions({
  tokens,
  refreshTokens,
  statusFilter,
  participationFilter,
  setRooms,
  setRoomsLoading,
  setRoomsRefreshing,
  setRoomsError,
  setJoiningRoomId,
  setInvitePrompt,
  updateRoomList,
  router,
}: UseRoomActionsParams) {
  const { t } = useTranslation();

  const navigateToRoomScreen = useCallback(
    (room: GameRoomSummary) => {
      router.push({
        pathname: '/games/rooms/[id]',
        params: {
          id: room.id,
          gameId: room.gameId,
          roomName: room.name,
        },
      });
    },
    [router],
  );

  const fetchRooms = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      const setLoadingFlag =
        mode === 'initial' ? setRoomsLoading : setRoomsRefreshing;
      setLoadingFlag(true);

      try {
        const authOptions = tokens.accessToken
          ? {
              accessToken: tokens.accessToken,
              refreshTokens: refreshTokens as any,
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
      setRooms,
      setRoomsError,
      setRoomsLoading,
      setRoomsRefreshing,
      statusFilter,
      t,
      tokens.accessToken,
    ],
  );

  const joinRoom = useCallback(
    async (room: GameRoomSummary, inviteCode?: string) => {
      setJoiningRoomId(room.id);
      if (inviteCode) {
        setInvitePrompt({
          visible: true,
          room,
          mode: 'room',
          loading: true,
          error: null,
        });
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

        setInvitePrompt({
          visible: false,
          room: null,
          mode: 'room',
          loading: false,
          error: null,
        });

        navigateToRoomScreen(response.room);
        void fetchRooms('refresh');
      } catch (error) {
        const { type, message: rawMessage } = interpretJoinError(error);

        if (!inviteCode && type === 'invite-required') {
          setInvitePrompt({
            visible: true,
            room,
            mode: 'room',
            loading: false,
            error: null,
          });
          return;
        }

        if (
          inviteCode &&
          (type === 'invite-required' || type === 'invite-invalid')
        ) {
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
          Alert.alert(
            t('games.alerts.roomFullTitle'),
            t('games.alerts.roomFullMessage'),
          );
          return;
        }

        if (type === 'room-locked') {
          Alert.alert(
            t('games.alerts.roomLockedTitle'),
            t('games.alerts.roomLockedMessage'),
          );
          return;
        }

        const fallbackMessage =
          rawMessage && rawMessage !== 'Something went wrong.'
            ? rawMessage
            : t('games.alerts.genericError');
        Alert.alert(t('games.alerts.genericJoinFailedTitle'), fallbackMessage);
      } finally {
        setJoiningRoomId(null);
      }
    },
    [
      fetchRooms,
      navigateToRoomScreen,
      refreshTokens,
      setInvitePrompt,
      setJoiningRoomId,
      t,
      tokens.accessToken,
      updateRoomList,
    ],
  );

  const joinRoomByInviteCode = useCallback(
    async (code: string) => {
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

        setInvitePrompt({
          visible: false,
          room: null,
          mode: 'room',
          loading: false,
          error: null,
        });

        navigateToRoomScreen(response.room);
        void fetchRooms('refresh');
      } catch (error) {
        const { type, message: rawMessage } = interpretJoinError(error);

        if (type === 'room-full') {
          setInvitePrompt({
            visible: false,
            room: null,
            mode: 'room',
            loading: false,
            error: null,
          });
          Alert.alert(
            t('games.alerts.roomFullTitle'),
            t('games.alerts.roomFullManualMessage'),
          );
          return;
        }

        if (type === 'room-locked') {
          setInvitePrompt({
            visible: false,
            room: null,
            mode: 'room',
            loading: false,
            error: null,
          });
          Alert.alert(
            t('games.alerts.roomLockedTitle'),
            t('games.alerts.roomLockedManualMessage'),
          );
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
    },
    [
      fetchRooms,
      navigateToRoomScreen,
      refreshTokens,
      router,
      setInvitePrompt,
      t,
      tokens.accessToken,
      updateRoomList,
    ],
  );

  const handleJoinRoom = useCallback(
    (room: GameRoomSummary) => {
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
    },
    [joinRoom, router, t, tokens.accessToken],
  );

  const handleWatchRoom = useCallback(
    (room: GameRoomSummary) => {
      navigateToRoomScreen(room);
    },
    [navigateToRoomScreen],
  );

  return {
    fetchRooms,
    joinRoom,
    joinRoomByInviteCode,
    handleJoinRoom,
    handleWatchRoom,
    navigateToRoomScreen,
  };
}
