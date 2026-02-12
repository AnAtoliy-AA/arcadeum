import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  CriticalCard,
  CriticalLogEntry,
  PendingAction,
  PendingFavor,
  CriticalActionCard,
} from '../types';

interface UseAutoplayOptions {
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  hand: CriticalCard[];
  logs: CriticalLogEntry[];
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  pendingDefuse: string | null;
  deckSize: number;
  playerOrder: string[];
  currentUserId: string | null;
  onDraw: () => void;
  onPlayActionCard: (card: CriticalActionCard) => void;
  onPlayNope: () => void;
  onGiveFavorCard: (card: CriticalCard) => void;
  onPlayDefuse: (position: number) => void;
}

interface UseAutoplayReturn {
  allEnabled: boolean;
  autoDrawEnabled: boolean;
  autoSkipEnabled: boolean;
  autoShuffleAfterDefuseEnabled: boolean;
  autoDrawSkipAfterShuffleEnabled: boolean;
  autoNopeAttackEnabled: boolean;
  autoGiveFavorEnabled: boolean;
  autoDefuseEnabled: boolean;
  setAllEnabled: (enabled: boolean) => void;
  setAutoDrawEnabled: (enabled: boolean) => void;
  setAutoSkipEnabled: (enabled: boolean) => void;
  setAutoShuffleAfterDefuseEnabled: (enabled: boolean) => void;
  setAutoDrawSkipAfterShuffleEnabled: (enabled: boolean) => void;
  setAutoNopeAttackEnabled: (enabled: boolean) => void;
  setAutoGiveFavorEnabled: (enabled: boolean) => void;
  setAutoDefuseEnabled: (enabled: boolean) => void;
}

// Card selection priority for auto-give favor (lower = give first)
const CARD_PRIORITY: Record<string, number> = {
  // Cat cards - give first (least valuable solo)
  collection_alpha: 1,
  collection_beta: 1,
  collection_gamma: 1,
  collection_delta: 1,
  collection_epsilon: 1,
  // Action cards - give second
  reorder: 2,
  evade: 2,
  strike: 2,
  trade: 2,
  insight: 2,
  cancel: 3, // Nope is more valuable action
  invert: 2,
  mega_evade: 2,
  targeted_strike: 2,
  private_strike: 2,
  recursive_strike: 2,
  // Defuse - give last (most valuable)
  neutralizer: 10,
  // Exploding cat - should never be in hand normally
  critical_event: 100,
};

/**
 * Select the best card to give away (least valuable)
 */
function selectCardToGive(hand: CriticalCard[]): CriticalCard | null {
  if (hand.length === 0) return null;

  // Sort by priority (lower first)
  const sorted = [...hand].sort((a, b) => {
    const priorityA = CARD_PRIORITY[a] ?? 5;
    const priorityB = CARD_PRIORITY[b] ?? 5;
    return priorityA - priorityB;
  });

  return sorted[0];
}

/**
 * Check if any opponent played Defuse recently (within last 5 log entries)
 */
function wasDefusePlayedRecently(
  logs: CriticalLogEntry[],
  currentUserId: string | null,
): boolean {
  if (!currentUserId) return false;

  const recentLogs = logs.slice(-5);
  for (const log of recentLogs) {
    if (
      log.action === 'defuse' &&
      log.senderId &&
      log.senderId !== currentUserId
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get the player who is directly before the current user in turn order
 */
function getPreviousPlayer(
  playerOrder: string[],
  currentUserId: string | null,
): string | null {
  if (!currentUserId || playerOrder.length < 2) return null;

  const myIndex = playerOrder.indexOf(currentUserId);
  if (myIndex === -1) return null;

  const prevIndex = (myIndex - 1 + playerOrder.length) % playerOrder.length;
  return playerOrder[prevIndex];
}

/**
 * Check if the pending action is an attack targeting the current user
 */
function isAttackPending(
  pendingAction: PendingAction | null,
  playerOrder: string[],
  currentUserId: string | null,
): boolean {
  if (!pendingAction || !currentUserId) return false;

  const attackTypes = [
    'strike',
    'targeted_strike',
    'private_strike',
    'recursive_strike',
  ];

  if (!attackTypes.includes(pendingAction.type)) return false;

  const previousPlayer = getPreviousPlayer(playerOrder, currentUserId);
  return pendingAction.playerId === previousPlayer;
}

/**
 * Hook for managing autoplay functionality
 */
export function useAutoplay({
  isMyTurn,
  canAct,
  canPlayNope,
  hand,
  logs,
  pendingAction,
  pendingFavor,
  pendingDefuse,
  deckSize,
  playerOrder,
  currentUserId,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onGiveFavorCard,
  onPlayDefuse,
}: UseAutoplayOptions): UseAutoplayReturn {
  const [autoDrawEnabled, setAutoDrawEnabled] = useState(false);
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(false);
  const [autoShuffleAfterDefuseEnabled, setAutoShuffleAfterDefuseEnabled] =
    useState(false);
  const [autoDrawSkipAfterShuffleEnabled, setAutoDrawSkipAfterShuffleEnabled] =
    useState(false);
  const [autoNopeAttackEnabled, setAutoNopeAttackEnabled] = useState(false);
  const [autoGiveFavorEnabled, setAutoGiveFavorEnabled] = useState(false);
  const [autoDefuseEnabled, setAutoDefuseEnabled] = useState(false);

  const hasNopedRef = useRef<string | null>(null);
  const hasGivenFavorRef = useRef<string | null>(null);
  const hasDefusedRef = useRef<boolean>(false);
  const hasShuffledThisTurnRef = useRef<boolean>(false);

  const defusePlayedRecently = useMemo(
    () => wasDefusePlayedRecently(logs, currentUserId),
    [logs, currentUserId],
  );

  const attackFromPrevPlayer = useMemo(
    () => isAttackPending(pendingAction, playerOrder, currentUserId),
    [pendingAction, playerOrder, currentUserId],
  );

  // Check if I'm the target of a favor request
  const isFavorTarget = useMemo(
    () => pendingFavor?.targetId === currentUserId,
    [pendingFavor, currentUserId],
  );

  // Track which turn we last acted on to prevent double-firing
  const lastActedTurnRef = useRef<string | null>(null);
  const turnIdRef = useRef<string | null>(null);

  // Update turn ID only when a new turn starts
  useEffect(() => {
    if (isMyTurn && canAct && !turnIdRef.current) {
      turnIdRef.current = `turn-${Date.now()}`;
    } else if (!isMyTurn) {
      turnIdRef.current = null;
      lastActedTurnRef.current = null;
      hasShuffledThisTurnRef.current = false;
    }
  }, [isMyTurn, canAct]);

  // Auto-give favor card
  useEffect(() => {
    if (!autoGiveFavorEnabled || !isFavorTarget || !pendingFavor) {
      return;
    }

    const favorId = `${pendingFavor.requesterId}-${pendingFavor.targetId}`;
    if (hasGivenFavorRef.current === favorId) {
      return;
    }

    const cardToGive = selectCardToGive(hand);
    if (cardToGive) {
      hasGivenFavorRef.current = favorId;
      onGiveFavorCard(cardToGive);
    }
  }, [
    autoGiveFavorEnabled,
    isFavorTarget,
    pendingFavor,
    hand,
    onGiveFavorCard,
  ]);

  // Auto-defuse with random position
  useEffect(() => {
    if (!autoDefuseEnabled || pendingDefuse !== currentUserId) {
      return;
    }

    if (hasDefusedRef.current) {
      return;
    }

    hasDefusedRef.current = true;
    const randomPosition = Math.floor(Math.random() * (deckSize + 1));
    onPlayDefuse(randomPosition);
  }, [autoDefuseEnabled, pendingDefuse, currentUserId, deckSize, onPlayDefuse]);

  // Reset defuse flag when no longer pending
  useEffect(() => {
    if (pendingDefuse !== currentUserId) {
      hasDefusedRef.current = false;
    }
  }, [pendingDefuse, currentUserId]);

  // Auto-Nope attack from previous player
  useEffect(() => {
    if (!autoNopeAttackEnabled || !canPlayNope || !attackFromPrevPlayer) {
      return;
    }

    const actionId = pendingAction
      ? `${pendingAction.type}-${pendingAction.playerId}-${pendingAction.nopeCount}`
      : null;
    if (hasNopedRef.current === actionId) {
      return;
    }

    if (hand.includes('cancel')) {
      hasNopedRef.current = actionId;
      onPlayNope();
    }
  }, [
    autoNopeAttackEnabled,
    canPlayNope,
    attackFromPrevPlayer,
    pendingAction,
    hand,
    onPlayNope,
  ]);

  // Auto-play actions on your turn
  useEffect(() => {
    if (!isMyTurn || !canAct) {
      return;
    }

    // Check if we already acted during this turn
    if (turnIdRef.current && lastActedTurnRef.current === turnIdRef.current) {
      return;
    }

    // Don't auto-play if there's a pending attack we should nope
    if (
      autoNopeAttackEnabled &&
      attackFromPrevPlayer &&
      hand.includes('cancel')
    ) {
      return;
    }

    // Auto-shuffle after opponent defuse (shuffle doesn't end turn)
    // Only shuffle once per turn, tracked by hasShuffledThisTurnRef
    if (
      autoShuffleAfterDefuseEnabled &&
      defusePlayedRecently &&
      !hasShuffledThisTurnRef.current
    ) {
      if (hand.includes('reorder')) {
        hasShuffledThisTurnRef.current = true;
        onPlayActionCard('reorder');
        // Always return after shuffle - it's async
        // Next effect run will handle draw/skip if enabled
        return;
      }
    }

    // If autoDrawSkipAfterShuffleEnabled is disabled and we just shuffled, stop here
    if (hasShuffledThisTurnRef.current && !autoDrawSkipAfterShuffleEnabled) {
      return;
    }

    if (autoSkipEnabled && hand.includes('evade')) {
      lastActedTurnRef.current = turnIdRef.current;
      onPlayActionCard('evade');
      return;
    }

    if (autoDrawEnabled) {
      lastActedTurnRef.current = turnIdRef.current;
      onDraw();
    }
  }, [
    isMyTurn,
    canAct,
    autoDrawEnabled,
    autoSkipEnabled,
    autoShuffleAfterDefuseEnabled,
    autoDrawSkipAfterShuffleEnabled,
    autoNopeAttackEnabled,
    attackFromPrevPlayer,
    defusePlayedRecently,
    hand,
    onDraw,
    onPlayActionCard,
  ]);

  const handleSetAutoDrawEnabled = useCallback((enabled: boolean) => {
    setAutoDrawEnabled(enabled);
  }, []);

  const handleSetAllEnabled = useCallback((enabled: boolean) => {
    setAutoDrawEnabled(enabled);
    setAutoSkipEnabled(enabled);
    setAutoShuffleAfterDefuseEnabled(enabled);
    setAutoDrawSkipAfterShuffleEnabled(enabled);
    setAutoNopeAttackEnabled(enabled);
    setAutoGiveFavorEnabled(enabled);
    setAutoDefuseEnabled(enabled);
  }, []);

  const allEnabled =
    autoDrawEnabled &&
    autoSkipEnabled &&
    autoShuffleAfterDefuseEnabled &&
    autoDrawSkipAfterShuffleEnabled &&
    autoNopeAttackEnabled &&
    autoGiveFavorEnabled &&
    autoDefuseEnabled;

  return {
    allEnabled,
    autoDrawEnabled,
    autoSkipEnabled,
    autoShuffleAfterDefuseEnabled,
    autoDrawSkipAfterShuffleEnabled,
    autoNopeAttackEnabled,
    autoGiveFavorEnabled,
    autoDefuseEnabled,
    setAllEnabled: handleSetAllEnabled,
    setAutoDrawEnabled: handleSetAutoDrawEnabled,
    setAutoSkipEnabled,
    setAutoShuffleAfterDefuseEnabled,
    setAutoDrawSkipAfterShuffleEnabled,
    setAutoNopeAttackEnabled,
    setAutoGiveFavorEnabled,
    setAutoDefuseEnabled,
  };
}
