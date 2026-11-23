import {
  FINISH_PROGRESS,
  MAIN_PATH_STEPS,
  SEAT_START_OFFSETS,
  STAR_CELLS,
  TEAMS_PLAYER_COUNT,
  TOKENS_BY_MODE,
  TRACK_LENGTH,
  YARD_PROGRESS,
  type Mode,
  type TeamId,
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

/** Teams are only valid with exactly 4 players (2v2). */
export function teamsAllowed(playerCount: number): boolean {
  return playerCount === TEAMS_PLAYER_COUNT;
}

/** Team of a seat: opposite seats (0/2 and 1/3) are partners. */
export function teamOfSeat(seat: number): TeamId {
  return (seat % 2) as TeamId;
}

export function isTeamMode(state: PachisiState): boolean {
  return state.teamMode === true;
}

/** Team of a player (team mode only). */
export function teamOf(state: PachisiState, playerId: string): TeamId | null {
  const seat = state.seats[playerId];
  if (!isTeamMode(state) || seat === undefined) return null;
  return teamOfSeat(seat);
}

/** The player sitting opposite (team mode only). */
export function partnerOf(
  state: PachisiState,
  playerId: string,
): string | null {
  if (!isTeamMode(state)) return null;
  const seat = state.seats[playerId];
  if (seat === undefined) return null;
  const partnerSeat = (seat + 2) % 4;
  return (
    state.playerOrder.find((id) => state.seats[id] === partnerSeat) ?? null
  );
}

export function areTeammates(
  state: PachisiState,
  a: string,
  b: string,
): boolean {
  if (a === b) return false;
  const ta = teamOf(state, a);
  return ta !== null && ta === teamOf(state, b);
}

export function hasFinishedAll(state: PachisiState, playerId: string): boolean {
  const tokens = tokensByPlayer(state, playerId);
  return (
    tokens.length > 0 && tokens.every((t) => t.progress === FINISH_PROGRESS)
  );
}

/**
 * Whose tokens `playerId` may move: always their own; once all of their own
 * tokens are home, also their partner's (team mode).
 */
export function controllableOwners(
  state: PachisiState,
  playerId: string,
): string[] {
  const owners = [playerId];
  const partner = partnerOf(state, playerId);
  if (partner && hasFinishedAll(state, playerId)) owners.push(partner);
  return owners;
}

/** True when every token of the player's whole team is home. */
export function teamHasWon(state: PachisiState, playerId: string): boolean {
  if (!isTeamMode(state)) return false;
  const partner = partnerOf(state, playerId);
  return (
    hasFinishedAll(state, playerId) &&
    (partner === null || hasFinishedAll(state, partner))
  );
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
    // Partners never capture each other (they may share a cell).
    if (isTeamMode(state) && teamOfSeat(ownerSeat) === teamOfSeat(moverSeat))
      continue;
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

/** Legal moves for one owner's tokens under the current die. */
function legalMovesForOwner(
  state: PachisiState,
  ownerId: string,
  die: number,
  asPartner: boolean,
): LegalMove[] {
  const legal: LegalMove[] = [];
  for (const token of tokensByPlayer(state, ownerId)) {
    if (token.progress === FINISH_PROGRESS) continue;
    const move: LegalMove = asPartner
      ? { tokenId: token.id, ownerId }
      : { tokenId: token.id };
    // Leaving the yard requires rolling a 6.
    if (token.progress === YARD_PROGRESS) {
      if (die === 6) legal.push(move);
      continue;
    }
    // Exact roll required to finish; overshooting is illegal.
    if (token.progress + die <= FINISH_PROGRESS) legal.push(move);
  }
  return legal;
}

/**
 * All legal moves for the current die roll. Phase is enforced by validators.
 * In team mode a player whose own tokens are all home moves the partner's.
 */
export function getAllLegalMoves(
  state: PachisiState,
  playerId: string,
): LegalMove[] {
  if (state.die === null) return [];
  if (state.seats[playerId] === undefined) return [];
  const [self, ...partners] = controllableOwners(state, playerId);
  const legal = legalMovesForOwner(state, self, state.die, false);
  for (const partnerId of partners) {
    legal.push(...legalMovesForOwner(state, partnerId, state.die, true));
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
  ownerId: string = playerId,
): MoveOutcome | null {
  const die = state.die;
  if (!controllableOwners(state, playerId).includes(ownerId)) return null;
  const seat = state.seats[ownerId];
  if (die === null || seat === undefined) return null;
  const token = tokensByPlayer(state, ownerId).find((t) => t.id === tokenId);
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
