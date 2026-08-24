import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../../base/game-engine.interface';
import {
  ACTION,
  BAG_PENALTY_POINTS,
  BAG_PENALTY_THRESHOLD,
  DEFAULT_OPTIONS,
  GAME_PHASE,
  HAND_SIZE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  NIL_BID,
  NIL_FAILURE_PENALTY,
  NIL_SUCCESS_POINTS,
  POINTS_PER_TRICK_OF_BID,
} from './spades.constants';
import type { SpadesOptions, Suit, TeamSide } from './spades.constants';
import type {
  BidPayload,
  HandSummary,
  InitializeConfig,
  PlayCardPayload,
  SpadesState,
} from './spades.types';
import {
  isSpadeCard,
  makeDeck,
  sideOfPlayer,
  sortHand,
  teamMembers,
  trickWinnerId,
  type DeckShuffler,
} from './spades.utils';
import {
  validateBid,
  validateForfeit,
  validatePlayCard,
} from './spades.validators';
import { validateSpadesOptions } from './spades.config';

/** Default server-side shuffle (never trust client RNG). */
const defaultShuffler: DeckShuffler = <T>(cards: T[]): T[] => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};
export class SpadesEngine extends BaseGameEngine<SpadesState> {
  private readonly logger = createLogger('SpadesEngine');
  private readonly shuffler: DeckShuffler;

  /** @param shuffler optional test-only shuffle source; Nest DI leaves it undefined (see @Optional). */
  constructor(shuffler?: DeckShuffler) {
    super();
    this.shuffler = shuffler ?? defaultShuffler;
  }

  getMetadata(): GameMetadata {
    return {
      gameId: 'spades_v1',
      name: 'Spades',
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      version: '1.0.0',
      description:
        'Partner up, bid your tricks, and let spades trump in this classic 4-player card game',
      category: 'Card Game',
    };
  }

  validateConfig(config: Record<string, unknown>): boolean {
    return validateSpadesOptions(config);
  }

  initializeState(playerIds: string[], config?: InitializeConfig): SpadesState {
    if (playerIds.length !== 4) {
      throw new Error('Spades requires exactly 4 players');
    }
    const options: SpadesOptions = {
      ...DEFAULT_OPTIONS,
      ...(config?.options ?? {}),
    };
    const state = this.blankState(playerIds, options);
    this.dealHand(state);
    return state;
  }

  validateAction(
    state: SpadesState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    switch (action) {
      case ACTION.BID:
        return validateBid(state, context.userId, payload).ok;
      case ACTION.PLAY_CARD:
        return validatePlayCard(state, context.userId, payload).ok;
      case ACTION.FORFEIT:
        return validateForfeit(state, context.userId).ok;
      default:
        return false;
    }
  }

  executeAction(
    state: SpadesState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<SpadesState> {
    const newState = this.cloneState(state);
    switch (action) {
      case ACTION.BID:
        return this.executeBid(newState, context, payload);
      case ACTION.PLAY_CARD:
        return this.executePlayCard(newState, context, payload);
      case ACTION.FORFEIT:
        return this.executeForfeit(newState, context);
      default:
        return this.errorResult('Unknown action');
    }
  }

  isGameOver(state: SpadesState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: SpadesState): string[] {
    return state.winnerIds ?? [];
  }

  getResult(state: SpadesState) {
    if (!this.isGameOver(state)) {
      return { winnerIds: [], isDraw: false };
    }
    return { winnerIds: state.winnerIds ?? [], isDraw: state.isDraw };
  }

  getAvailableActions(state: SpadesState, playerId: string): string[] {
    if (this.isGameOver(state)) return [];
    const actions: string[] = [ACTION.FORFEIT];
    if (
      state.phase === GAME_PHASE.BIDDING &&
      state.playerOrder[state.currentTurnIndex] === playerId &&
      state.bids[playerId] == null
    ) {
      actions.unshift(ACTION.BID);
    }
    if (
      state.phase === GAME_PHASE.PLAYING &&
      state.playerOrder[state.currentTurnIndex] === playerId
    ) {
      actions.unshift(ACTION.PLAY_CARD);
    }
    return actions;
  }

  sanitizeStateForPlayer(state: SpadesState, playerId: string): SpadesState {
    const clone = this.cloneState(state);
    for (const [pid, hand] of Object.entries(clone.hands)) {
      if (pid !== playerId) {
        clone.hands[pid] = hand.map(() => '??');
      }
    }
    return clone;
  }

  // ------------------------------------------------------------------ private

  private blankState(playerIds: string[], options: SpadesOptions): SpadesState {
    const hands: Record<string, string[]> = {};
    const taken: Record<string, string[]> = {};
    const bids: Record<string, number | null> = {};
    const scores: Record<string, number> = {};
    const bags: Record<string, number> = {};
    for (const id of playerIds) {
      hands[id] = [];
      taken[id] = [];
      bids[id] = null;
      scores[id] = 0;
      bags[id] = 0;
    }
    return {
      phase: GAME_PHASE.BIDDING,
      options,
      handNumber: 0,
      hands,
      taken,
      bids,
      scores,
      bags,
      currentTrick: { plays: [], leadSuit: null },
      currentTurnIndex: 0,
      playerOrder: [...playerIds],
      players: playerIds.map((playerId) => ({ playerId })),
      spadesBroken: false,
      lastHandSummary: null,
      winnerIds: null,
      isDraw: false,
      logs: [],
    };
  }

  private dealHand(state: SpadesState): void {
    const deck = this.shuffler(makeDeck());
    state.playerOrder.forEach((id, idx) => {
      state.hands[id] = sortHand(
        deck.slice(idx * HAND_SIZE, (idx + 1) * HAND_SIZE),
      );
      state.taken[id] = [];
      state.bids[id] = null;
    });
    state.currentTrick = { plays: [], leadSuit: null };
    state.spadesBroken = false;
    state.phase = GAME_PHASE.BIDDING;
    // First bidder rotates every hand so the lead rotates with it.
    state.currentTurnIndex = state.handNumber % state.playerOrder.length;
  }

  private executeBid(
    state: SpadesState,
    context: GameActionContext,
    payload: unknown,
  ): GameActionResult<SpadesState> {
    const check = validateBid(state, context.userId, payload);
    if (!check.ok) return this.errorResult(check.error ?? 'Invalid bid');

    const { amount } = payload as BidPayload;
    state.bids[context.userId] = amount;
    this.addLog(
      state,
      this.createLogEntry(
        'action',
        amount === NIL_BID
          ? `${context.userId} bid Nil.`
          : `${context.userId} bid ${amount}.`,
        { senderId: context.userId, kind: 'spades.bid' },
      ),
    );

    const allBid = state.playerOrder.every((id) => state.bids[id] != null);
    if (!allBid) {
      state.currentTurnIndex =
        (state.currentTurnIndex + 1) % state.playerOrder.length;
      return this.successResult(state);
    }

    // Bidding started at `handNumber % 4`; that seat also leads the first
    // trick, so restore the index to the opening bidder.
    state.phase = GAME_PHASE.PLAYING;
    state.currentTurnIndex = state.handNumber % state.playerOrder.length;
    this.addLog(
      state,
      this.createLogEntry('system', 'All bids are in — play begins.', {
        kind: 'spades.hand_start',
      }),
    );
    return this.successResult(state);
  }

  private executePlayCard(
    state: SpadesState,
    context: GameActionContext,
    payload: unknown,
  ): GameActionResult<SpadesState> {
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
    if (isSpadeCard(card) && !state.spadesBroken) {
      logMessage = `${context.userId} played ${card} — spades are broken!`;
    }
    if (isSpadeCard(card)) {
      state.spadesBroken = true;
    }
    this.addLog(
      state,
      this.createLogEntry('action', logMessage, {
        senderId: context.userId,
        kind: 'spades.play',
      }),
    );

    if (state.currentTrick.plays.length === 4) {
      return this.completeTrick(state);
    }
    state.currentTurnIndex =
      (state.currentTurnIndex + 1) % state.playerOrder.length;
    return this.successResult(state);
  }

  private completeTrick(state: SpadesState): GameActionResult<SpadesState> {
    const winnerId = trickWinnerId(state.currentTrick.plays);
    const trickCards = state.currentTrick.plays.map((p) => p.card);
    if (winnerId && state.taken[winnerId]) {
      state.taken[winnerId].push(...trickCards);
    }
    this.addLog(
      state,
      this.createLogEntry('system', `${winnerId ?? '?'} took the trick.`, {
        kind: 'spades.trick',
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

  private completeHand(state: SpadesState): GameActionResult<SpadesState> {
    const sides: TeamSide[] = ['even', 'odd'];
    const summary: HandSummary = {
      handNumber: state.handNumber,
      teamBids: {},
      teamTricks: {},
      pointsDelta: {},
      nilResults: [],
    };

    for (const side of sides) {
      const members = teamMembers(state.playerOrder, side);
      const teamBid = members.reduce(
        (sum, id) => sum + Math.max(0, state.bids[id] ?? 0),
        0,
      );
      const teamTricks = Math.floor(
        members.reduce((sum, id) => sum + (state.taken[id]?.length ?? 0), 0) /
          4,
      );

      let points =
        teamTricks >= teamBid
          ? POINTS_PER_TRICK_OF_BID * teamBid + (teamTricks - teamBid)
          : -POINTS_PER_TRICK_OF_BID * teamBid;

      // Sandbagging: overtricks accumulate across hands; every time a team's
      // bag counter crosses the threshold they pay a fixed penalty.
      if (teamTricks > teamBid) {
        const key = members[0];
        let bags = (state.bags[key] ?? 0) + (teamTricks - teamBid);
        while (bags >= BAG_PENALTY_THRESHOLD) {
          bags -= BAG_PENALTY_THRESHOLD;
          points -= BAG_PENALTY_POINTS;
        }
        for (const id of members) {
          state.bags[id] = bags;
        }
      }

      // Nil bids resolve independently of the partnership result.
      for (const id of members) {
        if ((state.bids[id] ?? null) !== NIL_BID) continue;
        const success = (state.taken[id]?.length ?? 0) === 0;
        points += success ? NIL_SUCCESS_POINTS : -NIL_FAILURE_PENALTY;
        summary.nilResults.push({ playerId: id, success });
      }

      summary.teamBids[side] = teamBid;
      summary.teamTricks[side] = teamTricks;
      summary.pointsDelta[side] = points;
      for (const id of members) {
        state.scores[id] += points;
      }
    }

    state.lastHandSummary = summary;
    this.addLog(
      state,
      this.createLogEntry(
        'system',
        `Hand ${state.handNumber + 1} scored — even ${summary.pointsDelta.even >= 0 ? '+' : ''}${summary.pointsDelta.even}, odd ${summary.pointsDelta.odd >= 0 ? '+' : ''}${summary.pointsDelta.odd}.`,
        { kind: 'spades.hand_over' },
      ),
    );

    const targetReached = sides.some(
      (side) =>
        (state.scores[teamMembers(state.playerOrder, side)[0]] ?? 0) >=
        state.options.targetScore,
    );
    if (targetReached) {
      return this.finishGame(state, sides);
    }

    state.handNumber += 1;
    this.dealHand(state);
    this.addLog(
      state,
      this.createLogEntry(
        'system',
        `Hand ${state.handNumber + 1} begins — place your bids.`,
        { kind: 'spades.hand_start' },
      ),
    );
    return this.successResult(state);
  }

  private finishGame(
    state: SpadesState,
    sides: TeamSide[],
  ): GameActionResult<SpadesState> {
    const sideScore = (side: TeamSide) =>
      state.scores[teamMembers(state.playerOrder, side)[0]] ?? 0;
    const best = Math.max(...sides.map(sideScore));
    const winningSides = sides.filter((s) => sideScore(s) === best);
    const winners = winningSides.flatMap((s) =>
      teamMembers(state.playerOrder, s),
    );

    state.phase = GAME_PHASE.GAME_OVER;
    state.winnerIds = winners;
    state.isDraw = winningSides.length > 1;
    this.addLog(
      state,
      this.createLogEntry(
        'system',
        `Game over! Winner(s): ${winners.join(', ')}.`,
        { kind: 'spades.game_over' },
      ),
    );
    return this.successResult(state);
  }

  private executeForfeit(
    state: SpadesState,
    context: GameActionContext,
  ): GameActionResult<SpadesState> {
    const check = validateForfeit(state, context.userId);
    if (!check.ok) return this.errorResult(check.error ?? 'Invalid forfeit');
    state.phase = GAME_PHASE.GAME_OVER;
    // The forfeiting player's partner loses with them.
    state.winnerIds = state.playerOrder.filter(
      (id) =>
        id !== context.userId &&
        sideOfPlayer(state.playerOrder, id) !==
          sideOfPlayer(state.playerOrder, context.userId),
    );
    state.isDraw = false;
    this.addLog(
      state,
      this.createLogEntry('system', `${context.userId} forfeited the match.`, {
        senderId: context.userId,
        kind: 'spades.forfeit',
      }),
    );
    return this.successResult(state);
  }
}
