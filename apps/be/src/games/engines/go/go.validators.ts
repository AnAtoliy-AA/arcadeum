import { ACTION, GAME_PHASE } from './go.constants';
import type { GoState, PlaceStonePayload } from './go.types';
import { checkMoveLegality, isOnBoard } from './go.utils';

type ValidationResult = { ok: true } | { ok: false; error: string };

export function validatePlaceStone(
  state: GoState,
  payload: unknown,
  userId: string,
): ValidationResult {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not active.' };
  }
  const currentId = state.playerOrder[state.currentTurnIndex];
  if (currentId !== userId) {
    return { ok: false, error: 'Not your turn.' };
  }
  const move = payload as Partial<PlaceStonePayload> | undefined;
  if (
    !move ||
    typeof move.row !== 'number' ||
    typeof move.col !== 'number' ||
    !Number.isInteger(move.row) ||
    !Number.isInteger(move.col)
  ) {
    return { ok: false, error: 'row and col are required.' };
  }
  if (!isOnBoard(state.board, move.row, move.col)) {
    return { ok: false, error: 'Position is outside the board.' };
  }
  const color = state.players.find((p) => p.playerId === userId)?.color;
  if (!color) return { ok: false, error: 'Player not found.' };

  const legality = checkMoveLegality(
    state.board,
    color,
    move.row,
    move.col,
    state.koPoint,
  );
  if (!legality.ok) {
    const messages: Record<string, string> = {
      occupied: 'That intersection is already occupied.',
      ko: 'Ko rule — that recapture must wait one turn.',
      suicide: 'Suicide moves are not allowed.',
    };
    return {
      ok: false,
      error: messages[legality.reason ?? 'occupied'],
    };
  }
  return { ok: true };
}

export function validatePassTurn(
  state: GoState,
  userId: string,
): ValidationResult {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not active.' };
  }
  const currentId = state.playerOrder[state.currentTurnIndex];
  if (currentId !== userId) {
    return { ok: false, error: 'Not your turn.' };
  }
  return { ok: true };
}

export function validateForfeit(
  state: GoState,
  userId: string,
): ValidationResult {
  if (state.phase !== GAME_PHASE.GAME_OVER) {
    const player = state.players.find((p) => p.playerId === userId);
    if (player?.alive) return { ok: true };
  }
  return { ok: false, error: 'You cannot forfeit right now.' };
}

/** Engine-level action whitelist used by validateAction dispatch. */
export function isKnownAction(action: string): boolean {
  return (
    action === ACTION.PLACE_STONE ||
    action === ACTION.PASS_TURN ||
    action === ACTION.FORFEIT
  );
}
