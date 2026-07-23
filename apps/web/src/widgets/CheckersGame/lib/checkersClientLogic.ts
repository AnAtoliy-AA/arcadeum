import type { Board, MoveStep, Piece } from '../types';

const BOARD_SIZE = 8;

type PlayerColor = 'light' | 'dark';

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getDirectionsForPiece(
  piece: Piece,
  playerColor: PlayerColor,
): Array<[number, number]> {
  if (piece.type === 'king') {
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
): MoveStep[] {
  const piece = board[row][col];
  if (!piece || piece.playerId !== playerId) return [];

  const directions = getDirectionsForPiece(piece, playerColor);
  const captures: MoveStep[] = [];

  for (const [dr, dc] of directions) {
    const midRow = row + dr;
    const midCol = col + dc;
    const toRow = row + 2 * dr;
    const toCol = col + 2 * dc;

    if (!inBounds(toRow, toCol)) continue;
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

  return captures;
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

  if (
    movingPiece.type === 'man' &&
    (lastStep.toRow === 0 || lastStep.toRow === BOARD_SIZE - 1)
  ) {
    movingPiece.type = 'king';
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
