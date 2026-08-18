import type { Board, PieceColor, PieceType } from './types';

const CHAR_TO_TYPE: Record<string, PieceType> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

/**
 * Parses the piece-placement section of a FEN string (everything before the
 * first space) into an 8x8 Board. Mirrors the backend `parseFen` in
 * apps/be/src/games/engines/chess/chess.board.ts. The Arcadeum chess engine
 * stores piece-only FENs in `positionHistory`, so this handles both full FENs
 * and the piece-only variant.
 */
export function parseFenPiecePlacement(fen: string): Board {
  const placement = fen.split(' ')[0];
  const rows = placement.split('/');
  if (rows.length !== 8) {
    throw new Error(
      `Invalid FEN placement: expected 8 ranks, got ${rows.length}`,
    );
  }

  const board: Board = [];
  for (let r = 0; r < 8; r++) {
    const row: Board[number] = new Array(8).fill(null);
    let col = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '8') {
        col += Number(ch);
      } else {
        const piece = makePiece(ch);
        if (!piece) {
          throw new Error(`Invalid FEN piece character: ${ch}`);
        }
        row[col] = piece;
        col++;
      }
    }
    if (col !== 8) {
      throw new Error(`Invalid FEN row "${rows[r]}": file count mismatch`);
    }
    board.push(row);
  }
  return board;
}

function makePiece(ch: string): { type: PieceType; color: PieceColor } | null {
  const type = CHAR_TO_TYPE[ch.toLowerCase()];
  if (!type) return null;
  return { type, color: ch === ch.toUpperCase() ? 'white' : 'black' };
}
