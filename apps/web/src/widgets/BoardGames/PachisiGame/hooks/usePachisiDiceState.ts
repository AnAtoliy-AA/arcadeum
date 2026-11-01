'use client';

import { useMemo, useState } from 'react';
import type { PachisiClientState } from '../types';

export function extractLastRoll(snapshot: PachisiClientState): {
  die: number;
  rollerId: string | null;
} | null {
  if (snapshot.die != null) {
    return {
      die: snapshot.die,
      rollerId: snapshot.playerOrder[snapshot.currentTurnIndex] ?? null,
    };
  }
  if (snapshot.consecutiveSixes > 0) {
    return {
      die: 6,
      rollerId: snapshot.playerOrder[snapshot.currentTurnIndex] ?? null,
    };
  }
  if (snapshot.lastDie != null) {
    return {
      die: snapshot.lastDie,
      rollerId: snapshot.lastRollerId ?? null,
    };
  }
  if (snapshot.logs && snapshot.logs.length > 0) {
    for (let i = snapshot.logs.length - 1; i >= 0; i--) {
      const entry = snapshot.logs[i];
      const match = entry.message.match(/rolled\s+(?:a\s+)?(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val >= 1 && val <= 6) {
          return { die: val, rollerId: entry.senderId ?? null };
        }
      }
    }
  }
  return null;
}

export function hasRecentNoMoves(snapshot: PachisiClientState): boolean {
  if (snapshot.phase === 'move') return false;
  if (!snapshot.logs || snapshot.logs.length === 0) return false;
  const lastEntry = snapshot.logs[snapshot.logs.length - 1];
  return Boolean(lastEntry?.message.toLowerCase().includes('no legal moves'));
}

export function usePachisiDiceState(
  snapshot: PachisiClientState,
  currentUserId: string | null,
  myTurn: boolean,
  actionBusy: boolean,
) {
  const extracted = useMemo(() => extractLastRoll(snapshot), [snapshot]);
  const isLastRollNoMoves = useMemo(
    () => hasRecentNoMoves(snapshot),
    [snapshot],
  );

  const canRoll = myTurn && snapshot.phase === 'roll';
  const canMove = myTurn && snapshot.phase === 'move';
  const isGameOver = snapshot.phase === 'game_over';
  const isRolling =
    actionBusy && snapshot.phase === 'roll' && snapshot.die == null;
  const isExtraRoll = canRoll && snapshot.consecutiveSixes > 0;

  const [lastDie, setLastDie] = useState<number | null>(
    isExtraRoll
      ? 6
      : (snapshot.die ?? snapshot.lastDie ?? extracted?.die ?? null),
  );
  if (isExtraRoll && lastDie !== 6) {
    setLastDie(6);
  } else if (
    (snapshot.die != null && snapshot.die !== lastDie) ||
    (extracted?.die != null && extracted.die !== lastDie)
  ) {
    setLastDie(snapshot.die ?? extracted?.die ?? null);
  }

  const isMyRoll =
    isExtraRoll ||
    (myTurn && snapshot.die != null) ||
    (extracted?.rollerId != null && extracted.rollerId === currentUserId);

  const [myLastDie, setMyLastDie] = useState<number | null>(
    isExtraRoll
      ? 6
      : isMyRoll && (snapshot.die ?? extracted?.die) != null
        ? (snapshot.die ?? extracted?.die ?? null)
        : null,
  );
  if (isExtraRoll && myLastDie !== 6) {
    setMyLastDie(6);
  } else if (
    isMyRoll &&
    (snapshot.die ?? extracted?.die) != null &&
    (snapshot.die ?? extracted?.die) !== myLastDie
  ) {
    setMyLastDie(snapshot.die ?? extracted?.die ?? null);
  }

  const effectiveLastDie = isExtraRoll
    ? 6
    : (myLastDie ?? lastDie ?? extracted?.die ?? null);

  return {
    extracted,
    isLastRollNoMoves,
    canRoll,
    canMove,
    isGameOver,
    isRolling,
    isExtraRoll,
    lastDie,
    myLastDie,
    effectiveLastDie,
  };
}
