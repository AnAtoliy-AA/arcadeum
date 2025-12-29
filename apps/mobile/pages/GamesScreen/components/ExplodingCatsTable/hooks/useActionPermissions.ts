import { useMemo } from 'react';
import type { ExplodingCatsSnapshot, ExplodingCatsPlayerState } from '../types';

interface ActionPermissionsInput {
  session: { status?: string } | null;
  snapshot: ExplodingCatsSnapshot | null;
  selfPlayer: ExplodingCatsPlayerState | undefined;
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
      canStart: isHost && !isSessionActive && !isSessionCompleted && !snapshot,
      isCurrentUserPlayer: Boolean(selfPlayer),
    };
  }, [session?.status, snapshot, selfPlayer, isMyTurn, isHost, pendingDraws]);
}
