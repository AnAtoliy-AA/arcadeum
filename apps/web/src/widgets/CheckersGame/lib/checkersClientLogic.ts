import type { Board, MoveStep, Piece, RuleVariant } from '../types';
import { RULE_VARIANT_CONFIGS } from '../types';

type PlayerColor = 'light' | 'dark';

function inBounds(row: number, col: number, size: number): boolean {
  return row >= 0 && row < size && col >= 0 && col < size;
}

function getDirectionsForPiece(
  piece: Piece,
  playerColor: PlayerColor,
  backwardCaptures = false,
): Array<[number, number]> {
  if (piece.type === 'king' || backwardCaptures) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  }
  if (playerColor === 'light') {
    return [
      [-1, -1],
      [-1, 1],
    ];
  }
  return [
    [1, -1],
    [1, 1],
  ];
}

export function findCapturesFrom(
  board: Board,
  row: number,
  col: number,
  playerId: string,
  playerColor: PlayerColor,
  backwardCaptures = false,
  flyingKings = false,
): MoveStep[] {
  const piece = board[row][col];
  if (!piece || piece.playerId !== playerId) return [];

  const directions = getDirectionsForPiece(
    piece,
    playerColor,
    backwardCaptures,
  );
  const captures: MoveStep[] = [];
  const size = board.length;
  const isFlying = flyingKings && piece.type === 'king';

  for (const [dr, dc] of directions) {
    if (isFlying) {
      let r = row + dr;
      let c = col + dc;
      let jumpedPiece = false;
      let jumpedRow = -1;
      let jumpedCol = -1;

      while (inBounds(r, c, size)) {
        const cell = board[r][c];
        if (cell === null) {
          if (jumpedPiece) {
            captures.push({
              fromRow: row,
              fromCol: col,
              toRow: r,
              toCol: c,
              capturedRow: jumpedRow,
              capturedCol: jumpedCol,
            });
          }
        } else if (cell.playerId !== playerId) {
          if (jumpedPiece) break;
          jumpedPiece = true;
          jumpedRow = r;
          jumpedCol = c;
        } else {
          break;
        }
        r += dr;
        c += dc;
      }
    } else {
      const midRow = row + dr;
      const midCol = col + dc;
      const toRow = row + 2 * dr;
      const toCol = col + 2 * dc;

      if (!inBounds(toRow, toCol, size)) continue;
      if (board[midRow][midCol] === null) continue;
      if (board[midRow][midCol]?.playerId === playerId) continue;
      if (board[toRow][toCol] !== null) continue;

      captures.push({
        fromRow: row,
        fromCol: col,
        toRow,
        toCol,
        capturedRow: midRow,
        capturedCol: midCol,
      });
    }
  }

  return captures;
}

export function findSimpleMovesFrom(
  board: Board,
  row: number,
  col: number,
  playerId: string,
  playerColor: PlayerColor,
  backwardCaptures = false,
  flyingKings = false,
): MoveStep[] {
  const piece = board[row][col];
  if (!piece || piece.playerId !== playerId) return [];

  const directions = getDirectionsForPiece(
    piece,
    playerColor,
    backwardCaptures,
  );
  const moves: MoveStep[] = [];
  const size = board.length;
  const isFlying = flyingKings && piece.type === 'king';

  for (const [dr, dc] of directions) {
    if (isFlying) {
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c, size) && board[r][c] === null) {
        moves.push({ fromRow: row, fromCol: col, toRow: r, toCol: c });
        r += dr;
        c += dc;
      }
    } else {
      const toRow = row + dr;
      const toCol = col + dc;
      if (!inBounds(toRow, toCol, size)) continue;
      if (board[toRow][toCol] !== null) continue;
      moves.push({ fromRow: row, fromCol: col, toRow, toCol });
    }
  }

  return moves;
}

export function hasCapturesForPlayer(
  board: Board,
  playerId: string,
  playerColor: PlayerColor,
  backwardCaptures = false,
  flyingKings = false,
): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]?.playerId === playerId) {
        const captures = findCapturesFrom(
          board,
          r,
          c,
          playerId,
          playerColor,
          backwardCaptures,
          flyingKings,
        );
        if (captures.length > 0) return true;
      }
    }
  }
  return false;
}

export function applyMoveToBoard(board: Board, steps: MoveStep[]): Board {
  const newBoard: Board = board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null)),
  );

  if (steps.length === 0) return newBoard;

  const firstStep = steps[0];
  const piece = newBoard[firstStep.fromRow][firstStep.fromCol];
  if (!piece) return newBoard;

  for (const step of steps) {
    if (step.capturedRow !== undefined && step.capturedCol !== undefined) {
      newBoard[step.capturedRow][step.capturedCol] = null;
    }
  }

  const lastStep = steps[steps.length - 1];
  const movingPiece = { ...piece };

  if (movingPiece.type === 'man') {
    const size = newBoard.length;
    if (lastStep.toRow === 0 || lastStep.toRow === size - 1) {
      movingPiece.type = 'king';
    }
  }

  newBoard[firstStep.fromRow][firstStep.fromCol] = null;
  newBoard[lastStep.toRow][lastStep.toCol] = movingPiece;

  return newBoard;
}

export function getPlayerColor(
  players: Array<{ playerId: string; color: PlayerColor }>,
  playerId: string,
): PlayerColor | null {
  return players.find((p) => p.playerId === playerId)?.color ?? null;
}

export function getRuleVariantConfig(ruleVariant: RuleVariant) {
  return RULE_VARIANT_CONFIGS[ruleVariant];
}
