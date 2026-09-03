import {
  FINISH_PROGRESS,
  MAIN_PATH_STEPS,
  SEAT_START_OFFSETS,
  STAR_CELLS,
  TOKENS_BY_MODE,
  TRACK_LENGTH,
  YARD_PROGRESS,
  type Mode,
} from './pachisi.constants';
import type { LegalMove, PachisiState, PachisiToken } from './pachisi.types';

/**
 * Seat assignment by player count. Two players sit opposite each other
 * (seats 0 and 2) for a balanced race.
 */
export function assignSeats(playerIds: string[]): Record<string, number> {
  const seatPlans: Record<number, number[]> = {
    1: [0],
    2: [0, 2],
    3: [0, 1, 2],
    4: [0, 1, 2, 3],
  };
  const plan = seatPlans[playerIds.length] ?? [0, 1, 2, 3];
  const seats: Record<string, number> = {};
  playerIds.forEach((id, i) => {
    seats[id] = plan[i];
  });
  return seats;
}

/** Absolute main-track cell for a seat at a given path progress (0..50). */
export function absoluteCell(seat: number, progress: number): number {
  return (SEAT_START_OFFSETS[seat] + progress) % TRACK_LENGTH;
}

/** Star cells are safe for everyone; a start cell is safe for its owner. */
export function isProtectedFor(cell: number, seat: number): boolean {
  if (STAR_CELLS.has(cell)) return true;
  return SEAT_START_OFFSETS[seat] === cell;
}

export function tokensByPlayer(
  state: PachisiState,
  playerId: string,
): PachisiToken[] {
  return state.tokens[playerId] ?? [];
}

export function countFinished(tokens: PachisiToken[]): number {
  return tokens.filter((t) => t.progress === FINISH_PROGRESS).length;
}

/**
 * Ids of opponent tokens sitting on `cell` that a landing token would send
 * back to the yard. Empty when the cell is protected from this seat.
 */
export function capturableTokensOnCell(
  state: PachisiState,
  moverSeat: number,
  cell: number,
): Array<{ ownerId: string; tokenId: number }> {
  if (isProtectedFor(cell, moverSeat)) return [];
  const captured: Array<{ ownerId: string; tokenId: number }> = [];
  for (const ownerId of state.playerOrder) {
    const ownerSeat = state.seats[ownerId];
    if (ownerSeat === undefined || ownerSeat === moverSeat) continue;
    for (const token of tokensByPlayer(state, ownerId)) {
      const p = token.progress;
      if (
        p >= 0 &&
        p < MAIN_PATH_STEPS &&
        absoluteCell(ownerSeat, p) === cell
      ) {
        captured.push({ ownerId, tokenId: token.id });
      }
    }
  }
  return captured;
}

/** All legal moves for the current die roll. Phase is enforced by validators. */
export function getAllLegalMoves(
  state: PachisiState,
  playerId: string,
): LegalMove[] {
  if (state.die === null) return [];
  const die = state.die;
  const seat = state.seats[playerId];
  if (seat === undefined) return [];

  const legal: LegalMove[] = [];
  for (const token of tokensByPlayer(state, playerId)) {
    if (token.progress === FINISH_PROGRESS) continue;
    // Leaving the yard requires rolling a 6.
    if (token.progress === YARD_PROGRESS) {
      if (die === 6) legal.push({ tokenId: token.id });
      continue;
    }
    // Exact roll required to finish; overshooting is illegal.
    if (token.progress + die <= FINISH_PROGRESS) {
      legal.push({ tokenId: token.id });
    }
  }
  return legal;
}

export interface MoveOutcome {
  targetProgress: number;
  targetCell: number | null;
  captured: Array<{ ownerId: string; tokenId: number }>;
}

/**
 * Pure computation of what happens when `playerId` moves `tokenId` by the
 * current die. Does not mutate state.
 */
export function computeMoveOutcome(
  state: PachisiState,
  playerId: string,
  tokenId: number,
): MoveOutcome | null {
  const die = state.die;
  const seat = state.seats[playerId];
  if (die === null || seat === undefined) return null;
  const token = tokensByPlayer(state, playerId).find((t) => t.id === tokenId);
  if (!token) return null;

  const from = token.progress;
  let targetProgress: number;
  if (from === YARD_PROGRESS) {
    if (die !== 6) return null;
    targetProgress = 0;
  } else {
    targetProgress = from + die;
    if (targetProgress > FINISH_PROGRESS) return null;
  }

  const targetCell =
    targetProgress < MAIN_PATH_STEPS
      ? absoluteCell(seat, targetProgress)
      : null;

  const captured =
    targetCell !== null ? capturableTokensOnCell(state, seat, targetCell) : [];

  return { targetProgress, targetCell, captured };
}

export function tokensPerVariant(mode: Mode): number {
  return TOKENS_BY_MODE[mode] ?? 4;
}
