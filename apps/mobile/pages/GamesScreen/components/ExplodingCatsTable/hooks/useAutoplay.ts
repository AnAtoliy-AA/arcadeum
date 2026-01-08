import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  ExplodingCatsCard,
  ExplodingCatsLogEntry,
  PendingAction,
  PendingFavor,
} from '../types';

interface UseAutoplayOptions {
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  hand: ExplodingCatsCard[];
  logs: ExplodingCatsLogEntry[];
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  pendingDefuse: string | null;
  deckSize: number;
  playerOrder: string[];
  currentUserId: string | null;
  onDraw: () => void;
  onPlayActionCard: (card: 'skip' | 'attack' | 'shuffle') => void;
  onPlayNope: () => void;
  onGiveFavorCard: (card: ExplodingCatsCard) => void;
  onPlayDefuse: (position: number) => void;
}

interface UseAutoplayReturn {
  allEnabled: boolean;
  autoDrawEnabled: boolean;
  autoSkipEnabled: boolean;
  autoShuffleAfterDefuseEnabled: boolean;
  autoNopeAttackEnabled: boolean;
  autoGiveFavorEnabled: boolean;
  autoDefuseEnabled: boolean;
  setAllEnabled: (enabled: boolean) => void;
  setAutoDrawEnabled: (enabled: boolean) => void;
  setAutoSkipEnabled: (enabled: boolean) => void;
  setAutoShuffleAfterDefuseEnabled: (enabled: boolean) => void;
  setAutoNopeAttackEnabled: (enabled: boolean) => void;
  setAutoGiveFavorEnabled: (enabled: boolean) => void;
  setAutoDefuseEnabled: (enabled: boolean) => void;
}

// Card selection priority for auto-give favor (lower = give first)
const CARD_PRIORITY: Record<string, number> = {
  // Cat cards - give first (least valuable solo)
  tacocat: 1,
  hairy_potato_cat: 1,
  rainbow_ralphing_cat: 1,
  cattermelon: 1,
  bearded_cat: 1,
  // Action cards - give second
  shuffle: 2,
  skip: 2,
  attack: 2,
  favor: 2,
  see_the_future: 2,
  nope: 3, // Nope is more valuable action
  reverse: 2,
  super_skip: 2,
  targeted_attack: 2,
  personal_attack: 2,
  attack_of_the_dead: 2,
  // Defuse - give last (most valuable)
  defuse: 10,
  // Exploding cat - should never be in hand normally
  exploding_cat: 100,
};

/**
 * Select the best card to give away (least valuable)
 */
function selectCardToGive(hand: ExplodingCatsCard[]): ExplodingCatsCard | null {
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
  logs: ExplodingCatsLogEntry[],
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
    'attack',
    'targeted_attack',
    'personal_attack',
    'attack_of_the_dead',
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
  const [autoNopeAttackEnabled, setAutoNopeAttackEnabled] = useState(false);
  const [autoGiveFavorEnabled, setAutoGiveFavorEnabled] = useState(false);
  const [autoDefuseEnabled, setAutoDefuseEnabled] = useState(false);

  const hasNopedRef = useRef<string | null>(null);
  const hasGivenFavorRef = useRef<string | null>(null);
  const hasDefusedRef = useRef<boolean>(false);

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

    if (hand.includes('nope')) {
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
      hand.includes('nope')
    ) {
      return;
    }

    // Auto-shuffle after opponent defuse (shuffle doesn't end turn)
    if (autoShuffleAfterDefuseEnabled && defusePlayedRecently) {
      if (hand.includes('shuffle')) {
        onPlayActionCard('shuffle');
        // Don't return - shuffle doesn't end turn, continue to draw/skip
      }
    }

    if (autoSkipEnabled && hand.includes('skip')) {
      lastActedTurnRef.current = turnIdRef.current;
      onPlayActionCard('skip');
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
    setAutoNopeAttackEnabled(enabled);
    setAutoGiveFavorEnabled(enabled);
    setAutoDefuseEnabled(enabled);
  }, []);

  const allEnabled =
    autoDrawEnabled &&
    autoSkipEnabled &&
    autoShuffleAfterDefuseEnabled &&
    autoNopeAttackEnabled &&
    autoGiveFavorEnabled &&
    autoDefuseEnabled;

  return {
    allEnabled,
    autoDrawEnabled,
    autoSkipEnabled,
    autoShuffleAfterDefuseEnabled,
    autoNopeAttackEnabled,
    autoGiveFavorEnabled,
    autoDefuseEnabled,
    setAllEnabled: handleSetAllEnabled,
    setAutoDrawEnabled: handleSetAutoDrawEnabled,
    setAutoSkipEnabled,
    setAutoShuffleAfterDefuseEnabled,
    setAutoNopeAttackEnabled,
    setAutoGiveFavorEnabled,
    setAutoDefuseEnabled,
  };
}
