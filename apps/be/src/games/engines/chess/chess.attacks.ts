import type { PieceColor } from './chess.constants';
import type { Board, BoardPosition, ChessPiece } from './chess.types';
import {
  isOnBoard,
  oppositeColor,
  boardCoordsToPos,
  posToBoardCoords,
  findKing,
} from './chess.board';

export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  return isSquareAttacked(board, kingPos, oppositeColor(color));
}

export function isSquareAttacked(
  board: Board,
  target: BoardPosition,
  byColor: PieceColor,
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece || piece.color !== byColor) continue;
      const pos = boardCoordsToPos(r, f);
      const attacks = getSquaresAttacked(board, pos, piece);
      if (attacks.some((a) => a.rank === target.rank && a.file === target.file))
        return true;
    }
  }
  return false;
}

export function getSquaresAttacked(
  board: Board,
  pos: BoardPosition,
  piece: ChessPiece,
): BoardPosition[] {
  const squares: BoardPosition[] = [];
  const { rank, file } = posToBoardCoords(pos);

  switch (piece.type) {
    case 'pawn': {
      const dir = piece.color === 'white' ? -1 : 1;
      for (const df of [-1, 1]) {
        const nr = rank + dir;
        const nf = file + df;
        if (isOnBoard(nr, nf)) {
          squares.push(boardCoordsToPos(nr, nf));
        }
      }
      break;
    }
    case 'knight': {
      const jumps = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ];
      for (const [dr, df] of jumps) {
        const nr = rank + dr;
        const nf = file + df;
        if (isOnBoard(nr, nf)) {
          squares.push(boardCoordsToPos(nr, nf));
        }
      }
      break;
    }
    case 'bishop':
      addSlidingAttacks(
        board,
        rank,
        file,
        [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ],
        squares,
      );
      break;
    case 'rook':
      addSlidingAttacks(
        board,
        rank,
        file,
        [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ],
        squares,
      );
      break;
    case 'queen':
      addSlidingAttacks(
        board,
        rank,
        file,
        [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ],
        squares,
      );
      break;
    case 'king': {
      const dirs = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];
      for (const [dr, df] of dirs) {
        const nr = rank + dr;
        const nf = file + df;
        if (isOnBoard(nr, nf)) {
          squares.push(boardCoordsToPos(nr, nf));
        }
      }
      break;
    }
  }

  return squares;
}

function addSlidingAttacks(
  board: Board,
  rank: number,
  file: number,
  directions: number[][],
  squares: BoardPosition[],
): void {
  for (const [dr, df] of directions) {
    let nr = rank + dr;
    let nf = file + df;
    while (isOnBoard(nr, nf)) {
      squares.push(boardCoordsToPos(nr, nf));
      if (board[nr][nf]) break;
      nr += dr;
      nf += df;
    }
  }
}
