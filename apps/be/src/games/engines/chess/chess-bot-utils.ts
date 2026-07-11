import { PIECE_VALUES, FILES } from './chess.constants';
import type { ChessMove, ChessState, Rank } from './chess.types';
import { posToBoardCoords, oppositeColor } from './chess.board';
import { isInCheck } from './chess.attacks';

export function applyBotMove(state: ChessState, move: ChessMove): ChessState {
  const newBoard = structuredClone(state.board);
  const fromCoords = posToBoardCoords(move.from);
  const toCoords = posToBoardCoords(move.to);

  if (move.isEnPassant) {
    newBoard[fromCoords.rank][toCoords.file] = null;
  }

  newBoard[toCoords.rank][toCoords.file] = move.promotion
    ? { type: move.promotion, color: move.piece.color }
    : newBoard[fromCoords.rank][fromCoords.file];
  newBoard[fromCoords.rank][fromCoords.file] = null;

  if (move.isCastle) {
    if (toCoords.file === 6) {
      let rookFrom = 7;
      for (let f = 7; f > toCoords.file; f--) {
        if (newBoard[toCoords.rank][f]?.type === 'rook') {
          rookFrom = f;
          break;
        }
      }
      newBoard[toCoords.rank][5] = newBoard[toCoords.rank][rookFrom];
      newBoard[toCoords.rank][rookFrom] = null;
    } else if (toCoords.file === 2) {
      let rookFrom = 0;
      for (let f = 0; f < toCoords.file; f++) {
        if (newBoard[toCoords.rank][f]?.type === 'rook') {
          rookFrom = f;
          break;
        }
      }
      newBoard[toCoords.rank][3] = newBoard[toCoords.rank][rookFrom];
      newBoard[toCoords.rank][rookFrom] = null;
    }
  }

  const newEnPassant =
    move.piece.type === 'pawn' &&
    Math.abs(toCoords.rank - fromCoords.rank) === 2
      ? ({
          rank: ((fromCoords.rank + toCoords.rank) / 2 + 1) as Rank,
          file: FILES[fromCoords.file],
        } as const)
      : null;

  const newCastlingRights = structuredClone(state.castlingRights);
  if (move.piece.type === 'king') {
    if (move.piece.color === 'white') {
      newCastlingRights.whiteKingSide = false;
      newCastlingRights.whiteQueenSide = false;
    } else {
      newCastlingRights.blackKingSide = false;
      newCastlingRights.blackQueenSide = false;
    }
  }
  if (move.piece.type === 'rook') {
    const kingRank = move.piece.color === 'white' ? 8 : 1;
    if (move.from.rank === kingRank) {
      const kingFile = findKingOnRank(newBoard, kingRank, move.piece.color);
      if (kingFile !== null) {
        const fromFile = move.from.file.charCodeAt(0) - 97;
        if (fromFile > kingFile) {
          if (move.piece.color === 'white')
            newCastlingRights.whiteKingSide = false;
          else newCastlingRights.blackKingSide = false;
        } else {
          if (move.piece.color === 'white')
            newCastlingRights.whiteQueenSide = false;
          else newCastlingRights.blackQueenSide = false;
        }
      }
    }
  }

  const opp = oppositeColor(state.currentTurnColor);
  const isCheck = isInCheck(newBoard, opp);

  return {
    ...state,
    board: newBoard,
    currentTurnColor: opp,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassant,
    halfMoveClock: move.captured ? 0 : state.halfMoveClock + 1,
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

function findKingOnRank(
  board: ChessState['board'],
  rank: number,
  color: 'white' | 'black',
): number | null {
  const row = 8 - rank;
  for (let f = 0; f < 8; f++) {
    if (board[row][f]?.type === 'king' && board[row][f]?.color === color)
      return f;
  }
  return null;
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
