import { useMemo } from 'react';
import type { CriticalSnapshot, CriticalPlayerState } from '../types';

interface ActionPermissionsInput {
  session: { status?: string } | null;
  snapshot: CriticalSnapshot | null;
  selfPlayer: CriticalPlayerState | undefined;
  isMyTurn: boolean;
  isHost: boolean;
  pendingDraws: number;
}

interface ActionPermissions {
  isSessionActive: boolean;
  isSessionCompleted: boolean;
  hasPendingFavor: boolean;
  canDraw: boolean;
  canPlaySkip: boolean;
  canPlayAttack: boolean;
  canPlaySeeTheFuture: boolean;
  canPlayShuffle: boolean;
  canPlayNope: boolean;
  canStart: boolean;
  isCurrentUserPlayer: boolean;
}

export function useActionPermissions({
  session,
  snapshot,
  selfPlayer,
  isMyTurn,
  isHost,
  pendingDraws,
}: ActionPermissionsInput): ActionPermissions {
  return useMemo(() => {
    const isSessionActive = session?.status === 'active';
    const isSessionCompleted = session?.status === 'completed';
    const hasPendingFavor = !!snapshot?.pendingFavor;
    const isAlive = selfPlayer?.alive ?? false;
    const hasSkip = (selfPlayer?.hand ?? []).includes('skip');
    const hasAttack = (selfPlayer?.hand ?? []).includes('attack');
    const hasNope = (selfPlayer?.hand ?? []).includes('nope');
    const hasSeeTheFuture = (selfPlayer?.hand ?? []).includes('see_the_future');
    const hasShuffle = (selfPlayer?.hand ?? []).includes('shuffle');

    return {
      isSessionActive,
      isSessionCompleted,
      hasPendingFavor,
      canDraw:
        isSessionActive &&
        isMyTurn &&
        isAlive &&
        pendingDraws > 0 &&
        !hasPendingFavor,
      canPlaySkip:
        isSessionActive && isMyTurn && hasSkip && isAlive && !hasPendingFavor,
      canPlayAttack:
        isSessionActive && isMyTurn && hasAttack && isAlive && !hasPendingFavor,
      canPlaySeeTheFuture:
        isSessionActive &&
        isMyTurn &&
        hasSeeTheFuture &&
        isAlive &&
        !hasPendingFavor,
      canPlayShuffle:
        isSessionActive &&
        isMyTurn &&
        hasShuffle &&
        isAlive &&
        !hasPendingFavor,
      canPlayNope: isSessionActive && hasNope && isAlive,
      canStart: isHost && !isSessionActive && !isSessionCompleted && !snapshot,
      isCurrentUserPlayer: Boolean(selfPlayer),
    };
  }, [session?.status, snapshot, selfPlayer, isMyTurn, isHost, pendingDraws]);
}
