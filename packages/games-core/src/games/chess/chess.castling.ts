import type { ChessMove, ChessState } from './chess.types';
import { posToBoardCoords, findKing } from './chess.board';

export function updateCastlingRights(state: ChessState, move: ChessMove): void {
  if (move.piece.type === 'king') {
    if (move.piece.color === 'white') {
      state.castlingRights.whiteKingSide = false;
      state.castlingRights.whiteQueenSide = false;
    } else {
      state.castlingRights.blackKingSide = false;
      state.castlingRights.blackQueenSide = false;
    }
    return;
  }

  if (move.captured?.type === 'rook') {
    const capturedCoords = posToBoardCoords(move.to);
    const capturedKing = findKing(state.board, move.captured.color);
    const capturedKingCoords = capturedKing
      ? posToBoardCoords(capturedKing)
      : null;
    if (capturedKingCoords && capturedCoords.rank === capturedKingCoords.rank) {
      if (capturedCoords.file > capturedKingCoords.file) {
        if (move.captured.color === 'white')
          state.castlingRights.whiteKingSide = false;
        else state.castlingRights.blackKingSide = false;
      } else {
        if (move.captured.color === 'white')
          state.castlingRights.whiteQueenSide = false;
        else state.castlingRights.blackQueenSide = false;
      }
    }
  }

  if (move.piece.type === 'rook') {
    const king = findKing(state.board, move.piece.color);
    const kingCoords = king ? posToBoardCoords(king) : { rank: 7, file: 4 };
    const fromCoords = posToBoardCoords(move.from);
    if (fromCoords.rank === kingCoords.rank) {
      if (fromCoords.file > kingCoords.file) {
        if (move.piece.color === 'white')
          state.castlingRights.whiteKingSide = false;
        else state.castlingRights.blackKingSide = false;
      } else if (fromCoords.file < kingCoords.file) {
        if (move.piece.color === 'white')
          state.castlingRights.whiteQueenSide = false;
        else state.castlingRights.blackQueenSide = false;
      }
    }
  }
}
