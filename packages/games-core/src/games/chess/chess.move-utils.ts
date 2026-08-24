import type { PieceType } from './chess.constants';
import type {
  Board,
  BoardPosition,
  ChessMove,
  ChessPiece,
  ChessState,
} from './chess.types';
import { posToBoardCoords } from './chess.board';

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
    const toFile = to.file.charCodeAt(0) - 97;
    return toFile === 6 ? 'O-O' : 'O-O-O';
  }

  let notation = '';
  if (piece.type !== 'pawn') {
    notation += piece.type.charAt(0).toUpperCase();
  }

  if (captured || isEnPassant) {
    if (piece.type === 'pawn') {
      notation += from.file;
    }
    notation += 'x';
  }

  notation += `${to.file}${to.rank}`;

  if (promotion) {
    notation += `=${promotion.charAt(0).toUpperCase()}`;
  }

  return notation;
}

export function simulateMove(state: ChessState, move: ChessMove): Board {
  const board = structuredClone(state.board);
  const { rank: fr, file: ff } = posToBoardCoords(move.from);
  const { rank: tr, file: tf } = posToBoardCoords(move.to);

  if (move.isEnPassant) {
    board[fr][tf] = null;
  }

  board[tr][tf] = move.promotion
    ? { type: move.promotion, color: move.piece.color }
    : board[fr][ff];
  board[fr][ff] = null;

  if (move.isCastle) {
    if (tf === 6) {
      let rookFrom = ff + 1;
      for (let f = ff + 1; f < 8; f++) {
        if (board[tr][f]?.type === 'rook') {
          rookFrom = f;
          break;
        }
      }
      board[tr][5] = board[tr][rookFrom];
      board[tr][rookFrom] = null;
    } else if (tf === 2) {
      let rookFrom = ff - 1;
      for (let f = ff - 1; f >= 0; f--) {
        if (board[tr][f]?.type === 'rook') {
          rookFrom = f;
          break;
        }
      }
      board[tr][3] = board[tr][rookFrom];
      board[tr][rookFrom] = null;
    }
  }

  return board;
}
