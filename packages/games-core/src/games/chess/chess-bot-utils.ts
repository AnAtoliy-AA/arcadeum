import { PIECE_VALUES } from './chess.constants';
import type { ChessMove, ChessState } from './chess.types';
import {
  posToBoardCoords,
  boardCoordsToPos,
  oppositeColor,
} from './chess.board';
import { isInCheck } from './chess.attacks';
import { simulateMove } from './chess.move-utils';
import { updateCastlingRights } from './chess.castling';

/**
 * Fast make-move for search. Shares board, castling and en passant logic
 * with the real engine so the bot never searches illegal continuations.
 */
export function applyBotMove(state: ChessState, move: ChessMove): ChessState {
  const newBoard = simulateMove(state, move);
  const fromCoords = posToBoardCoords(move.from);
  const toCoords = posToBoardCoords(move.to);

  const newEnPassant =
    move.piece.type === 'pawn' &&
    Math.abs(toCoords.rank - fromCoords.rank) === 2
      ? boardCoordsToPos((fromCoords.rank + toCoords.rank) / 2, fromCoords.file)
      : null;

  const next: ChessState = {
    ...state,
    board: newBoard,
    castlingRights: { ...state.castlingRights },
  };
  updateCastlingRights(next, move);

  const opp = oppositeColor(state.currentTurnColor);
  const isCheck = isInCheck(newBoard, opp);

  return {
    ...next,
    currentTurnColor: opp,
    enPassantTarget: newEnPassant,
    halfMoveClock:
      move.captured || move.piece.type === 'pawn' ? 0 : state.halfMoveClock + 1,
    fullMoveNumber:
      state.currentTurnColor === 'black'
        ? state.fullMoveNumber + 1
        : state.fullMoveNumber,
    moveHistory: [...state.moveHistory, move],
    isCheck,
    isCheckmate: false,
    isStalemate: false,
    logs: [],
  };
}

export function hasNonPawnMaterial(state: ChessState): boolean {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = state.board[r][f];
      if (
        p &&
        p.color === state.currentTurnColor &&
        p.type !== 'pawn' &&
        p.type !== 'king'
      )
        return true;
    }
  }
  return false;
}

export function hashState(state: ChessState): number {
  let hash = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = state.board[r][f];
      if (p) {
        const pi =
          p.type === 'pawn'
            ? 0
            : p.type === 'knight'
              ? 1
              : p.type === 'bishop'
                ? 2
                : p.type === 'rook'
                  ? 3
                  : p.type === 'queen'
                    ? 4
                    : 5;
        hash =
          (hash * 31 +
            (pi * 2 + (p.color === 'white' ? 0 : 1)) * 64 +
            r * 8 +
            f) |
          0;
      }
    }
  }
  hash = (hash * 31 + (state.currentTurnColor === 'white' ? 0 : 1)) | 0;
  return hash;
}

export function scoreMove(
  move: ChessMove,
  killers: ChessMove[],
  history: number[][],
): number {
  let score = 0;
  if (move.captured) {
    score +=
      PIECE_VALUES[move.captured.type] * 10 - PIECE_VALUES[move.piece.type];
  }
  if (move.promotion) score += PIECE_VALUES[move.promotion] * 10;
  if (move.isCastle) score += 50;

  for (let i = 0; i < killers.length; i++) {
    const k = killers[i];
    if (
      k &&
      k.from.file === move.from.file &&
      k.from.rank === move.from.rank &&
      k.to.file === move.to.file &&
      k.to.rank === move.to.rank
    ) {
      score += 80 - i * 10;
      break;
    }
  }

  const ff = move.from.file.charCodeAt(0) - 97;
  const fr = 8 - move.from.rank;
  if (fr >= 0 && fr < 8 && ff >= 0 && ff < 8) {
    score += Math.min(history[fr][ff], 200);
  }

  return score;
}
