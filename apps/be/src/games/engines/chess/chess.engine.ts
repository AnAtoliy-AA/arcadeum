import { Injectable, Logger } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../base/game-engine.interface';
import {
  FILES,
  INITIAL_BOARD_FEN,
  INITIAL_CASTLING_RIGHTS,
} from './chess.constants';
import type { PieceType } from './chess.constants';
import type {
  ChessEngineConfig,
  ChessMove,
  ChessPlayer,
  ChessState,
  MovePayload,
  Rank,
} from './chess.types';
import {
  parseFen,
  boardToFen,
  boardCoordsToPos,
  oppositeColor,
  isThreefoldRepetition,
  isInsufficientMaterial,
} from './chess.board';
import { getLegalMoves, simulateMove } from './chess.move-generator';
import { isInCheck } from './chess.attacks';

const ACTION = {
  MOVE: 'move',
  RESIGN: 'resign',
} as const;

@Injectable()
export class ChessEngine extends BaseGameEngine<ChessState> {
  private readonly logger = new Logger(ChessEngine.name);

  getMetadata(): GameMetadata {
    return {
      gameId: 'chess_v1',
      name: 'Chess',
      minPlayers: 2,
      maxPlayers: 2,
      version: '1.0.0',
      description:
        'Classic chess with full rules including castling, en passant, and promotion',
      category: 'Board Game',
    };
  }

  initializeState(playerIds: string[], config?: ChessEngineConfig): ChessState {
    if (playerIds.length !== 2) {
      throw new Error('Chess requires exactly 2 players');
    }

    const players: ChessPlayer[] = playerIds.map((id, idx) => ({
      playerId: id,
      color: idx === 0 ? 'white' : 'black',
      isBot: false,
    }));

    const clocks = config?.timeControl
      ? {
          white: {
            remainingSeconds: config.timeControl.initialSeconds,
            lastMoveTimestamp: Date.now(),
          },
          black: {
            remainingSeconds: config.timeControl.initialSeconds,
            lastMoveTimestamp: Date.now(),
          },
        }
      : null;

    return {
      variant: config?.variant ?? 'standard',
      board: parseFen(INITIAL_BOARD_FEN),
      currentTurnColor: 'white',
      castlingRights: { ...INITIAL_CASTLING_RIGHTS },
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
      moveHistory: [],
      players,
      winnerColor: null,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDrawByRepetition: false,
      isDrawByFiftyMoveRule: false,
      isInsufficientMaterial: false,
      clocks,
      positionHistory: [INITIAL_BOARD_FEN],
      currentTurnIndex: 0,
      logs: [
        this.createLogEntry('system', 'Chess game started. White moves first.'),
      ],
    };
  }

  validateAction(
    state: ChessState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    if (state.isCheckmate || state.isStalemate || state.winnerColor) {
      return false;
    }

    if (action === ACTION.MOVE) {
      const player = state.players.find((p) => p.playerId === context.userId);
      if (!player || player.color !== state.currentTurnColor) return false;
      if (!payload) return false;
      const movePayload = payload as MovePayload;
      return this.isValidMove(state, movePayload);
    }

    if (action === ACTION.RESIGN) {
      return state.players.some((p) => p.playerId === context.userId);
    }

    return false;
  }

  executeAction(
    state: ChessState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<ChessState> {
    if (action === ACTION.MOVE) {
      return this.executeMove(state, context, payload as MovePayload);
    }
    if (action === ACTION.RESIGN) {
      return this.executeResign(state, context);
    }
    return this.errorResult(`Unknown action: ${action}`);
  }

  isGameOver(state: ChessState): boolean {
    return (
      state.isCheckmate ||
      state.isStalemate ||
      state.winnerColor !== null ||
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial
    );
  }

  getWinners(state: ChessState): string[] {
    if (
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial ||
      state.isStalemate
    ) {
      return [];
    }
    if (state.winnerColor) {
      const winner = state.players.find((p) => p.color === state.winnerColor);
      return winner ? [winner.playerId] : [];
    }
    return [];
  }

  getResult(state: ChessState) {
    if (!this.isGameOver(state)) {
      return { winnerIds: [], isDraw: false };
    }
    if (
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial ||
      state.isStalemate
    ) {
      return { winnerIds: [], isDraw: true };
    }
    return { winnerIds: this.getWinners(state), isDraw: false };
  }

  sanitizeStateForPlayer(state: ChessState): Partial<ChessState> {
    return state;
  }

  getAvailableActions(state: ChessState, playerId: string): string[] {
    if (this.isGameOver(state)) return [];
    const player = state.players.find((p) => p.playerId === playerId);
    if (!player || player.color !== state.currentTurnColor)
      return [ACTION.RESIGN];
    return [ACTION.MOVE, ACTION.RESIGN];
  }

  private isValidMove(state: ChessState, payload: MovePayload): boolean {
    const legalMoves = getLegalMoves(state, state.currentTurnColor);
    return legalMoves.some(
      (m) =>
        m.from.file === payload.fromFile &&
        m.from.rank === payload.fromRank &&
        m.to.file === payload.toFile &&
        m.to.rank === payload.toRank &&
        (!payload.promotion || m.promotion === payload.promotion),
    );
  }

  private findLegalMove(
    state: ChessState,
    fromRank: number,
    fromFile: number,
    toRank: number,
    toFile: number,
    promotion?: PieceType,
  ): ChessMove | undefined {
    const legalMoves = getLegalMoves(state, state.currentTurnColor);
    return legalMoves.find(
      (m) =>
        m.from.file === FILES[fromFile] &&
        m.from.rank === ((8 - fromRank) as Rank) &&
        m.to.file === FILES[toFile] &&
        m.to.rank === ((8 - toRank) as Rank) &&
        (!promotion || m.promotion === promotion),
    );
  }

  private executeMove(
    state: ChessState,
    context: GameActionContext,
    payload: MovePayload,
  ): GameActionResult<ChessState> {
    const fromFile = payload.fromFile.charCodeAt(0) - 97;
    const fromRank = 8 - payload.fromRank;
    const toFile = payload.toFile.charCodeAt(0) - 97;
    const toRank = 8 - payload.toRank;

    const move = this.findLegalMove(
      state,
      fromRank,
      fromFile,
      toRank,
      toFile,
      payload.promotion,
    );
    if (!move) return this.errorResult('Invalid move');

    const newState = this.cloneState(state);
    newState.board = simulateMove(state, move);

    newState.halfMoveClock =
      move.captured || move.piece.type === 'pawn' ? 0 : state.halfMoveClock + 1;

    if (move.piece.type === 'pawn') {
      const dr = Math.abs(toRank - fromRank);
      if (dr === 2) {
        newState.enPassantTarget = boardCoordsToPos(
          (fromRank + toRank) / 2,
          fromFile,
        );
      } else {
        newState.enPassantTarget = null;
      }
    } else {
      newState.enPassantTarget = null;
    }

    this.updateCastlingRights(newState, move);

    if (move.piece.type === 'king') {
      if (move.piece.color === 'white') {
        newState.castlingRights.whiteKingSide = false;
        newState.castlingRights.whiteQueenSide = false;
      } else {
        newState.castlingRights.blackKingSide = false;
        newState.castlingRights.blackQueenSide = false;
      }
    }

    if (move.piece.type === 'rook') {
      if (move.from.file === 'h' && move.from.rank === 8)
        newState.castlingRights.whiteKingSide = false;
      if (move.from.file === 'a' && move.from.rank === 8)
        newState.castlingRights.whiteQueenSide = false;
      if (move.from.file === 'h' && move.from.rank === 1)
        newState.castlingRights.blackKingSide = false;
      if (move.from.file === 'a' && move.from.rank === 1)
        newState.castlingRights.blackQueenSide = false;
    }

    newState.moveHistory = [...state.moveHistory, move];
    newState.currentTurnColor = oppositeColor(state.currentTurnColor);
    if (state.currentTurnColor === 'black') {
      newState.fullMoveNumber++;
    }

    newState.positionHistory = [
      ...state.positionHistory,
      boardToFen(newState.board),
    ];

    const opponentInCheck = isInCheck(
      newState.board,
      newState.currentTurnColor,
    );
    newState.isCheck = opponentInCheck;

    const legalMoves = getLegalMoves(newState, newState.currentTurnColor);
    const hasLegalMoves = legalMoves.length > 0;

    let notation = move.notation;
    if (opponentInCheck && !hasLegalMoves) {
      notation += '#';
    } else if (opponentInCheck) {
      notation += '+';
    }

    newState.logs = [
      ...state.logs,
      this.createLogEntry('action', notation, { senderId: context.userId }),
    ];

    if (!hasLegalMoves) {
      if (opponentInCheck) {
        newState.isCheckmate = true;
        newState.winnerColor = state.currentTurnColor;
        newState.logs.push(
          this.createLogEntry(
            'system',
            `Checkmate! ${state.currentTurnColor} wins!`,
          ),
        );
      } else {
        newState.isStalemate = true;
        newState.logs.push(this.createLogEntry('system', 'Stalemate! Draw.'));
      }
    }

    if (newState.halfMoveClock >= 100) {
      newState.isDrawByFiftyMoveRule = true;
      newState.logs.push(
        this.createLogEntry('system', 'Draw by 50-move rule.'),
      );
    }

    if (isInsufficientMaterial(newState.board)) {
      newState.isInsufficientMaterial = true;
      newState.logs.push(
        this.createLogEntry('system', 'Draw by insufficient material.'),
      );
    }

    if (isThreefoldRepetition(newState.positionHistory)) {
      newState.isDrawByRepetition = true;
      newState.logs.push(
        this.createLogEntry('system', 'Draw by threefold repetition.'),
      );
    }

    return this.successResult(newState);
  }

  private updateCastlingRights(state: ChessState, move: ChessMove): void {
    if (move.piece.type === 'rook') {
      if (move.from.file === 'h' && move.from.rank === 8)
        state.castlingRights.whiteKingSide = false;
      if (move.from.file === 'a' && move.from.rank === 8)
        state.castlingRights.whiteQueenSide = false;
      if (move.from.file === 'h' && move.from.rank === 1)
        state.castlingRights.blackKingSide = false;
      if (move.from.file === 'a' && move.from.rank === 1)
        state.castlingRights.blackQueenSide = false;
    }
  }

  private executeResign(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');

    const newState = this.cloneState(state);
    newState.winnerColor = oppositeColor(player.color);
    newState.logs = [
      ...state.logs,
      this.createLogEntry(
        'system',
        `${player.color} resigned. ${newState.winnerColor} wins!`,
        {
          senderId: context.userId,
        },
      ),
    ];

    return this.successResult(newState);
  }
}
