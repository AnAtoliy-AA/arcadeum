import type { ChessState, PlayerClock } from './chess.types';
import type { PieceColor } from './chess.constants';

/** Grace period for the very first move before the clock starts. */
export const FIRST_MOVE_GRACE_MS = 20_000;
/** Most network lag forgiven on a single move. */
export const MAX_LAG_COMP_MS = 300;
/** Lag allowance a player starts with and can bank up to. */
export const LAG_QUOTA_MAX_MS = 1_000;
/** Allowance regained per move. */
export const LAG_QUOTA_REGEN_MS = 100;

const DAY_MS = 86_400_000;

type ClockState = Pick<
  ChessState,
  'clocks' | 'timeControl' | 'gameCreatedAt' | 'currentTurnColor'
>;

export function isDailyClock(state: Pick<ChessState, 'timeControl'>): boolean {
  return state.timeControl?.type === 'daily';
}

export function getRemainingMs(clock: PlayerClock): number {
  return typeof clock.remainingMs === 'number'
    ? clock.remainingMs
    : clock.remainingSeconds * 1000;
}

function lagQuota(clock: PlayerClock): number {
  return typeof clock.lagQuotaMs === 'number'
    ? clock.lagQuotaMs
    : LAG_QUOTA_MAX_MS;
}

/**
 * When the side to move started thinking. White's very first move gets a
 * grace period; afterwards the turn starts when the opponent moved.
 */
export function turnStartedAt(
  state: ClockState,
  now: number = Date.now(),
): number {
  const clocks = state.clocks;
  const createdAt = state.gameCreatedAt || now;
  if (!clocks) return now;
  const opponent: PieceColor =
    state.currentTurnColor === 'white' ? 'black' : 'white';
  const noMoves =
    clocks.white.lastMoveTimestamp === 0 &&
    clocks.black.lastMoveTimestamp === 0;
  if (noMoves) return createdAt + FIRST_MOVE_GRACE_MS;
  const opp = clocks[opponent].lastMoveTimestamp;
  return opp > 0 ? opp : createdAt;
}

/**
 * Milliseconds the side to move has left right now (can be negative once
 * the flag has fallen). `null` for untimed games.
 */
export function timeLeftMs(
  state: ClockState,
  now: number = Date.now(),
): number | null {
  if (!state.clocks) return null;
  const elapsed = Math.max(0, now - turnStartedAt(state, now));
  if (isDailyClock(state)) {
    return (state.timeControl?.daysPerMove ?? 1) * DAY_MS - elapsed;
  }
  return getRemainingMs(state.clocks[state.currentTurnColor]) - elapsed;
}

/**
 * True when the side to move has run out of time, after allowing for the
 * lag compensation they still have available.
 */
export function isFlagged(
  state: ClockState,
  now: number = Date.now(),
): boolean {
  const left = timeLeftMs(state, now);
  if (left === null) return false;
  if (isDailyClock(state)) return left <= 0;
  const clock = state.clocks![state.currentTurnColor];
  return left + Math.min(MAX_LAG_COMP_MS, lagQuota(clock)) <= 0;
}

/**
 * Charges the mover for the time spent on this move (millisecond precision,
 * server clock only), forgives up to MAX_LAG_COMP_MS of network lag from a
 * small per-player quota, then adds the increment.
 */
export function applyMoveClock(
  state: ChessState,
  movingColor: PieceColor,
  now: number = Date.now(),
): void {
  if (!state.clocks) return;
  const prev = state.clocks[movingColor];
  const clock: PlayerClock = { ...prev };
  const elapsed = Math.max(
    0,
    now - turnStartedAt({ ...state, currentTurnColor: movingColor }, now),
  );

  if (isDailyClock(state)) {
    // Correspondence: every move gets a fresh allowance.
    const allowanceMs = (state.timeControl?.daysPerMove ?? 1) * DAY_MS;
    clock.remainingMs = allowanceMs;
    clock.remainingSeconds = allowanceMs / 1000;
    clock.lastMoveTimestamp = now;
    state.clocks = { ...state.clocks, [movingColor]: clock };
    return;
  }

  const quota = lagQuota(prev);
  const compensation = Math.min(elapsed, MAX_LAG_COMP_MS, quota);
  const charged = elapsed - compensation;
  const incrementMs = (state.timeControl?.incrementSeconds ?? 0) * 1000;
  const remaining = Math.max(0, getRemainingMs(prev) - charged) + incrementMs;

  clock.remainingMs = remaining;
  clock.remainingSeconds = Math.ceil(remaining / 1000);
  clock.lagQuotaMs = Math.min(
    LAG_QUOTA_MAX_MS,
    quota - compensation + LAG_QUOTA_REGEN_MS,
  );
  clock.lastMoveTimestamp = now;
  state.clocks = { ...state.clocks, [movingColor]: clock };
}

/** Sets a side's clock to zero (used when its flag falls). */
export function zeroClock(state: ChessState, color: PieceColor): void {
  if (!state.clocks) return;
  state.clocks = {
    ...state.clocks,
    [color]: { ...state.clocks[color], remainingSeconds: 0, remainingMs: 0 },
  };
}

/**
 * After a takeback the side to move starts a fresh turn now, so it is not
 * charged for the time the takeback negotiation took.
 */
export function restartTurnClock(
  state: ChessState,
  now: number = Date.now(),
): void {
  if (!state.clocks) return;
  const waiting: PieceColor =
    state.currentTurnColor === 'white' ? 'black' : 'white';
  const anyMoved =
    state.clocks.white.lastMoveTimestamp > 0 ||
    state.clocks.black.lastMoveTimestamp > 0;
  if (!anyMoved) return;
  state.clocks = {
    ...state.clocks,
    [waiting]: { ...state.clocks[waiting], lastMoveTimestamp: now },
  };
}
