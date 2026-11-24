import { FINISH_PROGRESS } from '../types';
import type { PachisiClientState } from '../types';

export type TeamIndex = 0 | 1;

/** Accent per team, independent of the four seat colors. */
export const TEAM_ACCENTS: Record<TeamIndex, { solid: string; soft: string }> =
  {
    0: { solid: '#f97316', soft: 'rgba(249, 115, 22, 0.18)' },
    1: { solid: '#14b8a6', soft: 'rgba(20, 184, 166, 0.18)' },
  };

/** Opposite seats are partners: seats 0/2 are team 0, seats 1/3 team 1. */
export function teamOfSeat(seat: number): TeamIndex {
  return (seat % 2) as TeamIndex;
}

export function isTeamMode(snapshot: PachisiClientState | null): boolean {
  return snapshot?.teamMode === true;
}

export function teamOfPlayer(
  snapshot: PachisiClientState,
  playerId: string,
): TeamIndex | null {
  const seat = snapshot.seats[playerId];
  if (!isTeamMode(snapshot) || seat === undefined) return null;
  return teamOfSeat(seat);
}

export function partnerOf(
  snapshot: PachisiClientState,
  playerId: string | null,
): string | null {
  if (!playerId || !isTeamMode(snapshot)) return null;
  const seat = snapshot.seats[playerId];
  if (seat === undefined) return null;
  const partnerSeat = (seat + 2) % 4;
  return (
    snapshot.playerOrder.find((id) => snapshot.seats[id] === partnerSeat) ??
    null
  );
}

export function hasFinishedAll(
  snapshot: PachisiClientState,
  playerId: string,
): boolean {
  const tokens = snapshot.tokens[playerId] ?? [];
  return (
    tokens.length > 0 && tokens.every((t) => t.progress === FINISH_PROGRESS)
  );
}

/**
 * Whose tokens the viewer may move: their own, or the partner's once every
 * own token is home (mirrors the engine's controllableOwners).
 */
export function controlledOwnerId(
  snapshot: PachisiClientState,
  userId: string | null,
): string | null {
  if (!userId) return null;
  const partner = partnerOf(snapshot, userId);
  if (partner && hasFinishedAll(snapshot, userId)) return partner;
  return userId;
}
