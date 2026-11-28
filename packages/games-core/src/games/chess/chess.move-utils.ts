import type { PieceType } from './chess.constants';
import type {
  Board,
  BoardPosition,
  ChessMove,
  ChessPiece,
  ChessState,
} from './chess.types';
import { posToBoardCoords } from './chess.board';
import { applyCastleToBoard } from './chess.castling';

export function createMove(
  state: ChessState,
  from: BoardPosition,
  to: BoardPosition,
  piece: ChessPiece,
  captured: ChessPiece | null,
  promotion: PieceType | null,
  isEnPassant = false,
  isCastle = false,
): ChessMove {
  const notation = buildNotation(
    from,
    to,
    piece,
    captured,
    promotion,
    isCastle,
    isEnPassant,
  );
  return {
    from,
    to,
    piece,
    captured,
    promotion,
    isCastle,
    isEnPassant,
    notation,
  };
}

/** SAN piece letters (knight is N, not K). */
export const SAN_LETTER: Record<PieceType, string> = {
  pawn: '',
  knight: 'N',
  bishop: 'B',
  rook: 'R',
  queen: 'Q',
  king: 'K',
};

function buildNotation(
  from: BoardPosition,
  to: BoardPosition,
  piece: ChessPiece,
  captured: ChessPiece | null,
  promotion: PieceType | null,
  isCastle: boolean,
  isEnPassant: boolean,
): string {
  if (isCastle) {
    return to.file > from.file ? 'O-O' : 'O-O-O';
  }

  let notation = '';
  if (piece.type !== 'pawn') {
    notation += SAN_LETTER[piece.type];
  }

  if (captured || isEnPassant) {
    if (piece.type === 'pawn') {
      notation += from.file;
    }
    notation += 'x';
  }

  notation += `${to.file}${to.rank}`;

  if (promotion) {
    notation += `=${SAN_LETTER[promotion]}`;
  }

  return notation;
}

export function simulateMove(state: ChessState, move: ChessMove): Board {
  // Shallow row copies are enough: pieces are never mutated in place.
  const board: Board = state.board.map((row) => [...row]);
  const { rank: fr, file: ff } = posToBoardCoords(move.from);
  const { rank: tr, file: tf } = posToBoardCoords(move.to);

  if (move.isCastle) {
    applyCastleToBoard(board, state, move);
    return board;
  }

  if (move.isEnPassant) {
    board[fr][tf] = null;
  }

  board[tr][tf] = move.promotion
    ? { type: move.promotion, color: move.piece.color }
    : board[fr][ff];
  board[fr][ff] = null;

  return board;
}
