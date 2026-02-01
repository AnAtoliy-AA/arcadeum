import { useState, useCallback } from 'react';
import { useAutoplay } from './useAutoplay';
import { useIdleTimer } from './useIdleTimer';
import type {
  CriticalSnapshot,
  CriticalPlayerState,
  CriticalCard,
  GameRoomSummary,
} from '../types';

interface CriticalActions {
  drawCard: () => void;
  playNope: () => void;
  giveFavorCard: (card: CriticalCard) => void;
  playDefuse: (position: number) => void;
}

interface UseGameAutoplayIntegrationProps {
  room: GameRoomSummary;
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  currentPlayer: CriticalPlayerState | null;
  snapshot: CriticalSnapshot | null;
  currentUserId: string | null;
  actions: CriticalActions;
  handlePlayActionCard: (card: CriticalCard) => void;
}

export function useGameAutoplayIntegration({
  room,
  isMyTurn,
  canAct,
  canPlayNope,
  currentPlayer,
  snapshot,
  currentUserId,
  actions,
  handlePlayActionCard,
}: UseGameAutoplayIntegrationProps) {
  // Autoplay hook
  const autoplayState = useAutoplay({
    isMyTurn: !!isMyTurn,
    canAct: !!canAct,
    canPlayNope: !!canPlayNope,
    hand: currentPlayer?.hand ?? [],
    logs: snapshot?.logs ?? [],
    pendingAction: snapshot?.pendingAction ?? null,
    pendingFavor: snapshot?.pendingFavor ?? null,
    pendingDefuse: snapshot?.pendingDefuse ?? null,
    deckSize: snapshot?.deck?.length ?? 0,
    playerOrder: snapshot?.playerOrder ?? [],
    currentUserId,
    onDraw: actions.drawCard,
    onPlayActionCard: handlePlayActionCard,
    onPlayNope: actions.playNope,
    onGiveFavorCard: actions.giveFavorCard,
    onPlayDefuse: actions.playDefuse,
  });

  const { setAllEnabled } = autoplayState;

  // Idle timer autoplay
  const idleTimerEnabled = room.gameOptions?.idleTimerEnabled ?? false;
  const [idleTimerTriggered, setIdleTimerTriggered] = useState(false);

  const handleIdleTimeout = useCallback(() => {
    setIdleTimerTriggered(true);
    setAllEnabled(true);
  }, [setAllEnabled]);

  const idleTimer = useIdleTimer({
    enabled: idleTimerEnabled,
    isMyTurn: !!isMyTurn,
    canAct: !!canAct,
    onTimeout: handleIdleTimeout,
  });

  const handleStopAutoplay = useCallback(() => {
    setIdleTimerTriggered(false);
    setAllEnabled(false);
    idleTimer.reset();
  }, [idleTimer, setAllEnabled]);

  return {
    autoplayState,
    idleTimer,
    idleTimerTriggered,
    handleStopAutoplay,
    setAllEnabled,
    idleTimerEnabled,
  };
}
