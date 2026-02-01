import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { gameSocket as socket } from '@/hooks/useSocket';
import type { GameRoomSummary } from '../../api/gamesApi';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import type { ActionBusyType } from './TexasHoldemRoom.types';

type TranslateFn = (
  key: string,
  replacements?: Record<string, unknown>,
) => string;

interface UseTexasHoldemRoomStateParams {
  hasSessionSnapshot: boolean;
}

export function useTexasHoldemRoomState({
  hasSessionSnapshot,
}: UseTexasHoldemRoomStateParams) {
  const [startBusy, setStartBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<ActionBusyType>(null);
  const [tableFullScreen, setTableFullScreen] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  useEffect(() => {
    if (!hasSessionSnapshot) {
      setTableFullScreen(false);
    }
  }, [hasSessionSnapshot]);

  return {
    startBusy,
    setStartBusy,
    actionBusy,
    setActionBusy,
    tableFullScreen,
    setTableFullScreen,
    controlsCollapsed,
    setControlsCollapsed,
  };
}

interface UseTexasHoldemRoomActionsParams {
  room: GameRoomSummary | null;
  tokens: SessionTokensSnapshot;
  startBusy: boolean;
  actionBusy: ActionBusyType;
  setStartBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setActionBusy: React.Dispatch<React.SetStateAction<ActionBusyType>>;
  t: TranslateFn;
}

export function useTexasHoldemRoomActions({
  room,
  tokens,
  startBusy,
  actionBusy,
  setStartBusy,
  setActionBusy,
  t,
}: UseTexasHoldemRoomActionsParams) {
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

    if (startBusy) {
      return;
    }

    setStartBusy(true);
    socket.emit('games.session.start_holdem', {
      roomId: room.id,
      userId: tokens.userId,
      engine: 'texas_holdem_v1',
      startingChips: 1000,
    });
  }, [room?.id, startBusy, t, tokens.accessToken, tokens.userId, setStartBusy]);

  const handleTexasHoldemAction = useCallback(
    (action: 'fold' | 'check' | 'call' | 'raise', raiseAmount?: number) => {
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

      setActionBusy(action);
      socket.emit('games.session.holdem_action', {
        roomId: room.id,
        userId: tokens.userId,
        action,
        raiseAmount,
      });
    },
    [actionBusy, room?.id, t, tokens.userId, setActionBusy],
  );

  const handlePostHistoryNote = useCallback(
    (message: string, scope: 'all' | 'players') => {
      if (!room?.id || !tokens.userId) {
        return;
      }

      socket.emit('games.session.holdem_history_note', {
        roomId: room.id,
        userId: tokens.userId,
        message,
        scope,
      });
    },
    [room?.id, tokens.userId],
  );

  return {
    handleStartMatch,
    handleTexasHoldemAction,
    handlePostHistoryNote,
  };
}
