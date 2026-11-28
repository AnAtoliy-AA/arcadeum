import { getLegalMoves } from './chess.move-generator';
import type { ChessState, Board } from './chess.types';

const PIECE_CHAR: Record<string, string> = {
  'white-pawn': 'P',
  'white-knight': 'N',
  'white-bishop': 'B',
  'white-rook': 'R',
  'white-queen': 'Q',
  'white-king': 'K',
  'black-pawn': 'p',
  'black-knight': 'n',
  'black-bishop': 'b',
  'black-rook': 'r',
  'black-queen': 'q',
  'black-king': 'k',
};

function boardToFen(board: Board): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    let row = '';
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece) {
        if (empty > 0) {
          row += empty.toString();
          empty = 0;
        }
        row += PIECE_CHAR[`${piece.color}-${piece.type}`] ?? '';
      } else {
        empty++;
      }
    }
    if (empty > 0) row += empty.toString();
    rows.push(row);
  }
  return rows.join('/');
}

function castlingRights(state: ChessState): string {
  let rights = '';
  if (state.castlingRights.whiteKingSide) rights += 'K';
  if (state.castlingRights.whiteQueenSide) rights += 'Q';
  if (state.castlingRights.blackKingSide) rights += 'k';
  if (state.castlingRights.blackQueenSide) rights += 'q';
  return rights || '-';
}

/**
 * Only emit the en passant square when an en passant capture is actually
 * legal, so positions compare correctly for threefold repetition (FIDE 9.2.3)
 * and FENs match what other tools (lichess, python-chess) produce.
 */
function enPassantSquare(state: ChessState): string {
  const target = state.enPassantTarget;
  if (!target) return '-';
  const hasLegalCapture = getLegalMoves(state, state.currentTurnColor).some(
    (m) =>
      m.isEnPassant && m.to.file === target.file && m.to.rank === target.rank,
  );
  return hasLegalCapture ? `${target.file}${target.rank}` : '-';
}

export function toFen(state: ChessState): string {
  const board = boardToFen(state.board);
  const turn = state.currentTurnColor === 'white' ? 'w' : 'b';
  const castling = castlingRights(state);
  const ep = enPassantSquare(state);
  return `${board} ${turn} ${castling} ${ep} ${state.halfMoveClock} ${state.fullMoveNumber}`;
}
