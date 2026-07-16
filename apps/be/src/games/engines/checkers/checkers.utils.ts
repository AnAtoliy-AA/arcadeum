import { BOARD_SIZE } from './checkers.constants';
import type { Board, CheckersState, MoveStep, Piece, PieceType } from './checkers.types';

export function createInitialBoard(
  darkPlayerId?: string,
  lightPlayerId?: string,
): Board {
  const darkId = darkPlayerId ?? 'dark';
  const lightId = lightPlayerId ?? 'light';
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );

  // Dark pieces (rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { playerId: darkId, type: 'man' };
      }
    }
  }

  // Light pieces (rows 5-7)
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { playerId: lightId, type: 'man' };
      }
    }
  }

  return board;
}

export function isPlayerPiece(piece: Piece | null, playerId: string): boolean {
  return piece !== null && piece.playerId === playerId;
}

export function getOpponentId(state: CheckersState, playerId: string): string | null {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return null;
  const color = player.color;
  const opponent = state.players.find((p) => p.color !== color);
  return opponent?.playerId ?? null;
}

export function getPlayerColor(state: CheckersState, playerId: string): string | null {
  return state.players.find((p) => p.playerId === playerId)?.color ?? null;
}

export function getMoveDirections(playerColor: string): Array<[number, number]> {
  // Light moves up (row decreases), dark moves down (row increases)
  if (playerColor === 'light') {
    return [[-1, -1], [-1, 1]];
  }
  return [[1, -1], [1, 1]];
}

export function getKingDirections(): Array<[number, number]> {
  return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
}

export function getDirectionsForPiece(piece: Piece, playerColor: string): Array<[number, number]> {
  return piece.type === 'king' ? getKingDirections() : getMoveDirections(playerColor);
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function countPieces(board: Board, playerId: string): number {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]?.playerId === playerId) count++;
    }
  }
  return count;
}

export function findSimpleMoves(
  board: Board,
  row: number,
  col: number,
  playerId: string,
  playerColor: string,
): MoveStep[] {
  const piece = board[row][col];
  if (!piece || piece.playerId !== playerId) return [];

  const directions = getDirectionsForPiece(piece, playerColor);
  const moves: MoveStep[] = [];

  for (const [dr, dc] of directions) {
    const toRow = row + dr;
    const toCol = col + dc;
    if (!inBounds(toRow, toCol)) continue;
    if (board[toRow][toCol] !== null) continue;
    moves.push({ fromRow: row, fromCol: col, toRow, toCol });
  }

  return moves;
}

export function findCaptures(
  board: Board,
  row: number,
  col: number,
  playerId: string,
  playerColor: string,
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

export function findAllCapturesForPlayer(
  board: Board,
  playerId: string,
  playerColor: string,
): MoveStep[] {
  const captures: MoveStep[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]?.playerId === playerId) {
        captures.push(...findCaptures(board, r, c, playerId, playerColor));
      }
    }
  }
  return captures;
}

export function findAllSimpleMovesForPlayer(
  board: Board,
  playerId: string,
  playerColor: string,
): MoveStep[] {
  const moves: MoveStep[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]?.playerId === playerId) {
        moves.push(...findSimpleMoves(board, r, c, playerId, playerColor));
      }
    }
  }
  return moves;
}

export function getAvailableMovesForPlayer(
  board: Board,
  playerId: string,
  playerColor: string,
): MoveStep[] {
  const captures = findAllCapturesForPlayer(board, playerId, playerColor);
  if (captures.length > 0) return captures;
  return findAllSimpleMovesForPlayer(board, playerId, playerColor);
}

export function applyMove(board: Board, steps: MoveStep[]): Board {
  const newBoard = cloneBoard(board);

  if (steps.length === 0) return newBoard;

  const firstStep = steps[0];
  const piece = newBoard[firstStep.fromRow][firstStep.fromCol];
  if (!piece) return newBoard;

  // Remove all captured pieces
  for (const step of steps) {
    if (step.capturedRow !== undefined && step.capturedCol !== undefined) {
      newBoard[step.capturedRow][step.capturedCol] = null;
    }
  }

  // Move the piece to final position
  const lastStep = steps[steps.length - 1];
  const movingPiece = { ...piece };

  // Promote to king if reaching the back row
  const promotionRow = piece.playerId === 'light' ? 0 : BOARD_SIZE - 1;
  if (movingPiece.type === 'man' && lastStep.toRow === promotionRow) {
    movingPiece.type = 'king';
  }

  newBoard[firstStep.fromRow][firstStep.fromCol] = null;
  newBoard[lastStep.toRow][lastStep.toCol] = movingPiece;

  return newBoard;
}

export function hasAnyMoves(board: Board, playerId: string, playerColor: string): boolean {
  return getAvailableMovesForPlayer(board, playerId, playerColor).length > 0;
}

export function getWinner(board: Board, currentPlayerId: string, currentColor: string): string | null {
  const opponentId = currentPlayerId === 'light' ? 'dark' : 'light';
  const opponentColor = currentPlayerId === 'light' ? 'dark' : 'light';

  const currentPieces = countPieces(board, currentPlayerId);
  const opponentPieces = countPieces(board, opponentId);

  if (currentPieces === 0) return opponentId;
  if (opponentPieces === 0) return currentPlayerId;

  if (!hasAnyMoves(board, opponentId, opponentColor)) return currentPlayerId;
  if (!hasAnyMoves(board, currentPlayerId, currentColor)) return opponentId;

  return null;
}
