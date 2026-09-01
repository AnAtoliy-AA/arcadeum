import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import {
  ACTION,
  DEFAULT_OPTIONS,
  GAME_PHASE,
  SEAT_COLORS,
} from './pachisi.constants';
import type {
  InitializeConfig,
  MoveTokenPayload,
  PachisiPlayer,
  PachisiState,
  PachisiToken,
} from './pachisi.types';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../../base/game-engine.interface';
import {
  assignSeats,
  computeMoveOutcome,
  countFinished,
  getAllLegalMoves,
  tokensPerVariant,
} from './pachisi.utils';
import {
  validateForfeit,
  validateMoveToken,
  validatePassTurn,
  validateRollDice,
} from './pachisi.validators';
import { validatePachisiConfig } from './pachisi.config';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

/** Source of die rolls. Injected so tests can force deterministic rolls — the payload is NEVER trusted for randomness (anti-cheat). */
export type DiceRoller = () => number;

const randomDieRoller: DiceRoller = () => randomInt(1, 7);
export class PachisiEngine extends BaseGameEngine<PachisiState> {
  private readonly logger = createLogger('PachisiEngine');
  private readonly rollDie: DiceRoller;

  /** @param diceRoller optional test-only randomness source; Nest DI leaves it undefined (see @Optional). */
  constructor(diceRoller?: DiceRoller) {
    super();
    this.rollDie = diceRoller ?? randomDieRoller;
  }

  getMetadata(): GameMetadata {
    return {
      gameId: 'pachisi_v1',
      name: 'Pachisi',
      minPlayers: 2,
      maxPlayers: 4,
      version: '1.0.0',
      description:
        'Classic cross-and-circle race game — roll a six, capture rivals, and bring all your tokens home',
      category: 'Board Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: InitializeConfig,
  ): PachisiState {
    const options = { ...DEFAULT_OPTIONS, ...(config?.options ?? {}) };
    const seats = assignSeats(playerIds);
    const tokenCount = tokensPerVariant(options.mode);

    const players: PachisiPlayer[] = playerIds.map((playerId) => ({
      playerId,
      seat: seats[playerId],
      color: SEAT_COLORS[seats[playerId]],
      alive: true,
    }));

    const tokens: Record<string, PachisiToken[]> = {};
    for (const playerId of playerIds) {
      tokens[playerId] = Array.from({ length: tokenCount }, (_, id) => ({
        id,
        progress: -1,
      }));
    }

    return {
      phase: GAME_PHASE.ROLL,
      options,
      seats,
      tokens,
      die: null,
      consecutiveSixes: 0,
      // Fairness: randomize who moves first instead of always player 0.
      currentTurnIndex: randomInt(0, playerIds.length),
      playerOrder: [...playerIds],
      players,
      winnerId: null,
      winnerIds: [],
      isDraw: false,
      logs: [this.createLogEntry('system', 'Pachisi game started.')],
    };
  }

  validateConfig(config: Record<string, unknown>): boolean {
    return validatePachisiConfig(config);
  }

  validateAction(
    state: PachisiState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    if (action === ACTION.ROLL_DICE) {
      return validateRollDice(state, context).ok;
    }
    if (action === ACTION.MOVE_TOKEN) {
      return validateMoveToken(state, context, payload).ok;
    }
    if (action === ACTION.PASS_TURN) {
      return validatePassTurn(state, context).ok;
    }
    if (action === ACTION.FORFEIT) {
      return validateForfeit(state, context).ok;
    }
    return false;
  }

  executeAction(
    state: PachisiState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<PachisiState> {
    const newState: PachisiState = this.cloneShallow(state);

    if (action === ACTION.ROLL_DICE) {
      // Die comes exclusively from the injected roller — never from the
      // client payload (anti-cheat: clients must not influence randomness).
      const d = this.rollDie();

      newState.logs.push(
        this.createLogEntry('action', `Player rolled a ${d}.`, {
          senderId: context.userId,
        }),
      );

      if (d === 6) {
        newState.consecutiveSixes += 1;
        if (newState.consecutiveSixes >= 3) {
          newState.logs.push(
            this.createLogEntry(
              'system',
              'Three sixes in a row — turn forfeited.',
            ),
          );
          return this.endTurn(newState);
        }
      } else {
        newState.consecutiveSixes = 0;
      }

      newState.die = d;

      const legalMoves = getAllLegalMoves(newState, context.userId);
      if (legalMoves.length === 0) {
        newState.logs.push(
          this.createLogEntry(
            'system',
            'No legal moves available. Turn passes.',
          ),
        );
        return this.endTurn(newState);
      }

      newState.phase = GAME_PHASE.MOVE;
      return this.successResult(newState);
    }

    if (action === ACTION.MOVE_TOKEN) {
      const check = validateMoveToken(newState, context, payload);
      if (!check.ok) return this.errorResult(check.error);

      const p = payload as MoveTokenPayload;
      const outcome = computeMoveOutcome(newState, context.userId, p.tokenId);
      if (!outcome)
        return this.errorResult('Illegal move for current die roll');

      const moverTokens = newState.tokens[context.userId];
      const movedToken = moverTokens.find((t) => t.id === p.tokenId)!;
      movedToken.progress = outcome.targetProgress;

      for (const { ownerId, tokenId } of outcome.captured) {
        const victim = newState.tokens[ownerId]?.find((t) => t.id === tokenId);
        if (victim) victim.progress = -1;
      }
      if (outcome.captured.length > 0) {
        newState.logs.push(
          this.createLogEntry(
            'action',
            `Captured ${outcome.captured.length} opponent token(s)!`,
            { senderId: context.userId },
          ),
        );
      }

      const finishedCount = countFinished(moverTokens);
      newState.logs.push(
        this.createLogEntry(
          'action',
          `Moved token to position ${movedToken.progress}. (${finishedCount}/${tokensPerVariant(newState.options.mode)} home)`,
          { senderId: context.userId },
        ),
      );

      if (finishedCount >= tokensPerVariant(newState.options.mode)) {
        newState.phase = GAME_PHASE.GAME_OVER;
        newState.winnerId = context.userId;
        newState.winnerIds = [context.userId];
        newState.die = null;
        newState.consecutiveSixes = 0;
        newState.logs.push(
          this.createLogEntry('system', 'Game over! All tokens are home.'),
        );
        return this.successResult(newState);
      }

      // Rolled a six → same player rolls again (extra roll).
      if (newState.die === 6) {
        newState.die = null;
        newState.phase = GAME_PHASE.ROLL;
        return this.successResult(newState);
      }

      return this.endTurn(newState);
    }

    if (action === ACTION.PASS_TURN) {
      const passCheck = validatePassTurn(newState, context);
      if (!passCheck.ok) return this.errorResult(passCheck.error);

      newState.logs.push(
        this.createLogEntry('action', 'No legal moves — turn passed.', {
          senderId: context.userId,
        }),
      );
      return this.endTurn(newState);
    }

    if (action === ACTION.FORFEIT) {
      const forfeitingPlayerId = context.userId;
      // Multi-player forfeit: end the match and award ALL remaining players
      // (mirrors hearts.engine.ts) instead of crowning one arbitrary player.
      const winnerIds =
        newState.playerOrder.filter((id) => id !== forfeitingPlayerId) ?? [];

      newState.phase = GAME_PHASE.GAME_OVER;
      newState.winnerIds = winnerIds;
      newState.winnerId = winnerIds[0] ?? null;
      newState.die = null;
      newState.consecutiveSixes = 0;
      newState.logs.push(
        this.createLogEntry('action', 'Player forfeited the match.', {
          senderId: forfeitingPlayerId,
        }),
      );
      return this.successResult(newState);
    }

    return this.errorResult('Unknown action');
  }

  isGameOver(state: PachisiState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: PachisiState): string[] {
    return state.winnerIds ?? (state.winnerId ? [state.winnerId] : []);
  }

  getAvailableActions(state: PachisiState, playerId: string): string[] {
    if (this.isGameOver(state)) return [];
    const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
    if (currentTurnPlayerId !== playerId) return [ACTION.FORFEIT];

    if (state.phase === GAME_PHASE.ROLL) {
      return [ACTION.ROLL_DICE, ACTION.FORFEIT];
    }
    if (state.phase === GAME_PHASE.MOVE) {
      const remainingLegalMoves = getAllLegalMoves(state, playerId);
      if (remainingLegalMoves.length === 0) {
        return [ACTION.PASS_TURN, ACTION.FORFEIT];
      }
      return [ACTION.MOVE_TOKEN, ACTION.FORFEIT];
    }
    return [ACTION.FORFEIT];
  }

  sanitizeStateForPlayer(
    state: PachisiState,
    _playerId?: string,
  ): PachisiState {
    return state;
  }

  private endTurn(state: PachisiState): GameActionResult<PachisiState> {
    state.die = null;
    state.consecutiveSixes = 0;
    state.currentTurnIndex =
      (state.currentTurnIndex + 1) % state.playerOrder.length;
    state.phase = GAME_PHASE.ROLL;
    return this.successResult(state);
  }

  private cloneShallow(state: PachisiState): PachisiState {
    return {
      ...state,
      options: { ...state.options },
      seats: { ...state.seats },
      tokens: Object.fromEntries(
        Object.entries(state.tokens).map(([pid, toks]) => [
          pid,
          toks.map((t) => ({ ...t })),
        ]),
      ),
      playerOrder: [...state.playerOrder],
      players: state.players.map((p) => ({ ...p })),
      winnerIds: [...state.winnerIds],
      logs: [...state.logs],
    };
  }
}
