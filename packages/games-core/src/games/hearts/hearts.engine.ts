import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../../base/game-engine.interface';
import {
  ACTION,
  CARDS_PER_PASS,
  DEFAULT_OPTIONS,
  GAME_PHASE,
  HAND_SIZE,
  MIN_PLAYERS,
  MAX_PLAYERS,
} from './hearts.constants';
import type { HeartsOptions, Suit } from './hearts.constants';
import type {
  HeartsState,
  InitializeConfig,
  PassCardsPayload,
  PlayCardPayload,
} from './hearts.types';
import {
  holderOfTwoClubs,
  makeDeck,
  passDirectionForHand,
  pointsInCards,
  receiverIndexOf,
  shootTheMoonShooter,
  sortHand,
  trickWinnerId,
  type DeckShuffler,
} from './hearts.utils';
import {
  validateForfeit,
  validatePassCards,
  validatePlayCard,
} from './hearts.validators';
import { validateHeartsOptions } from './hearts.config';

/** Default server-side shuffle (never trust client RNG). */
const defaultShuffler: DeckShuffler = <T>(cards: T[]): T[] => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};
export class HeartsEngine extends BaseGameEngine<HeartsState> {
  private readonly logger = createLogger('HeartsEngine');
  private readonly shuffler: DeckShuffler;

  /** @param shuffler optional test-only shuffle source; Nest DI leaves it undefined (see @Optional). */
  constructor(shuffler?: DeckShuffler) {
    super();
    this.shuffler = shuffler ?? defaultShuffler;
  }

  getMetadata(): GameMetadata {
    return {
      gameId: 'hearts_v1',
      name: 'Hearts',
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      version: '1.0.0',
      description:
        'Avoid hearts and the Queen of Spades in this classic 4-player trick-taking game',
      category: 'Card Game',
    };
  }

  validateConfig(config: Record<string, unknown>): boolean {
    return validateHeartsOptions(config);
  }

  initializeState(playerIds: string[], config?: InitializeConfig): HeartsState {
    if (playerIds.length !== 4) {
      throw new Error('Hearts requires exactly 4 players');
    }
    const options: HeartsOptions = {
      ...DEFAULT_OPTIONS,
      ...(config?.options ?? {}),
    };
    const state = this.blankState(playerIds, options, 0);
    this.dealHand(state);
    return state;
  }

  validateAction(
    state: HeartsState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    switch (action) {
      case ACTION.PASS_CARDS:
        return validatePassCards(state, context.userId, payload).ok;
      case ACTION.PLAY_CARD:
        return validatePlayCard(state, context.userId, payload).ok;
      case ACTION.FORFEIT:
        return validateForfeit(state, context.userId).ok;
      default:
        return false;
    }
  }

  executeAction(
    state: HeartsState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<HeartsState> {
    const newState = this.cloneState(state);
    switch (action) {
      case ACTION.PASS_CARDS:
        return this.executePassCards(newState, context, payload);
      case ACTION.PLAY_CARD:
        return this.executePlayCard(newState, context, payload);
      case ACTION.FORFEIT:
        return this.executeForfeit(newState, context);
      default:
        return this.errorResult('Unknown action');
    }
  }

  isGameOver(state: HeartsState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: HeartsState): string[] {
    return state.winnerIds ?? [];
  }

  getResult(state: HeartsState) {
    if (!this.isGameOver(state)) {
      return { winnerIds: [], isDraw: false };
    }
    return { winnerIds: state.winnerIds ?? [], isDraw: state.isDraw };
  }

  getAvailableActions(state: HeartsState, playerId: string): string[] {
    if (this.isGameOver(state)) return [];
    const actions: string[] = [ACTION.FORFEIT];
    if (
      state.phase === GAME_PHASE.PASSING &&
      state.options.passingEnabled &&
      !state.pendingPasses[playerId]?.length
    ) {
      actions.unshift(ACTION.PASS_CARDS);
    }
    if (
      state.phase === GAME_PHASE.PLAYING &&
      state.playerOrder[state.currentTurnIndex] === playerId
    ) {
      actions.unshift(ACTION.PLAY_CARD);
    }
    return actions;
  }

  sanitizeStateForPlayer(state: HeartsState, playerId: string): HeartsState {
    const clone = this.cloneState(state);
    for (const [pid, hand] of Object.entries(clone.hands)) {
      if (pid !== playerId) {
        clone.hands[pid] = hand.map(() => '??');
      }
    }
    for (const [pid, cards] of Object.entries(clone.pendingPasses)) {
      if (pid !== playerId) {
        clone.pendingPasses[pid] = cards.map(() => '??');
      }
    }
    return clone;
  }

  // ------------------------------------------------------------------ private

  private blankState(
    playerIds: string[],
    options: HeartsOptions,
    handNumber: number,
  ): HeartsState {
    const hands: Record<string, string[]> = {};
    const taken: Record<string, string[]> = {};
    const pendingPasses: Record<string, string[]> = {};
    const scores: Record<string, number> = {};
    const handScores: Record<string, number> = {};
    for (const id of playerIds) {
      hands[id] = [];
      taken[id] = [];
      pendingPasses[id] = [];
      scores[id] = 0;
      handScores[id] = 0;
    }
    return {
      phase: GAME_PHASE.PASSING,
      options,
      handNumber,
      passDirection: passDirectionForHand(handNumber),
      hands,
      taken,
      pendingPasses,
      scores,
      handScores,
      currentTrick: { plays: [], leadSuit: null },
      currentTurnIndex: 0,
      playerOrder: [...playerIds],
      players: playerIds.map((playerId) => ({ playerId })),
      heartsBroken: false,
      winnerIds: null,
      winType: null,
      isDraw: false,
      logs: [],
    };
  }

  private dealHand(state: HeartsState): void {
    const deck = this.shuffler(makeDeck());
    state.playerOrder.forEach((id, idx) => {
      state.hands[id] = sortHand(
        deck.slice(idx * HAND_SIZE, (idx + 1) * HAND_SIZE),
      );
      state.taken[id] = [];
      state.pendingPasses[id] = [];
      state.handScores[id] = 0;
    });
    state.currentTrick = { plays: [], leadSuit: null };
    state.heartsBroken = false;
    state.passDirection = passDirectionForHand(state.handNumber);
    // Passing happens on left/right/across hands only — a hold hand deals
    // and plays immediately (standard Hearts rules).
    const passing =
      state.options.passingEnabled && state.passDirection !== 'hold';
    state.phase = passing ? GAME_PHASE.PASSING : GAME_PHASE.PLAYING;
    if (passing) {
      state.currentTurnIndex = 0;
    } else {
      const leaderIdx = holderOfTwoClubs(state.hands, state.playerOrder);
      state.currentTurnIndex = leaderIdx >= 0 ? leaderIdx : 0;
    }
  }

  private executePassCards(
    state: HeartsState,
    context: GameActionContext,
    payload: unknown,
  ): GameActionResult<HeartsState> {
    const check = validatePassCards(state, context.userId, payload);
    if (!check.ok) return this.errorResult(check.error ?? 'Invalid pass');
    const { cards } = payload as PassCardsPayload;

    state.hands[context.userId] = state.hands[context.userId].filter(
      (c) => !cards.includes(c),
    );
    state.pendingPasses[context.userId] = [...cards];
    this.addLog(
      state,
      this.createLogEntry('action', `${context.userId} passed 3 cards.`, {
        senderId: context.userId,
        kind: 'hearts.pass',
      }),
    );

    const allPassed = state.playerOrder.every(
      (id) => state.pendingPasses[id].length === CARDS_PER_PASS,
    );
    if (!allPassed) return this.successResult(state);

    // All four passes resolve simultaneously.
    state.playerOrder.forEach((senderId, idx) => {
      const receiverId =
        state.playerOrder[
          receiverIndexOf(idx, state.passDirection, state.playerOrder.length)
        ];
      state.hands[receiverId].push(...state.pendingPasses[senderId]);
    });
    for (const id of state.playerOrder) {
      state.hands[id] = sortHand(state.hands[id]);
      state.pendingPasses[id] = [];
    }

    state.phase = GAME_PHASE.PLAYING;
    const leaderIdx = holderOfTwoClubs(state.hands, state.playerOrder);
    state.currentTurnIndex = leaderIdx >= 0 ? leaderIdx : 0;
    this.addLog(
      state,
      this.createLogEntry(
        'system',
        `Hand ${state.handNumber + 1} begins — ${state.playerOrder[state.currentTurnIndex]} leads with the 2♣.`,
        { kind: 'hearts.hand_start' },
      ),
    );
    return this.successResult(state);
  }

  private executePlayCard(
    state: HeartsState,
    context: GameActionContext,
    payload: unknown,
  ): GameActionResult<HeartsState> {
    const check = validatePlayCard(state, context.userId, payload);
    if (!check.ok) return this.errorResult(check.error ?? 'Invalid play');
    const { card } = payload as PlayCardPayload;

    state.hands[context.userId] = state.hands[context.userId].filter(
      (c) => c !== card,
    );
    if (state.currentTrick.plays.length === 0) {
      state.currentTrick.leadSuit = card.slice(-1) as Suit;
    }
    state.currentTrick.plays.push({ playerId: context.userId, card });

    let logMessage = `${context.userId} played ${card}.`;
    if (card.endsWith('H') && !state.heartsBroken) {
      logMessage = `${context.userId} played ${card} — hearts are broken!`;
    }
    if (card.endsWith('H')) {
      state.heartsBroken = true;
    }
    this.addLog(
      state,
      this.createLogEntry('action', logMessage, {
        senderId: context.userId,
        kind: 'hearts.play',
      }),
    );

    if (state.currentTrick.plays.length === 4) {
      return this.completeTrick(state);
    }
    state.currentTurnIndex =
      (state.currentTurnIndex + 1) % state.playerOrder.length;
    return this.successResult(state);
  }

  private completeTrick(state: HeartsState): GameActionResult<HeartsState> {
    const winnerId = trickWinnerId(state.currentTrick.plays);
    const trickCards = state.currentTrick.plays.map((p) => p.card);
    if (winnerId && state.taken[winnerId]) {
      state.taken[winnerId].push(...trickCards);
    }
    this.addLog(
      state,
      this.createLogEntry('system', `${winnerId ?? '?'} took the trick.`, {
        kind: 'hearts.trick',
        targetId: winnerId ?? undefined,
      }),
    );
    state.currentTrick = { plays: [], leadSuit: null };

    const handEmpty = state.playerOrder.every(
      (id) => state.hands[id].length === 0,
    );
    if (handEmpty) {
      return this.completeHand(state);
    }
    const winnerIdx = winnerId ? state.playerOrder.indexOf(winnerId) : -1;
    if (winnerIdx >= 0) {
      state.currentTurnIndex = winnerIdx;
    }
    return this.successResult(state);
  }

  private completeHand(state: HeartsState): GameActionResult<HeartsState> {
    state.phase = GAME_PHASE.HAND_OVER;
    for (const id of state.playerOrder) {
      state.handScores[id] = pointsInCards(state.taken[id]);
    }
    const shooter = shootTheMoonShooter(state.handScores);
    if (shooter) {
      for (const id of state.playerOrder) {
        state.handScores[id] = id === shooter ? 0 : 26;
      }
      this.addLog(
        state,
        this.createLogEntry('system', `${shooter} shot the moon!`, {
          kind: 'hearts.moon',
          targetId: shooter,
        }),
      );
    }
    for (const id of state.playerOrder) {
      state.scores[id] += state.handScores[id];
    }

    const targetReached = state.playerOrder.some(
      (id) => state.scores[id] >= state.options.targetScore,
    );
    if (targetReached) {
      return this.finishGame(state, shooter);
    }

    state.handNumber += 1;
    this.dealHand(state);
    this.addLog(
      state,
      this.createLogEntry(
        'system',
        `Hand ${state.handNumber + 1} begins — pass direction: ${state.passDirection}.`,
        { kind: 'hearts.hand_start' },
      ),
    );
    return this.successResult(state);
  }

  private finishGame(
    state: HeartsState,
    shooter: string | null,
  ): GameActionResult<HeartsState> {
    const minScore = Math.min(
      ...state.playerOrder.map((id) => state.scores[id]),
    );
    const winners = state.playerOrder.filter(
      (id) => state.scores[id] === minScore,
    );
    state.phase = GAME_PHASE.GAME_OVER;
    state.winnerIds = winners;
    state.isDraw = winners.length > 1;
    state.winType =
      shooter !== null && winners.includes(shooter)
        ? 'shoot_the_moon'
        : 'standard';
    this.addLog(
      state,
      this.createLogEntry(
        'system',
        `Game over! Winner(s): ${winners.join(', ')} (${state.winType}).`,
        { kind: 'hearts.game_over' },
      ),
    );
    return this.successResult(state);
  }

  private executeForfeit(
    state: HeartsState,
    context: GameActionContext,
  ): GameActionResult<HeartsState> {
    const check = validateForfeit(state, context.userId);
    if (!check.ok) return this.errorResult(check.error ?? 'Invalid forfeit');
    state.phase = GAME_PHASE.GAME_OVER;
    state.winnerIds = state.playerOrder.filter((id) => id !== context.userId);
    state.isDraw = false;
    state.winType = 'standard';
    this.addLog(
      state,
      this.createLogEntry('system', `${context.userId} forfeited the match.`, {
        senderId: context.userId,
        kind: 'hearts.forfeit',
      }),
    );
    return this.successResult(state);
  }
}
