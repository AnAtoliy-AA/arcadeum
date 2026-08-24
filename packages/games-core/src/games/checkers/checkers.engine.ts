import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../../base/game-engine.interface';
import {
  DEFAULT_OPTIONS,
  GAME_PHASE,
  RULE_VARIANT_CONFIGS,
} from './checkers.constants';
import type {
  CheckersState,
  InitializeConfig,
  MovePayload,
} from './checkers.types';
import {
  applyMove,
  countPieces,
  createInitialBoard,
  getOpponentId,
  getPlayerColor,
  hasAnyMoves,
} from './checkers.utils';
import { validateForfeit, validateMovePiece } from './checkers.validators';
import { validateCheckersConfig } from './checkers.config';

const ACTION = {
  MOVE_PIECE: 'move_piece',
  FORFEIT: 'forfeit',
} as const;
export class CheckersEngine extends BaseGameEngine<CheckersState> {
  private readonly logger = createLogger('CheckersEngine');

  getMetadata(): GameMetadata {
    return {
      gameId: 'checkers_v1',
      name: 'Checkers',
      minPlayers: 2,
      maxPlayers: 2,
      version: '2.0.0',
      description:
        'Checkers with American, International (10x10), and Russian variants — forced captures, flying kings, multi-jump, and bot AI',
      category: 'Board Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: InitializeConfig,
  ): CheckersState {
    const options = { ...DEFAULT_OPTIONS, ...(config?.options ?? {}) };
    const ruleConfig = RULE_VARIANT_CONFIGS[options.ruleVariant];

    const players = [
      {
        playerId: playerIds[0],
        color: 'light' as const,
        alive: true,
        piecesRemaining: ruleConfig.piecesPerPlayer,
      },
      {
        playerId: playerIds[1],
        color: 'dark' as const,
        alive: true,
        piecesRemaining: ruleConfig.piecesPerPlayer,
      },
    ];

    return {
      phase: GAME_PHASE.PLAYING,
      options,
      board: createInitialBoard(
        playerIds[1],
        playerIds[0],
        options.ruleVariant,
      ),
      currentTurnIndex: 0,
      playerOrder: [...playerIds],
      players,
      winnerId: null,
      isDraw: false,
      logs: [this.createLogEntry('system', 'Game started.')],
    };
  }

  validateConfig(config: Record<string, unknown>): boolean {
    return validateCheckersConfig(config);
  }

  validateAction(
    state: CheckersState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    if (action === ACTION.MOVE_PIECE) {
      return validateMovePiece(state, payload as MovePayload, context.userId)
        .ok;
    }
    if (action === ACTION.FORFEIT) {
      return validateForfeit(state, context.userId).ok;
    }
    return false;
  }

  executeAction(
    state: CheckersState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<CheckersState> {
    let result: GameActionResult<CheckersState>;
    if (action === ACTION.MOVE_PIECE) {
      result = this.executeMovePiece(state, context, payload as MovePayload);
    } else if (action === ACTION.FORFEIT) {
      result = this.executeForfeit(state, context);
    } else {
      return this.errorResult(`Unknown action: ${action}`);
    }

    if (result.success && result.state) {
      const history =
        ((state as Record<string, unknown>).stateHistory as unknown[]) ?? [];
      const src = state as Record<string, unknown>;
      const stateSnapshot: Record<string, unknown> = {};
      for (const key of Object.keys(src)) {
        if (key !== 'stateHistory' && key !== 'logs')
          stateSnapshot[key] = src[key];
      }
      result.state = {
        ...result.state,
        stateHistory: [...history.slice(-3), structuredClone(stateSnapshot)],
      };
    }

    if (result.state && result.state.logs.length > 100) {
      result.state = {
        ...result.state,
        logs: result.state.logs.slice(-100),
      };
    }

    return result;
  }

  isGameOver(state: CheckersState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: CheckersState): string[] {
    if (!state.winnerId) return [];
    return [state.winnerId];
  }

  getResult(
    state: CheckersState,
  ): import('../../base/game-engine.interface').GameResult {
    if (!this.isGameOver(state)) {
      return { winnerIds: [], isDraw: false };
    }
    return {
      winnerIds: this.getWinners(state),
      isDraw: state.isDraw,
    };
  }

  sanitizeStateForPlayer(state: CheckersState): Partial<CheckersState> {
    return state;
  }

  getAvailableActions(state: CheckersState, playerId: string): string[] {
    if (state.phase !== GAME_PHASE.PLAYING) return [];
    const player = state.players.find((p) => p.playerId === playerId);
    if (!player?.alive) return [];
    const isCurrent = state.playerOrder[state.currentTurnIndex] === playerId;
    return isCurrent ? [ACTION.MOVE_PIECE, ACTION.FORFEIT] : [ACTION.FORFEIT];
  }

  private executeMovePiece(
    state: CheckersState,
    context: GameActionContext,
    payload: MovePayload,
  ): GameActionResult<CheckersState> {
    const validation = validateMovePiece(state, payload, context.userId);
    if (!validation.ok) return this.errorResult(validation.error);

    const newState = this.cloneState(state);
    const playerColor = getPlayerColor(newState, context.userId);
    if (!playerColor) return this.errorResult('Player color not found');

    const newBoard = applyMove(newState.board, payload.steps, playerColor);
    newState.board = newBoard;

    const ruleConfig = RULE_VARIANT_CONFIGS[newState.options.ruleVariant];
    const backwardCaptures =
      newState.options.backwardCaptures || ruleConfig.backwardCapturesForMen;
    const flyingKings = ruleConfig.flyingKings;

    const player = newState.players.find((p) => p.playerId === context.userId);
    if (player) {
      player.piecesRemaining = countPieces(newBoard, context.userId);
    }

    const lastStep = payload.steps[payload.steps.length - 1];
    const isMultiJump = payload.steps.length > 1;
    const isCapture = lastStep.capturedRow !== undefined;

    let moveDesc: string;
    if (isMultiJump) {
      moveDesc = `Multi-jump: ${payload.steps.length} captures`;
    } else if (isCapture) {
      moveDesc = `Captured piece at (${lastStep.capturedRow}, ${lastStep.capturedCol})`;
    } else {
      moveDesc = `Moved from (${lastStep.fromRow}, ${lastStep.fromCol}) to (${lastStep.toRow}, ${lastStep.toCol})`;
    }

    newState.logs.push(
      this.createLogEntry('action', moveDesc, { senderId: context.userId }),
    );

    const opponentId = getOpponentId(newState, context.userId);
    if (!opponentId) return this.errorResult('Opponent not found');

    const opponentColor = getPlayerColor(newState, opponentId);
    if (!opponentColor) return this.errorResult('Opponent color not found');

    const opponentPieces = countPieces(newBoard, opponentId);
    const currentPieces = countPieces(newBoard, context.userId);

    if (opponentPieces === 0) {
      newState.winnerId = context.userId;
      newState.phase = GAME_PHASE.GAME_OVER;
      newState.logs.push(
        this.createLogEntry('system', `${context.userId} wins!`),
      );
      return this.successResult(newState);
    }

    if (currentPieces === 0) {
      newState.winnerId = opponentId;
      newState.phase = GAME_PHASE.GAME_OVER;
      newState.logs.push(this.createLogEntry('system', `${opponentId} wins!`));
      return this.successResult(newState);
    }

    const opponentHasMoves = hasAnyMoves(
      newBoard,
      opponentId,
      opponentColor,
      backwardCaptures,
      flyingKings,
    );
    if (!opponentHasMoves) {
      newState.winnerId = context.userId;
      newState.phase = GAME_PHASE.GAME_OVER;
      newState.logs.push(
        this.createLogEntry(
          'system',
          `${context.userId} wins! Opponent has no moves.`,
        ),
      );
      return this.successResult(newState);
    }

    const currentKingCount = this.countKings(newBoard, context.userId);
    const opponentKingCount = this.countKings(newBoard, opponentId);
    if (
      currentKingCount > 0 &&
      opponentKingCount > 0 &&
      currentPieces + opponentPieces <= 4
    ) {
      const isKingVsKing =
        currentKingCount === currentPieces &&
        opponentKingCount === opponentPieces;
      const isBalancedKings =
        currentKingCount === opponentKingCount &&
        currentPieces <= 2 &&
        opponentPieces <= 2;

      if (isKingVsKing || isBalancedKings) {
        newState.isDraw = true;
        newState.phase = GAME_PHASE.GAME_OVER;
        newState.logs.push(
          this.createLogEntry('system', 'Draw — insufficient material.'),
        );
        return this.successResult(newState);
      }
    }

    newState.currentTurnIndex =
      (newState.currentTurnIndex + 1) % newState.playerOrder.length;

    return this.successResult(newState);
  }

  private executeForfeit(
    state: CheckersState,
    context: GameActionContext,
  ): GameActionResult<CheckersState> {
    const validation = validateForfeit(state, context.userId);
    if (!validation.ok) return this.errorResult(validation.error);

    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');
    player.alive = false;

    newState.logs.push(
      this.createLogEntry('system', 'A player forfeited.', {
        senderId: context.userId,
      }),
    );

    const alivePlayers = newState.players.filter((p) => p.alive);
    if (alivePlayers.length === 1) {
      newState.winnerId = alivePlayers[0].playerId;
      newState.phase = GAME_PHASE.GAME_OVER;
      return this.successResult(newState);
    }

    return this.successResult(newState);
  }

  private countKings(
    board: import('./checkers.types').Board,
    playerId: string,
  ): number {
    let count = 0;
    const size = board.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c]?.playerId === playerId && board[r][c]?.type === 'king')
          count++;
      }
    }
    return count;
  }
}
