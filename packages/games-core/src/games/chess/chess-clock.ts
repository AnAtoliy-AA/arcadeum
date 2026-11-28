import type { ChessState } from './chess.types';
import type { PieceColor } from './chess.constants';

/** Grace period for the very first move before the clock starts. */
export const FIRST_MOVE_GRACE_MS = 20_000;

/**
 * Charges the mover for the time spent on this move and adds the
 * increment. Server-authoritative: only the server clock is used.
 */
export function applyMoveClock(
  state: ChessState,
  movingColor: PieceColor,
  now: number = Date.now(),
): void {
  if (!state.clocks) return;
  const opponentColor: PieceColor = movingColor === 'white' ? 'black' : 'white';
  const clock = { ...state.clocks[movingColor] };
  const opponentClock = state.clocks[opponentColor];
  const isFirstMove =
    opponentClock.lastMoveTimestamp === 0 && clock.lastMoveTimestamp === 0;
  const createdAt = state.gameCreatedAt || now;
  let elapsed = 0;
  if (isFirstMove) {
    const sinceCreation = Math.floor((now - createdAt) / 1000);
    elapsed = Math.max(0, sinceCreation - FIRST_MOVE_GRACE_MS / 1000);
  } else {
    const referenceTime =
      opponentClock.lastMoveTimestamp > 0
        ? opponentClock.lastMoveTimestamp
        : createdAt;
    elapsed = Math.max(0, Math.floor((now - referenceTime) / 1000));
  }
  clock.remainingSeconds = Math.max(0, clock.remainingSeconds - elapsed);
  clock.remainingSeconds += state.timeControl?.incrementSeconds ?? 0;
  clock.lastMoveTimestamp = now;
  state.clocks = { ...state.clocks, [movingColor]: clock };
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
