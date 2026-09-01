import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import {
  ACTION,
  CHECKERS_PER_MODE,
  DEFAULT_OPTIONS,
  GAME_PHASE,
} from './backgammon.constants';
import type {
  BackgammonPlayer,
  BackgammonState,
  InitializeConfig,
  MoveCheckerPayload,
} from './backgammon.types';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../../base/game-engine.interface';
import {
  calculatePipCount,
  createInitialPoints,
  determineWinType,
  getAllLegalMoves,
} from './backgammon.utils';
import {
  validateForfeit,
  validateMoveChecker,
  validatePassTurn,
  validateRollDice,
} from './backgammon.validators';
import { validateBackgammonConfig } from './backgammon.config';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

/** Source of dice rolls. Injected so tests can force deterministic rolls — the payload is NEVER trusted for randomness (anti-cheat). */
export type DiceRoller = () => [number, number];

const randomDiceRoller: DiceRoller = () => [randomInt(1, 7), randomInt(1, 7)];
export class BackgammonEngine extends BaseGameEngine<BackgammonState> {
  private readonly logger = createLogger('BackgammonEngine');
  private readonly rollDicePair: DiceRoller;

  /** @param diceRoller optional test-only randomness source; Nest DI leaves it undefined (see @Optional). */
  constructor(diceRoller?: DiceRoller) {
    super();
    this.rollDicePair = diceRoller ?? randomDiceRoller;
  }

  getMetadata(): GameMetadata {
    return {
      gameId: 'backgammon_v1',
      name: 'Backgammon',
      minPlayers: 2,
      maxPlayers: 2,
      version: '1.1.0',
      description:
        'Classic board game with dice rolls, bearing off, and bar hits',
      category: 'Board Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: InitializeConfig,
  ): BackgammonState {
    const options = { ...DEFAULT_OPTIONS, ...(config?.options ?? {}) };
    const player0Id = playerIds[0];
    const player1Id = playerIds[1];

    const points = createInitialPoints(
      player0Id,
      player1Id,
      options.mode,
    );

    const players: BackgammonPlayer[] = [
      {
        playerId: player0Id,
        color: 'white',
        bar: 0,
        borneOff: 0,
        pipCount: calculatePipCount(player0Id, playerIds, points, 0),
        alive: true,
      },
      {
        playerId: player1Id,
        color: 'black',
        bar: 0,
        borneOff: 0,
        pipCount: calculatePipCount(player1Id, playerIds, points, 0),
        alive: true,
      },
    ];

    return {
      phase: GAME_PHASE.ROLL,
      options,
      points,
      bar: {
        [player0Id]: 0,
        [player1Id]: 0,
      },
      borneOff: {
        [player0Id]: 0,
        [player1Id]: 0,
      },
      dice: [],
      rolledDice: null,
      // Fairness: randomize who moves first instead of always player 0.
      currentTurnIndex: randomInt(0, 2),
      playerOrder: [...playerIds],
      players,
      winnerId: null,
      winType: null,
      isDraw: false,
      logs: [this.createLogEntry('system', 'Backgammon game started.')],
    };
  }

  validateConfig(config: Record<string, unknown>): boolean {
    return validateBackgammonConfig(config);
  }

  validateAction(
    state: BackgammonState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    if (action === ACTION.ROLL_DICE) {
      return validateRollDice(state, context).ok;
    }
    if (action === ACTION.MOVE_CHECKER) {
      return validateMoveChecker(state, context, payload).ok;
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
    state: BackgammonState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<BackgammonState> {
    const newState: BackgammonState = {
      ...state,
      points: state.points.map((p) => ({ ...p })),
      bar: { ...state.bar },
      borneOff: { ...state.borneOff },
      dice: [...state.dice],
      playerOrder: [...state.playerOrder],
      players: state.players.map((p) => ({ ...p })),
      logs: [...state.logs],
    };

    if (action === ACTION.ROLL_DICE) {
      // Dice come exclusively from the injected roller — never from the
      // client payload (anti-cheat: clients must not influence randomness).
      const [d1, d2] = this.rollDicePair();

      const rolledDice: [number, number] = [d1, d2];
      const dice = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

      newState.rolledDice = rolledDice;
      newState.dice = dice;

      const legalMoves = getAllLegalMoves(
        context.userId,
        newState.playerOrder,
        newState.points,
        newState.bar,
        newState.borneOff,
        dice,
        newState.options.mode,
      );

      newState.logs.push(
        this.createLogEntry('action', `Player rolled [${d1}, ${d2}].`, {
          senderId: context.userId,
        }),
      );

      if (legalMoves.length === 0) {
        newState.logs.push(
          this.createLogEntry(
            'system',
            'No legal moves available. Turn passes to opponent.',
          ),
        );
        newState.currentTurnIndex = (newState.currentTurnIndex + 1) % 2;
        newState.dice = [];
        newState.phase = GAME_PHASE.ROLL;
      } else {
        newState.phase = GAME_PHASE.MOVE;
      }

      return this.successResult(newState);
    }

    if (action === ACTION.MOVE_CHECKER) {
      const p = payload as MoveCheckerPayload;
      const playerId = context.userId;
      const opponentId = newState.playerOrder.find((id) => id !== playerId)!;

      const matchedMoves = getAllLegalMoves(
        playerId,
        newState.playerOrder,
        newState.points,
        newState.bar,
        newState.borneOff,
        newState.dice,
        newState.options.mode,
      ).filter((m) => m.from === p.from && m.to === p.to);

      matchedMoves.sort((a, b) => a.die - b.die);
      const chosenMove = matchedMoves[0];

      const dieIndex = newState.dice.indexOf(chosenMove.die);
      if (dieIndex !== -1) {
        newState.dice.splice(dieIndex, 1);
      }

      if (p.from === 'bar') {
        newState.bar[playerId] = Math.max(0, (newState.bar[playerId] ?? 0) - 1);
      } else {
        const fromPoint = newState.points[p.from];
        fromPoint.count = Math.max(0, fromPoint.count - 1);
        if (fromPoint.count === 0) {
          fromPoint.playerId = null;
        }
      }

      if (p.to === 'off') {
        newState.borneOff[playerId] = (newState.borneOff[playerId] ?? 0) + 1;
      } else {
        const toPoint = newState.points[p.to];
        if (toPoint.playerId && toPoint.playerId !== playerId) {
          newState.bar[opponentId] = (newState.bar[opponentId] ?? 0) + 1;
          toPoint.playerId = playerId;
          toPoint.count = 1;
        } else {
          toPoint.playerId = playerId;
          toPoint.count += 1;
        }
      }

      for (const pl of newState.players) {
        pl.bar = newState.bar[pl.playerId] ?? 0;
        pl.borneOff = newState.borneOff[pl.playerId] ?? 0;
        pl.pipCount = calculatePipCount(
          pl.playerId,
          newState.playerOrder,
          newState.points,
          pl.bar,
        );
      }

      newState.logs.push(
        this.createLogEntry(
          'action',
          `Moved checker from ${p.from} to ${p.to}.`,
          { senderId: playerId },
        ),
      );

      const targetCheckers =
        CHECKERS_PER_MODE[newState.options.mode] ?? 15;
      if ((newState.borneOff[playerId] ?? 0) >= targetCheckers) {
        newState.phase = GAME_PHASE.GAME_OVER;
        newState.winnerId = playerId;
        newState.winType = determineWinType(
          playerId,
          newState.playerOrder,
          newState.points,
          newState.bar,
          newState.borneOff,
        );
        newState.logs.push(
          this.createLogEntry(
            'system',
            `Game over! Win type: ${newState.winType}.`,
          ),
        );
        return this.successResult(newState);
      }

      const remainingLegalMoves = getAllLegalMoves(
        playerId,
        newState.playerOrder,
        newState.points,
        newState.bar,
        newState.borneOff,
        newState.dice,
        newState.options.mode,
      );

      if (newState.dice.length === 0 || remainingLegalMoves.length === 0) {
        newState.currentTurnIndex = (newState.currentTurnIndex + 1) % 2;
        newState.dice = [];
        newState.phase = GAME_PHASE.ROLL;
      }

      return this.successResult(newState);
    }

    if (action === ACTION.PASS_TURN) {
      const passCheck = validatePassTurn(newState, context);
      if (!passCheck.ok) return this.errorResult(passCheck.error);

      newState.currentTurnIndex = (newState.currentTurnIndex + 1) % 2;
      newState.dice = [];
      newState.phase = GAME_PHASE.ROLL;
      newState.logs.push(
        this.createLogEntry('action', 'No legal moves — turn passed.', {
          senderId: context.userId,
        }),
      );
      return this.successResult(newState);
    }

    if (action === ACTION.FORFEIT) {
      const forfeitingPlayerId = context.userId;
      const winnerId =
        newState.playerOrder.find((id) => id !== forfeitingPlayerId) ?? null;

      newState.phase = GAME_PHASE.GAME_OVER;
      newState.winnerId = winnerId;
      newState.winType = 'single';
      newState.logs.push(
        this.createLogEntry('action', 'Player forfeited the match.', {
          senderId: forfeitingPlayerId,
        }),
      );
      return this.successResult(newState);
    }

    return this.errorResult('Unknown action');
  }

  isGameOver(state: BackgammonState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: BackgammonState): string[] {
    return state.winnerId ? [state.winnerId] : [];
  }

  getAvailableActions(state: BackgammonState, playerId: string): string[] {
    if (this.isGameOver(state)) return [];
    const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
    if (currentTurnPlayerId !== playerId) return [ACTION.FORFEIT];

    if (state.phase === GAME_PHASE.ROLL) {
      return [ACTION.ROLL_DICE, ACTION.FORFEIT];
    }
    if (state.phase === GAME_PHASE.MOVE) {
      const remainingLegalMoves = getAllLegalMoves(
        playerId,
        state.playerOrder,
        state.points,
        state.bar,
        state.borneOff,
        state.dice,
        state.options.mode,
      );
      if (remainingLegalMoves.length === 0) {
        return [ACTION.PASS_TURN, ACTION.FORFEIT];
      }
      return [ACTION.MOVE_CHECKER, ACTION.FORFEIT];
    }
    return [ACTION.FORFEIT];
  }

  sanitizeStateForPlayer(
    state: BackgammonState,
    _playerId?: string,
  ): BackgammonState {
    return state;
  }
}
