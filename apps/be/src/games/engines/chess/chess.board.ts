import { FILES } from './chess.constants';
import type { PieceColor, PieceType } from './chess.constants';
import type { ChessPiece, Board, BoardPosition, Rank } from './chess.types';

export function parseFen(fen: string): Board {
  const board: Board = [];
  for (let i = 0; i < 8; i++) {
    board.push(new Array<ChessPiece | null>(8).fill(null));
  }
  const rows = fen.split('/');
  const charToType: Record<string, PieceType> = {
    p: 'pawn',
    n: 'knight',
    b: 'bishop',
    r: 'rook',
    q: 'queen',
    k: 'king',
  };
  for (let r = 0; r < 8; r++) {
    let col = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '8') {
        col += parseInt(ch);
      } else {
        const color = ch === ch.toUpperCase() ? 'white' : 'black';
        const type = charToType[ch.toLowerCase()];
        board[r][col] = { type, color };
        col++;
      }
    }
  }
  return board;
}

export function boardToFen(board: Board): string {
  return board
    .map((row) => {
      let fenRow = '';
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const cell = row[c];
        if (!cell) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fenRow += emptyCount;
            emptyCount = 0;
          }
          const ch =
            cell.type === 'pawn'
              ? 'p'
              : cell.type === 'knight'
                ? 'n'
                : cell.type === 'bishop'
                  ? 'b'
                  : cell.type === 'rook'
                    ? 'r'
                    : cell.type === 'queen'
                      ? 'q'
                      : 'k';
          fenRow += cell.color === 'white' ? ch.toUpperCase() : ch;
        }
      }
      if (emptyCount > 0) {
        fenRow += emptyCount;
      }
      return fenRow;
    })
    .join('/');
}

export function posToBoardCoords(pos: BoardPosition): {
  rank: number;
  file: number;
} {
  return { rank: 8 - pos.rank, file: pos.file.charCodeAt(0) - 97 };
}

export function boardCoordsToPos(rank: number, file: number): BoardPosition {
  return { rank: (8 - rank) as Rank, file: FILES[file] };
}

export function isOnBoard(rank: number, file: number): boolean {
  return rank >= 0 && rank <= 7 && file >= 0 && file <= 7;
}

export function oppositeColor(color: PieceColor): PieceColor {
  return color === 'white' ? 'black' : 'white';
}

export function findKing(
  board: Board,
  color: PieceColor,
): BoardPosition | null {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece?.type === 'king' && piece.color === color) {
        return boardCoordsToPos(r, f);
      }
    }
  }
  return null;
}

export function getPiece(board: Board, pos: BoardPosition): ChessPiece | null {
  const { rank, file } = posToBoardCoords(pos);
  if (rank < 0 || rank > 7 || file < 0 || file > 7) return null;
  return board[rank][file];
}

export function setPiece(
  board: Board,
  pos: BoardPosition,
  piece: ChessPiece | null,
): void {
  const { rank, file } = posToBoardCoords(pos);
  if (rank >= 0 && rank <= 7 && file >= 0 && file <= 7) {
    board[rank][file] = piece;
  }
}

export function generateChess960BackRank(): (ChessPiece | null)[] {
  const pieces: ('rook' | 'knight' | 'bishop' | 'queen' | 'king' | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  const evenSquares = [0, 2, 4, 6];
  const oddSquares = [1, 3, 5, 7];

  const lightBishop =
    evenSquares[Math.floor(Math.random() * evenSquares.length)];
  pieces[lightBishop] = 'bishop';

  const darkBishop = oddSquares[Math.floor(Math.random() * oddSquares.length)];
  pieces[darkBishop] = 'bishop';

  const remaining = [0, 1, 2, 3, 4, 5, 6, 7].filter(
    (i) => i !== lightBishop && i !== darkBishop,
  );

  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  const threeSlots = [shuffled[0], shuffled[1], shuffled[2]].sort(
    (a, b) => a - b,
  );

  pieces[threeSlots[0]] = 'rook';
  pieces[threeSlots[1]] = 'king';
  pieces[threeSlots[2]] = 'rook';

  const afterKingRooks = remaining.filter(
    (i) => i !== threeSlots[0] && i !== threeSlots[1] && i !== threeSlots[2],
  );
  const queenIdx =
    afterKingRooks[Math.floor(Math.random() * afterKingRooks.length)];
  pieces[queenIdx] = 'queen';

  const knights = afterKingRooks.filter((i) => i !== queenIdx);
  for (const k of knights) {
    pieces[k] = 'knight';
  }

  return pieces.map((type) => (type ? { type, color: 'white' } : null));
}

export function isThreefoldRepetition(history: string[]): boolean {
  if (history.length < 6) return false;
  const current = history[history.length - 1];
  let count = 0;
  for (const pos of history) {
    if (pos === current) count++;
  }
  return count >= 3;
}

export function isInsufficientMaterial(board: Board): boolean {
  const pieces: ChessPiece[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      if (board[r][f]) {
        pieces.push(board[r][f]!);
      }
    }
  }

  if (pieces.length === 2) return true;
  if (pieces.length === 3) {
    const hasBishop = pieces.some((p) => p.type === 'bishop');
    const hasKnight = pieces.some((p) => p.type === 'knight');
    if (hasBishop || hasKnight) return true;
  }
  if (pieces.length === 4) {
    const bishops = pieces.filter((p) => p.type === 'bishop');
    if (bishops.length === 2 && bishops[0].color !== bishops[1].color) {
      const b1 = findPiecePosition(board, bishops[0]);
      const b2 = findPiecePosition(board, bishops[1]);
      if (b1 && b2 && (b1.rank + b1.file) % 2 === (b2.rank + b2.file) % 2) {
        return true;
      }
    }
  }

  return false;
}

function findPiecePosition(
  board: Board,
  target: ChessPiece,
): { rank: number; file: number } | null {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      if (
        board[r][f]?.type === target.type &&
        board[r][f]?.color === target.color
      ) {
        return { rank: r, file: f };
      }
    }
  }
  return null;
}
