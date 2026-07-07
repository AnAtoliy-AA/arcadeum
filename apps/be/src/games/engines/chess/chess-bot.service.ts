import { Injectable, Logger } from '@nestjs/common';
import { PIECE_VALUES, FILES } from './chess.constants';
import type { PieceType } from './chess.constants';
import type { ChessMove, ChessState, Rank } from './chess.types';
import { posToBoardCoords, oppositeColor } from './chess.board';
import { getLegalMoves } from './chess.move-generator';
import { isInCheck } from './chess.attacks';

const MAX_DEPTH = 4;
const INFINITY = 999999;

const PIECE_SQUARE_TABLES: Record<PieceType, number[][]> = {
  pawn: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  knight: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  bishop: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  rook: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  queen: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  king: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

@Injectable()
export class ChessBotService {
  private readonly logger = new Logger(ChessBotService.name);

  findBestMove(state: ChessState): ChessMove | null {
    const legalMoves = getLegalMoves(state, state.currentTurnColor);
    if (legalMoves.length === 0) return null;

    let bestScore = -INFINITY;
    let bestMoves: ChessMove[] = [];

    for (const move of legalMoves) {
      const newState = this.applyMove(state, move);
      const score = -this.alphabeta(
        newState,
        MAX_DEPTH - 1,
        -INFINITY,
        INFINITY,
      );

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  private alphabeta(
    state: ChessState,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    if (
      depth === 0 ||
      state.isCheckmate ||
      state.isStalemate ||
      state.winnerColor
    ) {
      return this.evaluate(state);
    }

    const legalMoves = getLegalMoves(state, state.currentTurnColor);
    const ordered = this.orderMoves(legalMoves);

    for (const move of ordered) {
      const newState = this.applyMove(state, move);
      const score = -this.alphabeta(newState, depth - 1, -beta, -alpha);

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  private evaluate(state: ChessState): number {
    if (state.isCheckmate) {
      return state.currentTurnColor === 'white' ? -100000 : 100000;
    }
    if (
      state.isStalemate ||
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial
    ) {
      return 0;
    }

    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = state.board[r][f];
        if (!piece) continue;

        const value = PIECE_VALUES[piece.type] * 100;
        const table = PIECE_SQUARE_TABLES[piece.type];
        const pstRow = piece.color === 'white' ? r : 7 - r;
        const pstBonus = table[pstRow][f];

        score +=
          piece.color === 'white' ? value + pstBonus : -(value + pstBonus);
      }
    }

    return score;
  }

  private orderMoves(moves: ChessMove[]): ChessMove[] {
    return [...moves].sort((a, b) => {
      const scoreA =
        (a.captured ? PIECE_VALUES[a.captured.type] * 10 : 0) +
        (a.promotion ? 80 : 0) +
        (a.isCastle ? 50 : 0);
      const scoreB =
        (b.captured ? PIECE_VALUES[b.captured.type] * 10 : 0) +
        (b.promotion ? 80 : 0) +
        (b.isCastle ? 50 : 0);
      return scoreB - scoreA;
    });
  }

  private applyMove(state: ChessState, move: ChessMove): ChessState {
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
        newBoard[toCoords.rank][5] = newBoard[toCoords.rank][7];
        newBoard[toCoords.rank][7] = null;
      } else if (toCoords.file === 2) {
        newBoard[toCoords.rank][3] = newBoard[toCoords.rank][0];
        newBoard[toCoords.rank][0] = null;
      }
    }

    const newEnPassant =
      move.piece.type === 'pawn' &&
      Math.abs(toCoords.rank - fromCoords.rank) === 2
        ? {
            rank: ((fromCoords.rank + toCoords.rank) / 2 + 1) as Rank,
            file: FILES[fromCoords.file],
          }
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
      if (move.from.file === 'h' && move.from.rank === 8)
        newCastlingRights.whiteKingSide = false;
      if (move.from.file === 'a' && move.from.rank === 8)
        newCastlingRights.whiteQueenSide = false;
      if (move.from.file === 'h' && move.from.rank === 1)
        newCastlingRights.blackKingSide = false;
      if (move.from.file === 'a' && move.from.rank === 1)
        newCastlingRights.blackQueenSide = false;
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
}
