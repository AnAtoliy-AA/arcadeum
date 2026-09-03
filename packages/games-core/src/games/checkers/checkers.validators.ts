import { GAME_PHASE, MODE_CONFIGS } from './checkers.constants';
import type {
  Board,
  CheckersState,
  MovePayload,
  MoveStep,
  Piece,
} from './checkers.types';
import {
  findCaptures,
  findAllCapturesForPlayer,
  getAvailableMovesForPlayer,
  getPlayerColor,
  inBounds,
  isPlayerPiece,
} from './checkers.utils';

function applyStepWithPromotion(
  board: Board,
  step: MoveStep,
  playerColor: string,
  size: number,
): { board: Board; promoted: boolean } {
  const newBoard = board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null)),
  );
  const piece = newBoard[step.fromRow][step.fromCol];
  if (!piece) return { board: newBoard, promoted: false };

  newBoard[step.fromRow][step.fromCol] = null;

  if (step.capturedRow !== undefined && step.capturedCol !== undefined) {
    newBoard[step.capturedRow][step.capturedCol] = null;
  }

  const promotionRow = playerColor === 'light' ? 0 : size - 1;
  let promoted = false;
  let finalPiece: Piece = piece;
  if (piece.type === 'man' && step.toRow === promotionRow) {
    finalPiece = { ...piece, type: 'king' };
    promoted = true;
  }

  newBoard[step.toRow][step.toCol] = finalPiece;
  return { board: newBoard, promoted };
}

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
  const size = state.board.length;
  const ruleConfig = MODE_CONFIGS[state.options.mode];
  const backwardCaptures =
    state.options.backwardCaptures || ruleConfig.backwardCapturesForMen;
  const flyingKings = ruleConfig.flyingKings;

  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1];
    const curr = steps[i];
    if (prev.toRow !== curr.fromRow || prev.toCol !== curr.fromCol) {
      return { ok: false, error: 'Steps are not connected' };
    }
  }

  const isCaptureChain = steps.every(
    (s) => s.capturedRow !== undefined && s.capturedCol !== undefined,
  );

  if (state.options.forcedCaptures) {
    const availableCaptures = findAllCapturesForPlayer(
      state.board,
      userId,
      playerColor,
      backwardCaptures,
      flyingKings,
    );

    if (availableCaptures.length > 0 && !isCaptureChain) {
      return { ok: false, error: 'Capture is forced' };
    }
  }

  const firstStep = steps[0];
  if (
    !inBounds(firstStep.fromRow, firstStep.fromCol, size) ||
    !inBounds(firstStep.toRow, firstStep.toCol, size)
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

  let currentBoard = state.board;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const availableMoves = getAvailableMovesForPlayer(
      currentBoard,
      userId,
      playerColor,
      backwardCaptures,
      flyingKings,
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

    const result = applyStepWithPromotion(
      currentBoard,
      validStep,
      playerColor,
      size,
    );
    currentBoard = result.board;
  }

  if (isCaptureChain) {
    const lastStep = steps[steps.length - 1];
    const lastPiece = currentBoard[lastStep.toRow][lastStep.toCol];
    if (lastPiece) {
      const furtherCaptures = findCaptures(
        currentBoard,
        lastStep.toRow,
        lastStep.toCol,
        userId,
        playerColor,
        backwardCaptures,
        flyingKings,
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
