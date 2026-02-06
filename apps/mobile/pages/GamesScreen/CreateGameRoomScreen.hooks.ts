import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useTranslation } from '@/lib/i18n';
import { useSessionTokens } from '@/stores/sessionTokens';

import { createGameRoom, type CreateGameRoomParams } from './api/gamesApi';
import { gamesCatalog, type GameCatalogueEntry } from './catalog';

type FormField = 'name' | 'maxPlayers' | 'notes';

export interface CreateGameRoomState {
  gameId: string;
  name: string;
  visibility: CreateGameRoomParams['visibility'];
  maxPlayers: string;
  notes: string;
  allowActionCardCombos: boolean;
  idleTimerEnabled: boolean;
  loading: boolean;
}

export type CreateGameRoomFieldChangeHandler = (
  field: FormField,
) => (value: string) => void;

export interface UseCreateGameRoomControllerResult {
  shouldBlock: boolean;
  availableGames: GameCatalogueEntry[];
  playableGames: GameCatalogueEntry[];
  selectedGame?: GameCatalogueEntry;
  formState: CreateGameRoomState;
  handleChange: CreateGameRoomFieldChangeHandler;
  handleToggleVisibility: () => void;
  handleToggleActionCardCombos: () => void;
  handleToggleIdleTimer: () => void;
  handleSelectGame: (gameId: string) => void;
  handleSubmit: () => Promise<void>;
  t: ReturnType<typeof useTranslation>['t'];
}

export function useCreateGameRoomController(): UseCreateGameRoomControllerResult {
  const router = useRouter();
  const params = useLocalSearchParams<{ gameId?: string }>();
  const { shouldBlock } = useSessionScreenGate({
    enableOn: ['web'],
    whenUnauthenticated: '/auth',
    blockWhenUnauthenticated: true,
  });
  const { tokens, refreshTokens } = useSessionTokens();
  const { t } = useTranslation();

  const visibleGames = useMemo(
    () => gamesCatalog.filter((game) => !game.isHidden),
    [],
  );

  const playableGames = useMemo(
    () => visibleGames.filter((game) => game.isPlayable),
    [visibleGames],
  );
  const availableGames = visibleGames;

  const initialGameId = useMemo(() => {
    const value = params?.gameId;
    const requestedId = Array.isArray(value) ? value[0] : value;
    if (requestedId && playableGames.some((game) => game.id === requestedId)) {
      return requestedId;
    }
    return playableGames[0]?.id ?? gamesCatalog[0]?.id ?? '';
  }, [params, playableGames]);

  const [formState, setFormState] = useState<CreateGameRoomState>({
    gameId: initialGameId,
    name: '',
    visibility: 'public',
    maxPlayers: '',
    notes: '',
    allowActionCardCombos: false,
    idleTimerEnabled: false,
    loading: false,
  });

  const selectedGame: GameCatalogueEntry | undefined = useMemo(
    () =>
      availableGames.find((game) => game.id === formState.gameId) ??
      availableGames[0],
    [availableGames, formState.gameId],
  );

  const handleChange: CreateGameRoomFieldChangeHandler = useCallback(
    (field) => (value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleToggleVisibility = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      visibility: prev.visibility === 'public' ? 'private' : 'public',
    }));
  }, []);

  const handleToggleActionCardCombos = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      allowActionCardCombos: !prev.allowActionCardCombos,
    }));
  }, []);

  const handleToggleIdleTimer = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      idleTimerEnabled: !prev.idleTimerEnabled,
    }));
  }, []);

  const handleSelectGame = useCallback(
    (gameId: string) => {
      if (
        playableGames.length &&
        !playableGames.some((game) => game.id === gameId)
      ) {
        return;
      }
      setFormState((prev) => ({ ...prev, gameId }));
    },
    [playableGames],
  );

  const handleSubmit = useCallback(async () => {
    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.create.alerts.signInMessage'),
      );
      return;
    }
    if (!formState.name.trim()) {
      Alert.alert(
        t('games.create.alerts.nameRequiredTitle'),
        t('games.create.alerts.nameRequiredMessage'),
      );
      return;
    }
    const maxPlayers = formState.maxPlayers.trim()
      ? Number(formState.maxPlayers)
      : undefined;
    if (
      maxPlayers !== undefined &&
      (Number.isNaN(maxPlayers) || maxPlayers < 2)
    ) {
      Alert.alert(
        t('games.create.alerts.invalidPlayersTitle'),
        t('games.create.alerts.invalidPlayersMessage'),
      );
      return;
    }

    setFormState((prev) => ({ ...prev, loading: true }));
    try {
      const payload: CreateGameRoomParams = {
        gameId: formState.gameId,
        name: formState.name.trim(),
        visibility: formState.visibility,
        maxPlayers,
        notes: formState.notes.trim() || undefined,
        gameOptions:
          formState.gameId === 'critical_v1'
            ? {
                allowActionCardCombos: formState.allowActionCardCombos,
                idleTimerEnabled: formState.idleTimerEnabled,
              }
            : undefined,
      };
      const response = await createGameRoom(payload, {
        accessToken: tokens.accessToken,
        refreshTokens,
      });
      Alert.alert(
        t('games.create.alerts.roomCreatedTitle'),
        t('games.create.alerts.roomCreatedMessage', {
          code:
            response.room.inviteCode ?? t('games.create.alerts.invitePending'),
        }),
      );
      router.replace({
        pathname: '/games/[id]',
        params: { id: response.room.id },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('games.create.alerts.createFailedMessage');
      Alert.alert(t('games.create.alerts.createFailedTitle'), message);
    } finally {
      setFormState((prev) => ({ ...prev, loading: false }));
    }
  }, [
    formState.gameId,
    formState.maxPlayers,
    formState.name,
    formState.notes,
    formState.visibility,
    formState.allowActionCardCombos,
    formState.idleTimerEnabled,
    refreshTokens,
    router,
    t,
    tokens.accessToken,
  ]);

  return {
    shouldBlock,
    availableGames,
    playableGames,
    selectedGame,
    formState,
    handleChange,
    handleToggleVisibility,
    handleToggleActionCardCombos,
    handleToggleIdleTimer,
    handleSelectGame,
    handleSubmit,
    t,
  };
}
