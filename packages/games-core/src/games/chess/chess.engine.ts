import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../../base/game-engine.interface';
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
  generateChess960BackRank,
} from './chess.board';
import { getLegalMoves, simulateMove } from './chess.move-generator';
import { isInCheck } from './chess.attacks';
import { updateCastlingRights } from './chess.castling';

const ACTION = {
  MOVE: 'move',
  RESIGN: 'resign',
  FORFEIT: 'forfeit',
  DRAW_OFFER: 'draw_offer',
  DRAW_ACCEPT: 'draw_accept',
} as const;
export class ChessEngine extends BaseGameEngine<ChessState> {
  private readonly logger = createLogger('ChessEngine');

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
    if (playerIds.length !== 2)
      throw new Error('Chess requires exactly 2 players');

    const shouldRandomize =
      (config as Record<string, unknown>)?.firstPlayer === 'random';
    const orderedIds = shouldRandomize
      ? [...playerIds].sort(() => Math.random() - 0.5)
      : [...playerIds];

    const players: ChessPlayer[] = orderedIds.map((id, idx) => ({
      playerId: id,
      color: idx === 0 ? 'white' : ('black' as const),
      isBot: id.startsWith('bot-'),
    }));
    const opts =
      config && typeof config === 'object' && 'options' in config
        ? (config.options as ChessEngineConfig)
        : config;
    const timeControl = opts?.timeControl ?? null;
    const botDifficulty = opts?.botDifficulty ?? opts?.aiDifficulty ?? 'medium';
    const clocks = timeControl
      ? ({
          white: {
            remainingSeconds: timeControl.type === 'daily'
              ? (timeControl.daysPerMove ?? 1) * 86400
              : timeControl.initialSeconds,
            lastMoveTimestamp: Date.now(),
          },
          black: {
            remainingSeconds: timeControl.type === 'daily'
              ? (timeControl.daysPerMove ?? 1) * 86400
              : timeControl.initialSeconds,
            lastMoveTimestamp: Date.now(),
          },
        } as const)
      : null;
    const variant = opts?.variant ?? 'standard';
    const initialBoard =
      variant === 'chess960'
        ? (() => {
            const backRank = generateChess960BackRank();
            const board = parseFen(INITIAL_BOARD_FEN);
            board[7] = backRank;
            board[0] = backRank.map((p) =>
              p ? { ...p, color: 'black' } : null,
            );
            return board;
          })()
        : parseFen(INITIAL_BOARD_FEN);
    return {
      variant,
      timeControl,
      botDifficulty,
      board: initialBoard,
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
      isDrawByAgreement: false,
      drawOfferedBy: null,
      clocks,
      positionHistory: [boardToFen(initialBoard)],
      currentTurnIndex: 0,
      logs: [
        this.createLogEntry('system', 'Chess game started. White moves first.'),
      ],
      legalMovesForCurrentPlayer: getLegalMoves(
        {
          board: initialBoard,
          currentTurnColor: 'white',
          castlingRights: { ...INITIAL_CASTLING_RIGHTS },
          enPassantTarget: null,
        } as ChessState,
        'white',
      ).map((m) => ({ from: m.from, to: m.to, promotion: m.promotion })),
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

    if (action === ACTION.RESIGN || action === ACTION.FORFEIT) {
      return state.players.some((p) => p.playerId === context.userId);
    }

    if (action === ACTION.DRAW_OFFER) {
      const player = state.players.find((p) => p.playerId === context.userId);
      if (!player || player.color !== state.currentTurnColor) return false;
      if (state.drawOfferedBy) return false;
      return true;
    }

    if (action === ACTION.DRAW_ACCEPT) {
      const player = state.players.find((p) => p.playerId === context.userId);
      if (!player) return false;
      return (
        state.drawOfferedBy !== null && state.drawOfferedBy !== context.userId
      );
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
    if (action === ACTION.RESIGN || action === ACTION.FORFEIT) {
      return this.executeResign(state, context);
    }
    if (action === ACTION.DRAW_OFFER) {
      return this.executeDrawOffer(state, context);
    }
    if (action === ACTION.DRAW_ACCEPT) {
      return this.executeDrawAccept(state, context);
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
      state.isInsufficientMaterial ||
      state.isDrawByAgreement
    );
  }

  getWinners(state: ChessState): string[] {
    const isDraw =
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial ||
      state.isStalemate ||
      state.isDrawByAgreement;
    if (isDraw) return [];
    if (state.winnerColor) {
      const winner = state.players.find((p) => p.color === state.winnerColor);
      return winner ? [winner.playerId] : [];
    }
    return [];
  }

  getResult(state: ChessState) {
    if (!this.isGameOver(state)) return { winnerIds: [], isDraw: false };
    const isDraw =
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial ||
      state.isStalemate ||
      state.isDrawByAgreement;
    if (isDraw) return { winnerIds: [], isDraw: true };
    return { winnerIds: this.getWinners(state), isDraw: false };
  }

  sanitizeStateForPlayer(state: ChessState): Partial<ChessState> {
    return state;
  }

  getAvailableActions(state: ChessState, playerId: string): string[] {
    if (this.isGameOver(state)) return [];
    const player = state.players.find((p) => p.playerId === playerId);
    if (!player || player.color !== state.currentTurnColor)
      return [ACTION.RESIGN, ACTION.FORFEIT];
    return [ACTION.MOVE, ACTION.RESIGN, ACTION.FORFEIT];
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

    updateCastlingRights(newState, move);

    newState.moveHistory = [...state.moveHistory, move];
    newState.currentTurnColor = oppositeColor(state.currentTurnColor);
    if (state.currentTurnColor === 'black') {
      newState.fullMoveNumber++;
    }

    if (newState.clocks) {
      const movingColor = state.currentTurnColor;
      const clock = { ...newState.clocks[movingColor] };
      const tc = (
        state as unknown as { timeControl?: { incrementSeconds?: number } }
      ).timeControl;
      const increment = tc?.incrementSeconds ?? 0;
      clock.remainingSeconds += increment;
      clock.lastMoveTimestamp = Date.now();
      newState.clocks = { ...newState.clocks, [movingColor]: clock };
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
      this.markDraw(newState, 'isDrawByFiftyMoveRule', 'Draw by 50-move rule.');
    }
    if (isInsufficientMaterial(newState.board)) {
      this.markDraw(
        newState,
        'isInsufficientMaterial',
        'Draw by insufficient material.',
      );
    }
    if (isThreefoldRepetition(newState.positionHistory)) {
      this.markDraw(
        newState,
        'isDrawByRepetition',
        'Draw by threefold repetition.',
      );
    }

    newState.legalMovesForCurrentPlayer = getLegalMoves(
      newState,
      newState.currentTurnColor,
    ).map((m) => ({ from: m.from, to: m.to, promotion: m.promotion }));

    return this.successResult(newState);
  }

  private markDraw(
    state: ChessState,
    key:
      'isDrawByFiftyMoveRule' | 'isInsufficientMaterial' | 'isDrawByRepetition',
    message: string,
  ): void {
    (state as Record<string, unknown>)[key] = true;
    state.logs.push(this.createLogEntry('system', message));
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
        { senderId: context.userId },
      ),
    ];
    return this.successResult(newState);
  }

  private executeDrawOffer(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');
    const newState = this.cloneState(state);
    newState.drawOfferedBy = context.userId;
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', `${player.color} offers a draw.`, {
        senderId: context.userId,
      }),
    ];
    return this.successResult(newState);
  }

  private executeDrawAccept(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const newState = this.cloneState(state);
    newState.isDrawByAgreement = true;
    newState.drawOfferedBy = null;
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', 'Draw by agreement.', {
        senderId: context.userId,
      }),
    ];
    return this.successResult(newState);
  }
}
