import { MODE_CONFIGS, type Mode } from './checkers.constants';
import type { Board, CheckersState, MoveStep, Piece } from './checkers.types';

export function createInitialBoard(
  darkPlayerId?: string,
  lightPlayerId?: string,
  mode: Mode = 'american',
): Board {
  const config = MODE_CONFIGS[mode];
  const size = config.boardSize;
  const darkId = darkPlayerId ?? 'dark';
  const lightId = lightPlayerId ?? 'light';
  const board: Board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );

  const darkRows = size === 10 ? 4 : 3;
  for (let row = 0; row < darkRows; row++) {
    for (let col = 0; col < size; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { playerId: darkId, type: 'man' };
      }
    }
  }

  const lightStart = size === 10 ? 6 : 5;
  for (let row = lightStart; row < size; row++) {
    for (let col = 0; col < size; col++) {
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

export function getOpponentId(
  state: CheckersState,
  playerId: string,
): string | null {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return null;
  const color = player.color;
  const opponent = state.players.find((p) => p.color !== color);
  return opponent?.playerId ?? null;
}

export function getPlayerColor(
  state: CheckersState,
  playerId: string,
): string | null {
  return state.players.find((p) => p.playerId === playerId)?.color ?? null;
}

export function getMoveDirections(
  playerColor: string,
): Array<[number, number]> {
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

export function getKingDirections(): Array<[number, number]> {
  return [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
}

export function getDirectionsForPiece(
  piece: Piece,
  playerColor: string,
): Array<[number, number]> {
  if (piece.type === 'king') return getKingDirections();
  return getMoveDirections(playerColor);
}

export function getCaptureDirectionsForPiece(
  piece: Piece,
  playerColor: string,
  backwardCaptures = false,
): Array<[number, number]> {
  if (piece.type === 'king') return getKingDirections();
  if (backwardCaptures) return getKingDirections();
  return getMoveDirections(playerColor);
}

export function inBounds(row: number, col: number, size: number): boolean {
  return row >= 0 && row < size && col >= 0 && col < size;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function countPieces(board: Board, playerId: string): number {
  let count = 0;
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]?.playerId === playerId) count++;
    }
  }
  return count;
}

export interface BoardStats {
  pieces: number;
  kings: number;
}

export function getBoardStats(board: Board, playerId: string): BoardStats {
  let pieces = 0;
  let kings = 0;
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = board[r][c];
      if (cell?.playerId === playerId) {
        pieces++;
        if (cell.type === 'king') kings++;
      }
    }
  }
  return { pieces, kings };
}

export function hasCapturesFrom(
  board: Board,
  row: number,
  col: number,
  playerId: string,
  playerColor: string,
  backwardCaptures = false,
  flyingKings = false,
): boolean {
  const piece = board[row][col];
  if (!piece || piece.playerId !== playerId) return false;

  const directions = getCaptureDirectionsForPiece(
    piece,
    playerColor,
    backwardCaptures,
  );
  const size = board.length;
  const isFlying = flyingKings && piece.type === 'king';

  for (const [dr, dc] of directions) {
    if (isFlying) {
      let r = row + dr;
      let c = col + dc;
      let jumpedPiece = false;
      while (inBounds(r, c, size)) {
        const cell = board[r][c];
        if (cell === null) {
          if (jumpedPiece) return true;
        } else if (cell.playerId !== playerId) {
          if (jumpedPiece) break;
          jumpedPiece = true;
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
      const mid = board[midRow][midCol];
      if (mid === null || mid.playerId === playerId) continue;
      if (board[toRow][toCol] !== null) continue;
      return true;
    }
  }
  return false;
}

export function findSimpleMoves(
  board: Board,
  row: number,
  col: number,
  playerId: string,
  playerColor: string,
  flyingKings = false,
): MoveStep[] {
  const piece = board[row][col];
  if (!piece || piece.playerId !== playerId) return [];

  const directions = getDirectionsForPiece(piece, playerColor);
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

export function findCaptures(
  board: Board,
  row: number,
  col: number,
  playerId: string,
  playerColor: string,
  backwardCaptures = false,
  flyingKings = false,
): MoveStep[] {
  const piece = board[row][col];
  if (!piece || piece.playerId !== playerId) return [];

  const directions = getCaptureDirectionsForPiece(
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

export function findAllCapturesForPlayer(
  board: Board,
  playerId: string,
  playerColor: string,
  backwardCaptures = false,
  flyingKings = false,
): MoveStep[] {
  const captures: MoveStep[] = [];
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]?.playerId === playerId) {
        captures.push(
          ...findCaptures(
            board,
            r,
            c,
            playerId,
            playerColor,
            backwardCaptures,
            flyingKings,
          ),
        );
      }
    }
  }
  return captures;
}

export function findAllSimpleMovesForPlayer(
  board: Board,
  playerId: string,
  playerColor: string,
  flyingKings = false,
): MoveStep[] {
  const moves: MoveStep[] = [];
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]?.playerId === playerId) {
        moves.push(
          ...findSimpleMoves(board, r, c, playerId, playerColor, flyingKings),
        );
      }
    }
  }
  return moves;
}

export function getAvailableMovesForPlayer(
  board: Board,
  playerId: string,
  playerColor: string,
  backwardCaptures = false,
  flyingKings = false,
): MoveStep[] {
  const captures = findAllCapturesForPlayer(
    board,
    playerId,
    playerColor,
    backwardCaptures,
    flyingKings,
  );
  if (captures.length > 0) return captures;
  return findAllSimpleMovesForPlayer(board, playerId, playerColor, flyingKings);
}

export function applyMove(
  board: Board,
  steps: MoveStep[],
  playerColor?: string,
): Board {
  const newBoard = cloneBoard(board);

  if (steps.length === 0) return newBoard;

  const firstStep = steps[0];
  let piece = newBoard[firstStep.fromRow][firstStep.fromCol];
  if (!piece) return newBoard;

  newBoard[firstStep.fromRow][firstStep.fromCol] = null;

  const size = newBoard.length;
  const promotionRow = playerColor === 'light' ? 0 : size - 1;

  for (const step of steps) {
    if (step.capturedRow !== undefined && step.capturedCol !== undefined) {
      newBoard[step.capturedRow][step.capturedCol] = null;
    }
    if (piece.type === 'man' && step.toRow === promotionRow) {
      piece = { ...piece, type: 'king' };
    }
  }

  const lastStep = steps[steps.length - 1];
  newBoard[lastStep.toRow][lastStep.toCol] = piece;

  return newBoard;
}

export function hasAnyMoves(
  board: Board,
  playerId: string,
  playerColor: string,
  backwardCaptures = false,
  flyingKings = false,
): boolean {
  return (
    getAvailableMovesForPlayer(
      board,
      playerId,
      playerColor,
      backwardCaptures,
      flyingKings,
    ).length > 0
  );
}
