import { Injectable, Logger } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../base/game-engine.interface';
import {
  ACTION,
  BOARD_SIZES,
  DEFAULT_OPTIONS,
  GAME_PHASE,
  KOMI,
  type BoardSize,
  type StoneColor,
} from './go.constants';
import type {
  GoPlayer,
  GoState,
  InitializeConfig,
  PlaceStonePayload,
} from './go.types';
import { applyMove, scoreBoard, shuffleInPlace } from './go.utils';
import {
  isKnownAction,
  validateForfeit,
  validatePassTurn,
  validatePlaceStone,
} from './go.validators';

const COLOR_LABEL: Record<StoneColor, string> = {
  black: 'Black',
  white: 'White',
};

@Injectable()
export class GoEngine extends BaseGameEngine<GoState> {
  private readonly logger = new Logger(GoEngine.name);

  getMetadata(): GameMetadata {
    return {
      gameId: 'go_v1',
      name: 'Go',
      minPlayers: 2,
      maxPlayers: 2,
      version: '1.0.0',
      description:
        'Classic Go on 9×9, 13×13 or 19×19 boards with captures, ko rule and area scoring',
      category: 'Board Game',
    };
  }

  initializeState(playerIds: string[], config?: InitializeConfig): GoState {
    const raw = (config?.options ?? {}) as Partial<{
      boardSize: number;
      variant: string;
      aiDifficulty: string;
    }>;
    const boardSize = (BOARD_SIZES as readonly number[]).includes(
      Number(raw.boardSize),
    )
      ? (Number(raw.boardSize) as BoardSize)
      : DEFAULT_OPTIONS.boardSize;

    const options = {
      ...DEFAULT_OPTIONS,
      ...config?.options,
      boardSize,
    };

    // Black moves first in Go — fairness comes from randomly assigning colors.
    const orderedPlayerIds = shuffleInPlace([...playerIds]);
    const players: GoPlayer[] = orderedPlayerIds.map((id, idx) => ({
      playerId: id,
      color: idx === 0 ? 'black' : 'white',
      alive: true,
    }));

    return {
      phase: GAME_PHASE.PLAYING,
      options,
      boardSize,
      board: Array.from({ length: boardSize }, () =>
        Array.from({ length: boardSize }, () => null),
      ),
      players,
      captures: { black: 0, white: 0 },
      consecutivePasses: 0,
      koPoint: null,
      lastMove: null,
      playerOrder: orderedPlayerIds,
      currentTurnIndex: 0,
      winnerId: null,
      isDraw: false,
      scores: null,
      logs: [
        this.createLogEntry('system', 'Go game started. Black plays first.'),
      ],
    };
  }

  validateConfig(config: Record<string, unknown>): boolean {
    const options = config?.options as Record<string, unknown> | undefined;
    if (!options) return true;
    if (
      options.boardSize !== undefined &&
      !(BOARD_SIZES as readonly number[]).includes(Number(options.boardSize))
    ) {
      return false;
    }
    return true;
  }

  validateAction(
    state: GoState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    if (!isKnownAction(action)) return false;
    if (action === ACTION.PLACE_STONE) {
      return validatePlaceStone(state, payload, context.userId).ok;
    }
    if (action === ACTION.PASS_TURN) {
      return validatePassTurn(state, context.userId).ok;
    }
    if (action === ACTION.FORFEIT) {
      return validateForfeit(state, context.userId).ok;
    }
    return false;
  }

  executeAction(
    state: GoState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<GoState> {
    let result: GameActionResult<GoState>;
    if (action === ACTION.PLACE_STONE) {
      result = this.executePlaceStone(
        state,
        context,
        payload as PlaceStonePayload,
      );
    } else if (action === ACTION.PASS_TURN) {
      result = this.executePass(state, context);
    } else if (action === ACTION.FORFEIT) {
      result = this.executeForfeit(state, context);
    } else {
      result = this.errorResult(`Unknown action: ${action}`);
    }
    return result;
  }

  isGameOver(state: GoState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: GoState): string[] {
    if (!state.winnerId) return [];
    return [state.winnerId];
  }

  getResult(state: GoState): { winnerIds: string[]; isDraw: boolean } {
    if (!this.isGameOver(state)) return { winnerIds: [], isDraw: false };
    return { winnerIds: this.getWinners(state), isDraw: state.isDraw };
  }

  sanitizeStateForPlayer(state: GoState): Partial<GoState> {
    return state;
  }

  getAvailableActions(state: GoState, playerId: string): string[] {
    if (state.phase !== GAME_PHASE.PLAYING) return [];
    const player = state.players.find((p) => p.playerId === playerId);
    if (!player?.alive) return [];
    const currentId = state.playerOrder[state.currentTurnIndex];
    // Resignation is legal at any time, not only on the mover's turn.
    return currentId === playerId
      ? [ACTION.PLACE_STONE, ACTION.PASS_TURN, ACTION.FORFEIT]
      : [ACTION.FORFEIT];
  }

  private colorOf(state: GoState, userId: string): StoneColor | null {
    return state.players.find((p) => p.playerId === userId)?.color ?? null;
  }

  private executePlaceStone(
    state: GoState,
    context: GameActionContext,
    payload: PlaceStonePayload,
  ): GameActionResult<GoState> {
    const validation = validatePlaceStone(state, payload, context.userId);
    if (!validation.ok) return this.errorResult(validation.error);

    const newState = this.cloneState(state);
    const color = this.colorOf(newState, context.userId);
    if (!color) return this.errorResult('Player not found');

    const outcome = applyMove(newState.board, color, payload.row, payload.col);
    newState.board = outcome.board;
    newState.captures[color] += outcome.capturedStones.length;

    const capturedLabel =
      outcome.capturedStones.length > 0
        ? ` — captured ${outcome.capturedStones.length}`
        : '';
    newState.logs.push(
      this.createLogEntry(
        'action',
        `${COLOR_LABEL[color]} played ${coordinateLabel(newState.boardSize, payload.row, payload.col)}${capturedLabel}.`,
        { senderId: context.userId },
      ),
    );

    newState.lastMove = { row: payload.row, col: payload.col };
    newState.koPoint = outcome.koPoint;
    newState.consecutivePasses = 0;
    this.advanceGoTurn(newState);
    return this.successResult(newState);
  }

  private executePass(
    state: GoState,
    context: GameActionContext,
  ): GameActionResult<GoState> {
    const validation = validatePassTurn(state, context.userId);
    if (!validation.ok) return this.errorResult(validation.error);

    const newState = this.cloneState(state);
    const color = this.colorOf(newState, context.userId);
    newState.logs.push(
      this.createLogEntry(
        'action',
        `${COLOR_LABEL[color ?? 'black']} passed.`,
        { senderId: context.userId },
      ),
    );

    newState.consecutivePasses += 1;
    newState.lastMove = null;
    newState.koPoint = null;

    if (newState.consecutivePasses >= 2) {
      this.finishByScoring(newState);
      return this.successResult(newState);
    }

    this.advanceGoTurn(newState);
    return this.successResult(newState);
  }

  private executeForfeit(
    state: GoState,
    context: GameActionContext,
  ): GameActionResult<GoState> {
    const validation = validateForfeit(state, context.userId);
    if (!validation.ok) return this.errorResult(validation.error);

    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === context.userId);
    if (player) player.alive = false;
    const opponent = newState.players.find(
      (p) => p.playerId !== context.userId,
    );
    newState.winnerId = opponent?.playerId ?? null;
    newState.isDraw = false;
    newState.phase = GAME_PHASE.GAME_OVER;
    newState.logs.push(
      this.createLogEntry(
        'system',
        `${COLOR_LABEL[player?.color ?? 'black']} resigned.`,
      ),
    );
    return this.successResult(newState);
  }

  private finishByScoring(state: GoState): void {
    const scores = scoreBoard(state.board, KOMI);
    state.scores = scores;
    state.phase = GAME_PHASE.GAME_OVER;

    if (scores.black === scores.white) {
      state.isDraw = true;
      state.winnerId = null;
      state.logs.push(
        this.createLogEntry(
          'system',
          `Both players passed. Draw — ${scores.black} to ${scores.white}.`,
        ),
      );
      return;
    }

    const blackPlayer = state.players.find((p) => p.color === 'black');
    const whitePlayer = state.players.find((p) => p.color === 'white');
    const winnerIsBlack = scores.black > scores.white;
    state.winnerId = winnerIsBlack
      ? (blackPlayer?.playerId ?? null)
      : (whitePlayer?.playerId ?? null);
    state.logs.push(
      this.createLogEntry(
        'system',
        `Both players passed. Final score — Black ${scores.black}, White ${scores.white}.`,
      ),
    );
  }

  /** Two players alternate; both stay alive until a forfeit ends the game. */
  private advanceGoTurn(state: GoState): void {
    state.currentTurnIndex =
      (state.currentTurnIndex + 1) % state.playerOrder.length;
  }
}

/** GTP-style coordinate label (A–T skipping I, 1-based row from bottom). */
export function coordinateLabel(
  size: number,
  row: number,
  col: number,
): string {
  const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
  const letter = letters[col] ?? '?';
  const number = size - row;
  return `${letter}${number}`;
}
