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
  boardCoordsToPos,
  oppositeColor,
  isThreefoldRepetition,
  isInsufficientMaterial,
  hasMatingMaterial,
  generateChess960BackRank,
} from './chess.board';
import { getLegalMoves, simulateMove } from './chess.move-generator';
import { isInCheck } from './chess.attacks';
import {
  updateCastlingRights,
  deriveCastlingRookFiles,
} from './chess.castling';
import {
  canAbort,
  insufficientMaterialApplies,
  isChessDraw,
  isChessGameOver,
  recomputeVariantCounters,
  restoreFromFen,
  setEndReason,
  toLegalMoveList,
} from './chess-engine-rules';
import { applyMoveClock, restartTurnClock } from './chess-clock';
import { toFen } from './chess-fen';
import { checkKingOfTheHillWin } from './chess-variants/king-of-the-hill';
import {
  createThreeCheckState,
  recordCheck,
  checkThreeCheckWin,
  type ThreeCheckState,
} from './chess-variants/three-check';
import { applyExplosion, isKingCaptured } from './chess-variants/atomic';
import {
  createCrazyhouseState,
  recordCapture,
  canDrop,
  type CrazyhouseState,
} from './chess-variants/crazyhouse';

const ACTION = {
  MOVE: 'move',
  RESIGN: 'resign',
  FORFEIT: 'forfeit',
  DRAW_OFFER: 'draw_offer',
  DRAW_ACCEPT: 'draw_accept',
  TAKEBACK_OFFER: 'takeback_offer',
  TAKEBACK_ACCEPT: 'takeback_accept',
  TAKEBACK_DECLINE: 'takeback_decline',
  DRAW_DECLINE: 'draw_decline',
  ABORT: 'abort',
  TIMEOUT: 'timeout',
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
            remainingSeconds:
              timeControl.type === 'daily'
                ? (timeControl.daysPerMove ?? 1) * 86400
                : timeControl.initialSeconds,
            lastMoveTimestamp: 0,
          },
          black: {
            remainingSeconds:
              timeControl.type === 'daily'
                ? (timeControl.daysPerMove ?? 1) * 86400
                : timeControl.initialSeconds,
            lastMoveTimestamp: 0,
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
    const baseState: ChessState = {
      variant,
      timeControl,
      botDifficulty,
      board: initialBoard,
      currentTurnColor: 'white',
      gameCreatedAt: Date.now(),
      castlingRights: { ...INITIAL_CASTLING_RIGHTS },
      castlingRookFiles: deriveCastlingRookFiles(initialBoard),
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
      takebackOfferedBy: null,
      takebackMoveIndex: null,
      clocks,
      positionHistory: [
        toFen({
          variant,
          board: initialBoard,
          currentTurnColor: 'white',
          castlingRights: { ...INITIAL_CASTLING_RIGHTS },
          enPassantTarget: null,
          halfMoveClock: 0,
          fullMoveNumber: 1,
        } as ChessState),
      ],
      currentTurnIndex: 0,
      logs: [
        this.createLogEntry('system', 'Chess game started. White moves first.'),
      ],
      legalMovesForCurrentPlayer: getLegalMoves(
        {
          variant,
          board: initialBoard,
          currentTurnColor: 'white',
          castlingRights: { ...INITIAL_CASTLING_RIGHTS },
          enPassantTarget: null,
        } as ChessState,
        'white',
      ).map((m) => ({ from: m.from, to: m.to, promotion: m.promotion })),
    };

    if (variant === 'three_check') {
      return createThreeCheckState(baseState);
    }
    if (variant === 'crazyhouse') {
      return createCrazyhouseState(baseState);
    }
    return baseState;
  }

  validateAction(
    state: ChessState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return false;
    if (isChessGameOver(state)) return false;

    switch (action) {
      case ACTION.MOVE:
        if (player.color !== state.currentTurnColor || !payload) return false;
        return this.isValidMove(state, payload as MovePayload);
      case ACTION.RESIGN:
      case ACTION.FORFEIT:
        return true;
      case ACTION.TIMEOUT:
        // Issued by the server clock for the side whose flag fell.
        return player.color === state.currentTurnColor;
      case ACTION.ABORT:
        return canAbort(state);
      case ACTION.DRAW_OFFER:
        // FIDE 9.1.2.2: a draw may be offered at any time, once per offer.
        return state.drawOfferedBy === null;
      case ACTION.DRAW_ACCEPT:
      case ACTION.DRAW_DECLINE:
        return (
          state.drawOfferedBy !== null && state.drawOfferedBy !== context.userId
        );
      case ACTION.TAKEBACK_OFFER:
        return (
          !state.takebackOfferedBy &&
          this.takebackPlies(state, player.color) > 0
        );
      case ACTION.TAKEBACK_ACCEPT:
      case ACTION.TAKEBACK_DECLINE:
        return (
          state.takebackOfferedBy !== null &&
          state.takebackOfferedBy !== context.userId
        );
      default:
        return false;
    }
  }

  /**
   * Plies a takeback by `color` removes: their own last move, plus the
   * opponent's reply when it is already `color`'s turn again. Zero when
   * `color` has not moved yet.
   */
  private takebackPlies(
    state: ChessState,
    color: ChessState['currentTurnColor'],
  ): number {
    const history = state.moveHistory;
    if (history.length === 0) return 0;
    const lastMover = history[history.length - 1].piece.color;
    if (lastMover === color) return 1;
    return history.length >= 2 ? 2 : 0;
  }

  executeAction(
    state: ChessState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<ChessState> {
    // The session layer calls executeAction directly, so the rules in
    // validateAction (turn order, offer and abort windows) are enforced here.
    if (!this.validateAction(state, action, context, payload)) {
      return this.errorResult(
        action === ACTION.MOVE
          ? 'Invalid move'
          : `Action not allowed: ${action}`,
      );
    }
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
    if (action === ACTION.TAKEBACK_OFFER) {
      return this.executeTakebackOffer(state, context);
    }
    if (action === ACTION.TAKEBACK_ACCEPT) {
      return this.executeTakebackAccept(state, context);
    }
    if (action === ACTION.TAKEBACK_DECLINE) {
      return this.executeTakebackDecline(state, context);
    }
    if (action === ACTION.DRAW_DECLINE) {
      return this.executeDrawDecline(state, context);
    }
    if (action === ACTION.ABORT) {
      return this.executeAbort(state, context);
    }
    if (action === ACTION.TIMEOUT) {
      return this.executeTimeout(state, context);
    }
    return this.errorResult(`Unknown action: ${action}`);
  }

  isGameOver(state: ChessState): boolean {
    return isChessGameOver(state);
  }

  getWinners(state: ChessState): string[] {
    if (isChessDraw(state) || state.isAborted) return [];
    if (state.winnerColor) {
      const winner = state.players.find((p) => p.color === state.winnerColor);
      return winner ? [winner.playerId] : [];
    }
    return [];
  }

  getResult(state: ChessState) {
    if (!this.isGameOver(state)) return { winnerIds: [], isDraw: false };
    if (state.isAborted) return { winnerIds: [], isDraw: false, aborted: true };
    if (isChessDraw(state)) return { winnerIds: [], isDraw: true };
    return { winnerIds: this.getWinners(state), isDraw: false };
  }

  sanitizeStateForPlayer(state: ChessState): Partial<ChessState> {
    return state;
  }

  getAvailableActions(state: ChessState, playerId: string): string[] {
    if (this.isGameOver(state)) return [];
    const player = state.players.find((p) => p.playerId === playerId);
    if (!player) return [];
    const base: string[] = canAbort(state)
      ? [ACTION.ABORT, ACTION.RESIGN, ACTION.FORFEIT]
      : [ACTION.RESIGN, ACTION.FORFEIT];
    return player.color === state.currentTurnColor
      ? [ACTION.MOVE, ...base]
      : base;
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
    if (!newState.castlingRookFiles) {
      // Legacy sessions: pin the rook files before the board changes.
      newState.castlingRookFiles =
        state.variant === 'chess960'
          ? deriveCastlingRookFiles(state.board)
          : deriveCastlingRookFiles(parseFen(INITIAL_BOARD_FEN));
    }
    newState.board = simulateMove(state, move);

    newState.halfMoveClock =
      move.captured || move.piece.type === 'pawn' ? 0 : state.halfMoveClock + 1;

    newState.enPassantTarget =
      move.piece.type === 'pawn' && Math.abs(toRank - fromRank) === 2
        ? boardCoordsToPos((fromRank + toRank) / 2, fromFile)
        : null;

    updateCastlingRights(newState, move);

    newState.currentTurnColor = oppositeColor(state.currentTurnColor);
    if (state.currentTurnColor === 'black') {
      newState.fullMoveNumber++;
    }

    // A move answers any pending offer from the opponent (FIDE 9.1.2.3) and
    // invalidates any takeback request.
    if (newState.drawOfferedBy && newState.drawOfferedBy !== context.userId) {
      newState.drawOfferedBy = null;
    }
    newState.takebackOfferedBy = null;
    newState.takebackMoveIndex = null;

    applyMoveClock(newState, state.currentTurnColor);

    // Atomic explosions change the board before check / mate detection.
    if (newState.variant === 'atomic' && move.captured) {
      newState.board = applyExplosion(newState, move.to).board;
    }

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
    newState.moveHistory = [...state.moveHistory, { ...move, notation }];
    newState.positionHistory = [...state.positionHistory, toFen(newState)];

    const fromRow = 8 - move.from.rank;
    const fromCol = move.from.file.charCodeAt(0) - 97;
    const toRow = 8 - move.to.rank;
    const toCol = move.to.file.charCodeAt(0) - 97;
    const moveLog = `${notation} Move from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`;

    newState.logs = [
      ...state.logs,
      this.createLogEntry('action', moveLog, { senderId: context.userId }),
    ];

    this.applyVariantRules(newState, state, move, opponentInCheck);
    if (newState.winnerColor) {
      newState.legalMovesForCurrentPlayer = [];
      return this.successResult(newState);
    }

    if (!hasLegalMoves) {
      if (opponentInCheck) {
        newState.isCheckmate = true;
        newState.winnerColor = state.currentTurnColor;
        setEndReason(newState, 'checkmate');
        newState.logs.push(
          this.createLogEntry(
            'system',
            `Checkmate! ${state.currentTurnColor} wins!`,
          ),
        );
      } else {
        newState.isStalemate = true;
        setEndReason(newState, 'stalemate');
        newState.logs.push(this.createLogEntry('system', 'Stalemate! Draw.'));
      }
    } else {
      // Checkmate takes precedence over the automatic draw rules (FIDE 9.6).
      if (
        insufficientMaterialApplies(newState) &&
        isInsufficientMaterial(newState.board)
      ) {
        this.markDraw(
          newState,
          'isInsufficientMaterial',
          'Draw by insufficient material.',
        );
      } else if (isThreefoldRepetition(newState.positionHistory)) {
        this.markDraw(
          newState,
          'isDrawByRepetition',
          'Draw by threefold repetition.',
        );
      } else if (newState.halfMoveClock >= 100) {
        this.markDraw(
          newState,
          'isDrawByFiftyMoveRule',
          'Draw by 50-move rule.',
        );
      }
    }

    newState.legalMovesForCurrentPlayer = isChessGameOver(newState)
      ? []
      : toLegalMoveList(newState);

    return this.successResult(newState);
  }

  private applyVariantRules(
    newState: ChessState,
    prevState: ChessState,
    move: ChessMove,
    opponentInCheck: boolean,
  ): void {
    const declare = (
      winner: ChessState['currentTurnColor'],
      message: string,
    ) => {
      newState.winnerColor = winner;
      setEndReason(newState, 'variant_win');
      newState.logs.push(this.createLogEntry('system', message));
    };

    if (newState.variant === 'king_of_the_hill') {
      const kothWinner = checkKingOfTheHillWin(newState);
      if (kothWinner)
        declare(kothWinner, `${kothWinner} wins by King of the Hill!`);
    }

    if (newState.variant === 'three_check') {
      const tcState = newState as ThreeCheckState;
      if (!tcState.checkCount) tcState.checkCount = { white: 0, black: 0 };
      if (opponentInCheck) {
        tcState.checkCount = recordCheck(
          tcState,
          newState.currentTurnColor,
        ).checkCount;
        const winner = checkThreeCheckWin(tcState);
        if (winner) declare(winner, `${winner} wins by Three-Check!`);
      }
    }

    if (newState.variant === 'atomic' && move.captured) {
      if (isKingCaptured(newState, 'white')) {
        declare(
          'black',
          'Black wins! White king was destroyed in the explosion!',
        );
      } else if (isKingCaptured(newState, 'black')) {
        declare(
          'white',
          'White wins! Black king was destroyed in the explosion!',
        );
      }
    }

    if (newState.variant === 'crazyhouse') {
      const czState = newState as CrazyhouseState;
      if (!czState.capturedPieces) {
        czState.capturedPieces = { white: [], black: [] };
      }
      if (move.captured) {
        czState.capturedPieces = recordCapture(
          czState,
          move.captured,
          prevState.currentTurnColor,
        ).capturedPieces;
      }
    }
  }

  private markDraw(
    state: ChessState,
    key:
      'isDrawByFiftyMoveRule' | 'isInsufficientMaterial' | 'isDrawByRepetition',
    message: string,
  ): void {
    state[key] = true;
    setEndReason(
      state,
      key === 'isDrawByFiftyMoveRule'
        ? 'fifty_move'
        : key === 'isInsufficientMaterial'
          ? 'insufficient_material'
          : 'repetition',
    );
    state.legalMovesForCurrentPlayer = [];
    state.logs.push(this.createLogEntry('system', message));
  }

  private finish(state: ChessState): ChessState {
    state.drawOfferedBy = null;
    state.takebackOfferedBy = null;
    state.takebackMoveIndex = null;
    state.legalMovesForCurrentPlayer = [];
    return state;
  }

  private executeResign(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');
    const newState = this.finish(this.cloneState(state));
    newState.winnerColor = oppositeColor(player.color);
    setEndReason(newState, 'resignation');
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

  /**
   * Flag fall (FIDE 6.9): the flagged side loses, unless the opponent has no
   * possible way to checkmate, in which case the game is drawn.
   */
  private executeTimeout(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');
    const newState = this.finish(this.cloneState(state));
    const opponent = oppositeColor(player.color);
    if (newState.clocks) {
      newState.clocks = {
        ...newState.clocks,
        [player.color]: {
          ...newState.clocks[player.color],
          remainingSeconds: 0,
        },
      };
    }
    const opponentCanMate =
      !insufficientMaterialApplies(newState) ||
      hasMatingMaterial(newState.board, opponent);
    let message: string;
    if (opponentCanMate) {
      newState.winnerColor = opponent;
      setEndReason(newState, 'timeout');
      message = `${player.color} ran out of time. ${opponent} wins!`;
    } else {
      newState.isDrawByTimeout = true;
      setEndReason(newState, 'timeout_vs_insufficient');
      message = `${player.color} ran out of time, but ${opponent} cannot checkmate. Draw.`;
    }
    newState.logs = [...state.logs, this.createLogEntry('system', message)];
    return this.successResult(newState);
  }

  private executeAbort(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');
    const newState = this.finish(this.cloneState(state));
    newState.isAborted = true;
    setEndReason(newState, 'aborted');
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', 'Game aborted.', {
        senderId: context.userId,
      }),
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
    const newState = this.finish(this.cloneState(state));
    newState.isDrawByAgreement = true;
    setEndReason(newState, 'agreement');
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', 'Draw by agreement.', {
        senderId: context.userId,
      }),
    ];
    return this.successResult(newState);
  }

  private executeDrawDecline(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const newState = this.cloneState(state);
    newState.drawOfferedBy = null;
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', 'Draw offer declined.', {
        senderId: context.userId,
      }),
    ];
    return this.successResult(newState);
  }

  private executeTakebackOffer(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');
    const plies = this.takebackPlies(state, player.color);
    if (plies === 0) return this.errorResult('Nothing to take back');
    const newState = this.cloneState(state);
    newState.takebackOfferedBy = context.userId;
    newState.takebackMoveIndex = state.moveHistory.length - plies;
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', `${player.color} offers a takeback.`, {
        senderId: context.userId,
      }),
    ];
    return this.successResult(newState);
  }

  private executeTakebackAccept(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    if (!state.takebackOfferedBy || state.takebackMoveIndex === null) {
      return this.errorResult('No takeback offer pending');
    }
    const revertToIndex = Math.max(0, state.takebackMoveIndex);
    const targetFen = state.positionHistory[revertToIndex];
    if (!targetFen) return this.errorResult('Takeback position unavailable');

    const newState = this.cloneState(state);
    newState.moveHistory = state.moveHistory.slice(0, revertToIndex);
    newState.positionHistory = state.positionHistory.slice(
      0,
      revertToIndex + 1,
    );
    restoreFromFen(newState, targetFen);
    recomputeVariantCounters(newState);
    newState.takebackOfferedBy = null;
    newState.takebackMoveIndex = null;
    newState.drawOfferedBy = null;
    newState.isCheckmate = false;
    newState.isStalemate = false;
    restartTurnClock(newState);
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', 'Takeback accepted.', {
        senderId: context.userId,
      }),
    ];
    newState.legalMovesForCurrentPlayer = toLegalMoveList(newState);
    return this.successResult(newState);
  }

  private executeTakebackDecline(
    state: ChessState,
    context: GameActionContext,
  ): GameActionResult<ChessState> {
    const newState = this.cloneState(state);
    newState.takebackOfferedBy = null;
    newState.takebackMoveIndex = null;
    newState.logs = [
      ...state.logs,
      this.createLogEntry('system', 'Takeback declined.', {
        senderId: context.userId,
      }),
    ];
    return this.successResult(newState);
  }
}
