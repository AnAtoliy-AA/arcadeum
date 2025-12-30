import { useCallback } from 'react';
import { Alert } from 'react-native';
import { gameSocket as socket } from '@/hooks/useSocket';
import {
  startGameRoom,
  type GameRoomSummary,
  type GameSessionSummary,
} from '../../api/gamesApi';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import type {
  ExplodingCatsCatComboInput,
  LogVisibility,
} from '../../components/ExplodingCatsTable';
import type { ActionBusyType } from './ExplodingCatsRoom.types';
import { useTranslation } from '@/lib/i18n';

interface UseGameActionsParams {
  room: GameRoomSummary | null;
  tokens: SessionTokensSnapshot;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
  isHost: boolean;
  actionBusy: ActionBusyType;
  startBusy: boolean;
  setActionBusy: (value: ActionBusyType) => void;
  setStartBusy: (value: boolean) => void;
  setRoom: React.Dispatch<React.SetStateAction<GameRoomSummary | null>>;
  setSession: React.Dispatch<React.SetStateAction<GameSessionSummary | null>>;
}

export function useGameActions({
  room,
  tokens,
  refreshTokens,
  isHost,
  actionBusy,
  startBusy,
  setActionBusy,
  setStartBusy,
  setRoom,
  setSession,
}: UseGameActionsParams) {
  const { t } = useTranslation();

  const handleStartMatch = useCallback(() => {
    if (!room?.id) {
      return;
    }

    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInStartMatchMessage'),
      );
      return;
    }

    if (!isHost || startBusy) {
      return;
    }

    setStartBusy(true);
    startGameRoom(
      { roomId: room.id, engine: 'exploding_kittens_v1' },
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
  }, [
    isHost,
    refreshTokens,
    room?.id,
    setRoom,
    setSession,
    setStartBusy,
    startBusy,
    t,
    tokens.accessToken,
  ]);

  const handleDrawCard = useCallback(() => {
    if (!room?.id || !tokens.userId) {
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
      roomId: room.id,
      userId: tokens.userId,
    });
  }, [actionBusy, room?.id, setActionBusy, t, tokens.userId]);

  const handlePlayCard = useCallback(
    (card: 'skip' | 'attack' | 'shuffle') => {
      if (!room?.id || !tokens.userId) {
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
        roomId: room.id,
        userId: tokens.userId,
        card,
      });
    },
    [actionBusy, room?.id, setActionBusy, t, tokens.userId],
  );

  const handlePlayNope = useCallback(() => {
    if (!room?.id || !tokens.userId) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInPlayCardMessage'),
      );
      return;
    }

    if (actionBusy) {
      return;
    }

    setActionBusy('nope');
    socket.emit('games.session.play_nope', {
      roomId: room.id,
      userId: tokens.userId,
    });
  }, [actionBusy, room?.id, setActionBusy, t, tokens.userId]);

  const handlePlayFavor = useCallback(
    (targetPlayerId: string) => {
      if (!room?.id || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInPlayCardMessage'),
        );
        return;
      }

      if (actionBusy) {
        return;
      }

      setActionBusy('favor');
      socket.emit('games.session.play_favor', {
        roomId: room.id,
        userId: tokens.userId,
        targetPlayerId,
      });
    },
    [actionBusy, room?.id, setActionBusy, t, tokens.userId],
  );

  const handlePlaySeeTheFuture = useCallback(() => {
    if (!room?.id || !tokens.userId) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInPlayCardMessage'),
      );
      return;
    }

    if (actionBusy) {
      return;
    }

    setActionBusy('see_the_future');
    socket.emit('games.session.play_see_the_future', {
      roomId: room.id,
      userId: tokens.userId,
    });
  }, [actionBusy, room?.id, setActionBusy, t, tokens.userId]);

  const handlePlayCatCombo = useCallback(
    (input: ExplodingCatsCatComboInput) => {
      if (!room?.id || !tokens.userId) {
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
        roomId: room.id,
        userId: tokens.userId,
        cat: input.cat,
        mode: input.mode,
        targetPlayerId: input.targetPlayerId,
        desiredCard: input.mode === 'trio' ? input.desiredCard : undefined,
      });
    },
    [actionBusy, room?.id, setActionBusy, t, tokens.userId],
  );

  const handlePlayDefuse = useCallback(
    (position: number) => {
      if (!room?.id || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInPlayCardMessage'),
        );
        return;
      }

      if (actionBusy) {
        return;
      }

      setActionBusy('defuse');
      socket.emit('games.session.play_defuse', {
        roomId: room.id,
        userId: tokens.userId,
        position,
      });
    },
    [actionBusy, room?.id, setActionBusy, t, tokens.userId],
  );

  const handlePostHistoryNote = useCallback(
    (message: string, scope: LogVisibility) => {
      if (!room?.id || !tokens.userId) {
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
        roomId: room.id,
        userId: tokens.userId,
        message: trimmed,
        scope,
      });

      return Promise.resolve();
    },
    [room?.id, t, tokens.userId],
  );

  const handleGiveFavorCard = useCallback(
    (cardToGive: string) => {
      if (!room?.id || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInPlayCardMessage'),
        );
        return;
      }

      if (actionBusy) {
        return;
      }

      setActionBusy('favor');
      socket.emit('games.session.give_favor_card', {
        roomId: room.id,
        userId: tokens.userId,
        cardToGive,
      });
    },
    [actionBusy, room?.id, setActionBusy, t, tokens.userId],
  );

  return {
    handleStartMatch,
    handleDrawCard,
    handlePlayCard,
    handlePlayNope,
    handlePlayFavor,
    handleGiveFavorCard,
    handlePlaySeeTheFuture,
    handlePlayCatCombo,
    handlePlayDefuse,
    handlePostHistoryNote,
  };
}
