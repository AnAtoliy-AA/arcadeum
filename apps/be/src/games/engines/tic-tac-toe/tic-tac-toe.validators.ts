import { GAME_PHASE } from './tic-tac-toe.constants';
import type { PlaceMarkPayload, TicTacToeState } from './tic-tac-toe.types';

export function validatePlaceMark(
  state: TicTacToeState,
  payload: PlaceMarkPayload,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }

  const { row, col } = payload ?? { row: -1, col: -1 };
  const size = state.options.boardSize;
  if (
    !Number.isInteger(row) ||
    !Number.isInteger(col) ||
    row < 0 ||
    row >= size ||
    col < 0 ||
    col >= size
  ) {
    return { ok: false, error: 'Move out of bounds' };
  }

  if (state.board[row][col] !== null) {
    return { ok: false, error: 'Cell already taken' };
  }

  const currentEntryId = state.playerOrder[state.currentTurnIndex];
  if (state.options.teamMode) {
    const team = state.teams.find((t) => t.id === currentEntryId);
    if (!team) return { ok: false, error: 'No active team' };
    const shooterId = team.playerIds[team.currentShooterIndex];
    if (shooterId !== userId) {
      return { ok: false, error: 'Not your turn' };
    }
  } else if (currentEntryId !== userId) {
    return { ok: false, error: 'Not your turn' };
  }

  return { ok: true };
}

export function validateForfeit(
  state: TicTacToeState,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }
  const player = state.players.find((p) => p.playerId === userId);
  if (!player) return { ok: false, error: 'Player not in game' };
  if (!player.alive) return { ok: false, error: 'Player already out' };
  return { ok: true };
}
