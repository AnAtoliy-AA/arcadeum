import { GAME_PHASE } from './checkers.constants';
import type { CheckersState, MovePayload } from './checkers.types';
import {
  applyMove,
  findCaptures,
  findAllCapturesForPlayer,
  getAvailableMovesForPlayer,
  getPlayerColor,
  inBounds,
  isPlayerPiece,
} from './checkers.utils';

export function validateMovePiece(
  state: CheckersState,
  payload: MovePayload,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }

  if (!state.playerOrder[state.currentTurnIndex]) {
    return { ok: false, error: 'No current turn' };
  }

  if (state.playerOrder[state.currentTurnIndex] !== userId) {
    return { ok: false, error: 'Not your turn' };
  }

  const playerColor = getPlayerColor(state, userId);
  if (!playerColor) {
    return { ok: false, error: 'Player color not found' };
  }

  if (
    !payload?.steps ||
    !Array.isArray(payload.steps) ||
    payload.steps.length === 0
  ) {
    return { ok: false, error: 'No steps provided' };
  }

  const steps = payload.steps;

  // Validate multi-jump chain connectivity
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1];
    const curr = steps[i];
    if (prev.toRow !== curr.fromRow || prev.toCol !== curr.fromCol) {
      return { ok: false, error: 'Steps are not connected' };
    }
  }

  // Check if this chain is all captures (multi-jump must be all captures)
  const isCaptureChain = steps.every(
    (s) => s.capturedRow !== undefined && s.capturedCol !== undefined,
  );

  // Forced captures: if captures are available, must capture
  if (state.options.forcedCaptures) {
    const availableCaptures = findAllCapturesForPlayer(
      state.board,
      userId,
      playerColor,
    );

    if (availableCaptures.length > 0 && !isCaptureChain) {
      return { ok: false, error: 'Capture is forced' };
    }
  }

  // Validate first step
  const firstStep = steps[0];
  if (
    !inBounds(firstStep.fromRow, firstStep.fromCol) ||
    !inBounds(firstStep.toRow, firstStep.toCol)
  ) {
    return { ok: false, error: 'Move out of bounds' };
  }

  const piece = state.board[firstStep.fromRow][firstStep.fromCol];
  if (!piece) {
    return { ok: false, error: 'No piece at source' };
  }

  if (!isPlayerPiece(piece, userId)) {
    return { ok: false, error: 'That is not your piece' };
  }

  // Simulate the move and check each step
  let currentBoard = state.board;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const availableMoves = getAvailableMovesForPlayer(
      currentBoard,
      userId,
      playerColor,
    );

    const validStep = availableMoves.find(
      (m) =>
        m.fromRow === step.fromRow &&
        m.fromCol === step.fromCol &&
        m.toRow === step.toRow &&
        m.toCol === step.toCol &&
        (isCaptureChain
          ? m.capturedRow === step.capturedRow &&
            m.capturedCol === step.capturedCol
          : true),
    );

    if (!validStep) {
      return { ok: false, error: `Invalid step ${i + 1}` };
    }

    currentBoard = applyMove(currentBoard, [validStep]);
  }

  // If multi-jump, verify the chain ends correctly (can't continue jumping)
  if (isCaptureChain && steps.length > 1) {
    const lastStep = steps[steps.length - 1];
    const lastPiece = currentBoard[lastStep.toRow][lastStep.toCol];
    if (lastPiece) {
      const furtherCaptures = findCaptures(
        currentBoard,
        lastStep.toRow,
        lastStep.toCol,
        userId,
        playerColor,
      );
      if (furtherCaptures.length > 0) {
        return {
          ok: false,
          error: 'Multi-jump not complete — more captures available',
        };
      }
    }
  }

  return { ok: true };
}

export function validateForfeit(
  state: CheckersState,
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
