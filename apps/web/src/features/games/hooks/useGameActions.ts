import { useCallback, useEffect } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import type { ChatScope } from '@/shared/types/games';

export type GameType = 'exploding_kittens_v1' | 'texas_holdem_v1' | null;

interface UseGameActionsOptions {
  roomId: string;
  userId: string | null;
  gameType: GameType;
  setActionBusy?: (action: string | null) => void;
  onActionComplete?: () => void;
}

interface UseGameActionsReturn {
  // Exploding Cats actions
  startExplodingCats: () => void;
  drawCard: () => void;
  playActionCard: (card: string, payload?: Record<string, unknown>) => void;
  playNope: () => void;
  playFavor: (targetPlayerId: string) => void;
  giveFavorCard: (cardToGive: string) => void;
  playSeeTheFuture: () => void;
  playCatCombo: (
    cat: string | null,
    mode: string,
    targetPlayerId?: string,
    desiredCard?: string,
    selectedIndex?: number,
    requestedDiscardCard?: string,
    cards?: string[],
  ) => void;
  playDefuse: (position: number) => void;

  // Texas Hold'em actions
  startHoldem: (startingChips?: number) => void;
  holdemAction: (
    action: 'fold' | 'check' | 'call' | 'raise',
    raiseAmount?: number,
  ) => void;

  // Common actions
  postHistoryNote: (message: string, scope: ChatScope) => void;
}

/**
 * Hook for managing game-specific actions
 * Provides action emitters for different game types
 */
export function useGameActions(
  options: UseGameActionsOptions,
): UseGameActionsReturn {
  const { roomId, userId, gameType, setActionBusy, onActionComplete } = options;

  // Setup game-specific listeners
  useEffect(() => {
    if (!gameType) return;

    const handleActionComplete = () => {
      onActionComplete?.();
    };

    if (gameType === 'exploding_kittens_v1') {
      gameSocket.on('games.session.drawn', handleActionComplete);
      gameSocket.on('games.session.action.played', handleActionComplete);
      gameSocket.on(
        'games.session.see_the_future.played',
        handleActionComplete,
      );
      gameSocket.on('games.session.favor.played', handleActionComplete);
      gameSocket.on('games.session.cat_combo.played', handleActionComplete);
      gameSocket.on('games.session.defuse.played', handleActionComplete);
      gameSocket.on('games.session.nope.played', handleActionComplete);
    } else if (gameType === 'texas_holdem_v1') {
      gameSocket.on('games.session.holdem_started', handleActionComplete);
      gameSocket.on(
        'games.session.holdem_action.performed',
        handleActionComplete,
      );
    }

    return () => {
      if (gameType === 'exploding_kittens_v1') {
        gameSocket.off('games.session.drawn', handleActionComplete);
        gameSocket.off('games.session.action.played', handleActionComplete);
        gameSocket.off(
          'games.session.see_the_future.played',
          handleActionComplete,
        );
        gameSocket.off('games.session.favor.played', handleActionComplete);
        gameSocket.off('games.session.cat_combo.played', handleActionComplete);
        gameSocket.off('games.session.defuse.played', handleActionComplete);
        gameSocket.off('games.session.nope.played', handleActionComplete);
      } else if (gameType === 'texas_holdem_v1') {
        gameSocket.off('games.session.holdem_started', handleActionComplete);
        gameSocket.off(
          'games.session.holdem_action.performed',
          handleActionComplete,
        );
      }
    };
  }, [gameType, onActionComplete]);

  // Exploding Cats actions
  const startExplodingCats = useCallback(() => {
    if (!userId) return;
    gameSocket.emit('games.session.start', {
      roomId,
      userId,
      engine: 'exploding_kittens_v1',
    });
  }, [roomId, userId]);

  const drawCard = useCallback(() => {
    if (!userId) return;
    setActionBusy?.('draw');
    gameSocket.emit('games.session.draw', { roomId, userId });
  }, [roomId, userId, setActionBusy]);

  const playActionCard = useCallback(
    (card: string, payload?: Record<string, unknown>) => {
      if (!userId) return;
      setActionBusy?.(card);
      gameSocket.emit('games.session.play_action', {
        roomId,
        userId,
        card,
        ...payload,
      });
    },
    [roomId, userId, setActionBusy],
  );

  const playFavor = useCallback(
    (targetPlayerId: string) => {
      if (!userId) return;
      setActionBusy?.('favor');
      gameSocket.emit('games.session.play_favor', {
        roomId,
        userId,
        targetPlayerId,
      });
    },
    [roomId, userId, setActionBusy],
  );

  const giveFavorCard = useCallback(
    (cardToGive: string) => {
      if (!userId) return;
      gameSocket.emit('games.session.give_favor_card', {
        roomId,
        userId,
        cardToGive,
      });
    },
    [roomId, userId],
  );

  const playSeeTheFuture = useCallback(() => {
    if (!userId) return;
    setActionBusy?.('see_the_future');
    gameSocket.emit('games.session.play_see_the_future', { roomId, userId });
  }, [roomId, userId, setActionBusy]);

  const playCatCombo = useCallback(
    (
      cat: string | null,
      mode: string,
      targetPlayerId?: string,
      desiredCard?: string,
      selectedIndex?: number,
      requestedDiscardCard?: string,
      cards?: string[],
    ) => {
      if (!userId) return;
      setActionBusy?.('cat_combo');
      gameSocket.emit('games.session.play_cat_combo', {
        roomId,
        userId,
        cat,
        mode,
        targetPlayerId,
        desiredCard,
        selectedIndex,
        requestedDiscardCard,
        cards,
      });
    },
    [roomId, userId, setActionBusy],
  );

  const playDefuse = useCallback(
    (position: number) => {
      if (!userId) return;
      setActionBusy?.('defuse');
      gameSocket.emit('games.session.play_defuse', {
        roomId,
        userId,
        position,
      });
    },
    [roomId, userId, setActionBusy],
  );

  const playNope = useCallback(() => {
    if (!userId) return;
    setActionBusy?.('nope');
    gameSocket.emit('games.session.play_nope', { roomId, userId });
  }, [roomId, userId, setActionBusy]);

  // Texas Hold'em actions
  const startHoldem = useCallback(
    (startingChips: number = 1000) => {
      if (!userId) return;
      gameSocket.emit('games.session.start_holdem', {
        roomId,
        userId,
        engine: 'texas_holdem_v1',
        startingChips,
      });
    },
    [roomId, userId],
  );

  const holdemAction = useCallback(
    (action: 'fold' | 'check' | 'call' | 'raise', raiseAmount?: number) => {
      if (!userId) return;
      gameSocket.emit('games.session.holdem_action', {
        roomId,
        userId,
        action,
        raiseAmount,
      });
    },
    [roomId, userId],
  );

  // Common actions
  const postHistoryNote = useCallback(
    (message: string, scope: ChatScope) => {
      if (!userId) return;

      const event =
        gameType === 'texas_holdem_v1'
          ? 'games.session.holdem_history_note'
          : 'games.session.history_note';

      gameSocket.emit(event, { roomId, userId, message, scope });
    },
    [roomId, userId, gameType],
  );

  return {
    // Exploding Cats
    startExplodingCats,
    drawCard,
    playActionCard,
    playNope,
    playFavor,
    giveFavorCard,
    playSeeTheFuture,
    playCatCombo,
    playDefuse,

    // Texas Hold'em
    startHoldem,
    holdemAction,

    // Common
    postHistoryNote,
  };
}
