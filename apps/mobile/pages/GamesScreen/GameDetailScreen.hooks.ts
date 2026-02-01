import { useCallback, useState, useMemo } from 'react';
import { Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/lib/i18n';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import {
  joinGameRoom,
  listGameRooms,
  type GameRoomSummary,
} from './api/gamesApi';
import { interpretJoinError } from './joinErrorUtils';
import type { InvitePromptState } from './GameDetailScreen.types';
import type { GameCatalogueEntry } from './catalog';

interface UseRoomManagementParams {
  gameId: string | undefined;
  tokens: SessionTokensSnapshot;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
}

export function useRoomManagement({
  gameId,
  tokens,
  refreshTokens,
}: UseRoomManagementParams) {
  const { t } = useTranslation();
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

  const isFetchingRooms = roomsLoading || roomsRefreshing;

  const fetchRooms = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!gameId || !tokens.accessToken) {
        setRooms([]);
        setRoomsError(null);
        return;
      }

      const setLoading =
        mode === 'initial' ? setRoomsLoading : setRoomsRefreshing;
      setLoading(true);

      try {
        const response = await listGameRooms(
          { gameId },
          {
            accessToken: tokens.accessToken,
            refreshTokens,
          },
        );
        setRooms(response.rooms ?? []);
        setRoomsError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('games.errors.loadRooms');
        setRoomsError(message);
      } finally {
        setLoading(false);
      }
    },
    [gameId, refreshTokens, t, tokens.accessToken],
  );

  const sortedRooms = useMemo(() => {
    if (!rooms.length) return [];
    return [...rooms].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rooms]);

  const updateRoomList = useCallback((room: GameRoomSummary) => {
    setRooms((current) => {
      const next = [...current];
      const existingIndex = next.findIndex(
        (existing) => existing.id === room.id,
      );
      if (existingIndex >= 0) {
        next[existingIndex] = room;
        return next;
      }
      return [room, ...next];
    });
  }, []);

  return {
    rooms,
    sortedRooms,
    roomsLoading,
    roomsRefreshing,
    roomsError,
    isFetchingRooms,
    joiningRoomId,
    invitePrompt,
    fetchRooms,
    updateRoomList,
    setJoiningRoomId,
    setInvitePrompt,
  };
}

interface UseRoomActionsParams {
  tokens: SessionTokensSnapshot;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
  updateRoomList: (room: GameRoomSummary) => void;
  fetchRooms: (mode: 'initial' | 'refresh') => Promise<void>;
  setJoiningRoomId: (id: string | null) => void;
  invitePrompt: InvitePromptState;
  setInvitePrompt: React.Dispatch<React.SetStateAction<InvitePromptState>>;
}

export function useRoomActions({
  tokens,
  refreshTokens,
  updateRoomList,
  fetchRooms,
  setJoiningRoomId,
  invitePrompt,
  setInvitePrompt,
}: UseRoomActionsParams) {
  const router = useRouter();
  const { t } = useTranslation();

  const navigateToRoomScreen = useCallback(
    (nextRoom: GameRoomSummary) => {
      router.push({
        pathname: '/games/rooms/[id]',
        params: {
          id: nextRoom.id,
          gameId: nextRoom.gameId,
          roomName: nextRoom.name,
        },
      });
    },
    [router],
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

  const handleJoinRoom = useCallback(
    (room: GameRoomSummary) => {
      if (!tokens.accessToken) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInDetailMessage'),
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

      void joinRoom(room);
    },
    [joinRoom, router, t, tokens.accessToken],
  );

  const handleInviteCancel = useCallback(() => {
    setInvitePrompt({
      visible: false,
      room: null,
      mode: 'room',
      loading: false,
      error: null,
    });
  }, [setInvitePrompt]);

  const handleInviteSubmit = useCallback(
    (code: string) => {
      if (invitePrompt.mode !== 'room' || !invitePrompt.room) {
        return;
      }
      void joinRoom(invitePrompt.room, code);
    },
    [invitePrompt.mode, invitePrompt.room, joinRoom],
  );

  return {
    handleJoinRoom,
    handleInviteCancel,
    handleInviteSubmit,
  };
}

interface UseGameActionsParams {
  game: GameCatalogueEntry | undefined;
  appName: string;
}

export function useGameActions({ game, appName }: UseGameActionsParams) {
  const router = useRouter();
  const { t } = useTranslation();

  const showUnavailableAlert = useCallback(() => {
    Alert.alert(
      t('games.create.alerts.gameUnavailableTitle'),
      t('games.create.alerts.gameUnavailableMessage'),
    );
  }, [t]);

  const handleCreateRoom = useCallback(() => {
    if (!game) {
      return;
    }

    if (!game.isPlayable) {
      showUnavailableAlert();
      return;
    }

    router.push({ pathname: '/games/create', params: { gameId: game.id } });
  }, [game, router, showUnavailableAlert]);

  const handleInvite = useCallback(async () => {
    if (!game) return;
    try {
      await Share.share({
        title: t('games.share.title', { game: game.name }),
        message: t('games.share.message', { game: game.name, appName }),
      });
    } catch {
      Alert.alert(
        t('games.alerts.inviteShareFailedTitle'),
        t('games.alerts.inviteShareFailedMessage'),
      );
    }
  }, [appName, game, t]);

  return {
    handleCreateRoom,
    handleInvite,
  };
}
