import { FILES } from './chess.constants';
import type { PieceColor, PieceType } from './chess.constants';
import type { ChessPiece, Board, BoardPosition, Rank } from './chess.types';

export function parseFen(fen: string): Board {
  const board: Board = [];
  for (let i = 0; i < 8; i++) {
    board.push(new Array<ChessPiece | null>(8).fill(null));
  }
  // Accept either a bare piece-placement field or a full FEN string.
  const placement = fen.trim().split(/\s+/)[0] ?? '';
  const rows = placement.split('/');
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
    for (const ch of rows[r] ?? '') {
      if (col > 7) break;
      if (ch >= '1' && ch <= '8') {
        col += parseInt(ch);
      } else {
        const type = charToType[ch.toLowerCase()];
        if (!type) continue;
        const color = ch === ch.toUpperCase() ? 'white' : 'black';
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

/**
 * FIDE 9.2: positions are identical when the same pieces occupy the same
 * squares, the same side is to move, and castling / en passant rights are
 * the same. The halfmove clock and fullmove number are NOT part of it, so
 * they are stripped from the stored FEN before comparing.
 */
export function repetitionKey(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(' ');
}

export function isThreefoldRepetition(history: string[]): boolean {
  if (history.length < 5) return false;
  const current = repetitionKey(history[history.length - 1]);
  let count = 0;
  for (const pos of history) {
    if (repetitionKey(pos) === current) count++;
  }
  return count >= 3;
}

interface MaterialSummary {
  pieces: { piece: ChessPiece; squareColor: number }[];
}

function summarizeMaterial(board: Board): MaterialSummary {
  const pieces: MaterialSummary['pieces'] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r]?.[f];
      if (piece && piece.type !== 'king') {
        pieces.push({ piece, squareColor: (r + f) % 2 });
      }
    }
  }
  return { pieces };
}

/**
 * Dead position by material (FIDE 5.2.2 / 9.6.2): neither side can ever
 * checkmate. Covers K v K, K+minor v K, and any number of bishops (either
 * side) that all stand on the same square colour.
 */
export function isInsufficientMaterial(board: Board): boolean {
  const { pieces } = summarizeMaterial(board);
  if (pieces.length === 0) return true;
  if (
    pieces.length === 1 &&
    (pieces[0].piece.type === 'bishop' || pieces[0].piece.type === 'knight')
  ) {
    return true;
  }
  if (pieces.every((p) => p.piece.type === 'bishop')) {
    const shade = pieces[0].squareColor;
    return pieces.every((p) => p.squareColor === shade);
  }
  return false;
}

/**
 * FIDE 6.9: when a player's flag falls, the game is drawn if the opponent
 * cannot checkmate by any possible series of legal moves. Conservative
 * (lichess-style): returns false only for material that can never mate.
 */
export function hasMatingMaterial(board: Board, color: PieceColor): boolean {
  const { pieces } = summarizeMaterial(board);
  const own = pieces.filter((p) => p.piece.color === color);
  const theirs = pieces.filter((p) => p.piece.color !== color);
  if (own.length === 0) return false;
  if (own.some((p) => p.piece.type !== 'bishop' && p.piece.type !== 'knight')) {
    return true;
  }
  if (own.length === 1 && own[0].piece.type === 'knight') {
    // A lone knight can only mate if the defender has blocking material.
    return theirs.length > 0;
  }
  if (own.every((p) => p.piece.type === 'bishop')) {
    const shade = own[0].squareColor;
    const allSameShade = own.every((p) => p.squareColor === shade);
    if (!allSameShade) return true;
    // Same-shade bishops need a defender piece that can block on the
    // opposite shade (pawn, knight, or bishop of the other colour).
    return theirs.some(
      (p) =>
        p.piece.type === 'pawn' ||
        p.piece.type === 'knight' ||
        (p.piece.type === 'bishop' && p.squareColor !== shade),
    );
  }
  return true;
}
