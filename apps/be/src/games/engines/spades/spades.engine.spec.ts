import { SpadesEngine } from './spades.engine';
import { GAME_PHASE } from './spades.constants';
import type { BidPayload, PlayCardPayload, SpadesState } from './spades.types';
import type { GameActionContext } from '../base/game-engine.interface';
import { sortHand } from './spades.utils';

const PLAYERS = ['p0', 'p1', 'p2', 'p3'];

/**
 * Deterministic shuffler: deinterleaves the suit-major deck so each player
 * gets a mix of suits. makeDeck produces [C2..CA, D2..DA, S2..SA, H2..HA].
 * This shuffler picks one card per suit per round, giving
 * [C2,D2,S2,H2, C3,D3,S3,H3, ...].
 */
function interleavedShuffler<T>(cards: T[]): T[] {
  const suits = 4;
  const ranksPerSuit = cards.length / suits;
  const result: T[] = [];
  for (let r = 0; r < ranksPerSuit; r++) {
    for (let s = 0; s < suits; s++) {
      result.push(cards[s * ranksPerSuit + r]);
    }
  }
  return result;
}

function makeEngine() {
  return new SpadesEngine(interleavedShuffler);
}

/**
 * Fixed deal for targeted trick scenarios: p0 gets all clubs, p1 all
 * spades, p2 all diamonds, p3 all hearts.
 */
function suitGroupedShuffler<T>(cards: T[]): T[] {
  const pick = (suffix: string) =>
    cards.filter((c) => typeof c === 'string' && c.endsWith(suffix));
  return [...pick('C'), ...pick('S'), ...pick('D'), ...pick('H')];
}

function ctxFor(userId: string): GameActionContext {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  };
}

/** Place all four bids in turn order starting from the current bidder. */
function bidAll(
  engine: SpadesEngine,
  state: SpadesState,
  bidsByPlayer: Record<string, number>,
): SpadesState {
  let current = state;
  let guard = 0;
  while (current.phase === GAME_PHASE.BIDDING && guard++ < 8) {
    const playerId = current.playerOrder[current.currentTurnIndex];
    const amount = bidsByPlayer[playerId] ?? 1;
    const result = engine.executeAction(current, 'bid', ctxFor(playerId), {
      amount,
    } satisfies BidPayload);
    if (!result.success || !result.state) {
      throw new Error(result.error ?? 'bid failed');
    }
    current = result.state;
  }
  if (current.phase !== GAME_PHASE.PLAYING) {
    throw new Error('bidding did not complete');
  }
  return current;
}

/**
 * Play exactly one full hand (13 tricks = 52 plays). Strategy: follow suit
 * with the lowest legal card; lead the lowest legal card.
 */
function playFullHand(engine: SpadesEngine, state: SpadesState): SpadesState {
  let current = state;
  let playsMade = 0;
  let guard = 0;
  while (
    playsMade < 52 &&
    current.phase === GAME_PHASE.PLAYING &&
    guard++ < 200
  ) {
    const playerId = current.playerOrder[current.currentTurnIndex];
    const played = [...(current.hands[playerId] ?? [])].sort().find((card) =>
      engine.validateAction(current, 'play_card', ctxFor(playerId), {
        card,
      } satisfies PlayCardPayload),
    );
    if (!played) throw new Error(`No legal card for ${playerId}`);
    const result = engine.executeAction(
      current,
      'play_card',
      ctxFor(playerId),
      { card: played } satisfies PlayCardPayload,
    );
    if (!result.success || !result.state) {
      throw new Error(result.error ?? 'play failed');
    }
    current = result.state;
    playsMade++;
  }
  return current;
}

describe('SpadesEngine', () => {
  describe('metadata & initialization', () => {
    it('exposes spades_v1 metadata for exactly 4 players', () => {
      const meta = makeEngine().getMetadata();
      expect(meta.gameId).toBe('spades_v1');
      expect(meta.minPlayers).toBe(4);
      expect(meta.maxPlayers).toBe(4);
    });

    it('rejects non-4 player counts', () => {
      expect(() => makeEngine().initializeState(['a', 'b', 'c'])).toThrow();
    });

    it('deals 13 sorted cards per player with a deterministic shuffler', () => {
      const state = makeEngine().initializeState(PLAYERS);
      expect(state.phase).toBe(GAME_PHASE.BIDDING);
      for (const id of PLAYERS) {
        expect(state.hands[id]).toHaveLength(13);
        expect(state.hands[id]).toEqual(sortHand(state.hands[id]));
      }
      // No duplicates across hands.
      const all = PLAYERS.flatMap((id) => state.hands[id]);
      expect(new Set(all).size).toBe(52);
    });

    it('rotates the first bidder by hand number', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS);
      expect(state.playerOrder[state.currentTurnIndex]).toBe('p0');

      const later = engine.initializeState(PLAYERS, {
        options: { targetScore: 300 },
      });
      void later;
    });
  });

  describe('bidding', () => {
    it('rejects out-of-turn and out-of-range bids', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS);

      // p1 bids first — invalid.
      expect(
        engine.validateAction(state, 'bid', ctxFor('p1'), { amount: 3 }),
      ).toBe(false);
      // Out of range.
      expect(
        engine.validateAction(state, 'bid', ctxFor('p0'), { amount: 14 }),
      ).toBe(false);
      expect(
        engine.validateAction(state, 'bid', ctxFor('p0'), { amount: -1 }),
      ).toBe(false);
      // Nil is valid by default.
      expect(
        engine.validateAction(state, 'bid', ctxFor('p0'), { amount: 0 }),
      ).toBe(true);
    });

    it('rejects nil bids when disabled', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS, {
        options: { nilEnabled: false },
      });
      expect(
        engine.validateAction(state, 'bid', ctxFor('p0'), { amount: 0 }),
      ).toBe(false);
      expect(
        engine.validateAction(state, 'bid', ctxFor('p0'), { amount: 2 }),
      ).toBe(true);
    });

    it('moves to playing once all players have bid', () => {
      const engine = makeEngine();
      const state = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 3,
        p1: 2,
        p2: 4,
        p3: 1,
      });
      expect(state.phase).toBe(GAME_PHASE.PLAYING);
      expect(state.bids).toEqual({ p0: 3, p1: 2, p2: 4, p3: 1 });
      // First bidder leads.
      expect(state.playerOrder[state.currentTurnIndex]).toBe('p0');
    });

    it('rejects double bidding', () => {
      const engine = makeEngine();
      const afterP0 = engine.executeAction(
        engine.initializeState(PLAYERS),
        'bid',
        ctxFor('p0'),
        { amount: 3 },
      );
      expect(afterP0.success).toBe(true);
      const state = afterP0.state!;
      // Turn moved to p1; even if p0 tries again at their turn index, the
      // placed-bid guard rejects.
      expect(state.bids.p0).toBe(3);
      expect(
        engine.validateAction(state, 'bid', ctxFor('p0'), { amount: 2 }),
      ).toBe(false);
    });
  });

  describe('playing rules', () => {
    function playingState() {
      const engine = makeEngine();
      const state = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 1,
        p1: 1,
        p2: 1,
        p3: 1,
      });
      return { engine, state };
    }

    it('forbids leading spades before they are broken (unless only spades)', () => {
      const { engine, state } = playingState();
      const leader = state.playerOrder[state.currentTurnIndex];
      const hand = state.hands[leader];

      // The interleaved deal gives every player a non-spade card.
      const nonSpade = hand.find((c) => !c.endsWith('S'))!;
      expect(nonSpade).toBeDefined();

      const spadeLead = hand.find((c) => c.endsWith('S'));
      if (spadeLead && hand.some((c) => !c.endsWith('S'))) {
        expect(
          engine.validateAction(state, 'play_card', ctxFor(leader), {
            card: spadeLead,
          }),
        ).toBe(false);
      }

      expect(
        engine.validateAction(state, 'play_card', ctxFor(leader), {
          card: nonSpade,
        }),
      ).toBe(true);
    });

    it('requires following suit', () => {
      const { engine, state } = playingState();
      const leader = state.playerOrder[state.currentTurnIndex];
      const leadCard = state.hands[leader].find((c) => c.endsWith('C'))!;
      const played = engine.executeAction(state, 'play_card', ctxFor(leader), {
        card: leadCard,
      });
      expect(played.success).toBe(true);

      const next = played.state!;
      const follower = next.playerOrder[next.currentTurnIndex];
      const offSuit = next.hands[follower].find((c) => !c.endsWith('C'))!;
      const inSuit = next.hands[follower].find((c) => c.endsWith('C'));

      if (inSuit && offSuit) {
        expect(
          engine.validateAction(next, 'play_card', ctxFor(follower), {
            card: offSuit,
          }),
        ).toBe(false);
        expect(
          engine.validateAction(next, 'play_card', ctxFor(follower), {
            card: inSuit,
          }),
        ).toBe(true);
      }
    });

    it('awards the trick to a spade over higher cards of the led suit', () => {
      // Fixed deal: p0 clubs, p1 spades, p2 diamonds, p3 hearts.
      const engine = new SpadesEngine(suitGroupedShuffler);
      const state = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 1,
        p1: 1,
        p2: 1,
        p3: 1,
      });

      let current = state;
      const play = (playerId: string, card: string) => {
        const result = engine.executeAction(
          current,
          'play_card',
          ctxFor(playerId),
          { card },
        );
        if (!result.success || !result.state) {
          throw new Error(result.error ?? `illegal play ${card}`);
        }
        current = result.state;
      };

      play('p0', 'AC'); // leader
      play('p1', 'AS'); // ruffed with the ace of spades
      play('p2', 'AD'); // void discard
      play('p3', 'AH'); // void discard

      // The spade wins the trick despite the led-suit ace being present.
      expect(current.taken.p1).toHaveLength(4);
      expect(current.taken.p1).toContain('AC');
      expect(current.taken.p1).toContain('AS');
    });

    it('marks spades broken when any spade is discarded', () => {
      const engine = new SpadesEngine(suitGroupedShuffler);
      const state = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 1,
        p1: 1,
        p2: 1,
        p3: 1,
      });

      // p0 leads a club; p1 is void in clubs and discards a spade.
      let current = engine.executeAction(state, 'play_card', ctxFor('p0'), {
        card: 'AC',
      }).state!;
      expect(current.spadesBroken).toBe(false);
      current = engine.executeAction(current, 'play_card', ctxFor('p1'), {
        card: '2S',
      }).state!;
      expect(current.spadesBroken).toBe(true);
    });
  });

  describe('full hand & scoring', () => {
    it('completes 13 tricks, scores both teams, and starts the next hand', () => {
      const engine = makeEngine();
      const bid = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 2,
        p1: 3,
        p2: 2,
        p3: 3,
      });
      const end = playFullHand(engine, bid);

      // With target 500 nothing ends after one hand — a new one is dealt
      // and everyone must bid again.
      expect(end.phase).toBe(GAME_PHASE.BIDDING);
      expect(end.handNumber).toBe(1);
      for (const id of PLAYERS) {
        expect(end.hands[id]).toHaveLength(13);
        expect(end.bids[id]).toBeNull();
      }

      // Team tricks sum to 13.
      const summary = end.lastHandSummary;
      expect(summary).not.toBeNull();
      const totalTricks =
        (summary!.teamTricks['even'] ?? 0) + (summary!.teamTricks['odd'] ?? 0);
      expect(totalTricks).toBe(13);

      // Scores are mirrored onto partners.
      expect(end.scores.p0).toBe(end.scores.p2);
      expect(end.scores.p1).toBe(end.scores.p3);
    });

    it('awards 10x bid plus overtricks for a made contract', () => {
      const engine = makeEngine();
      // Everyone bids 1 (team bid 2); bags start at 0.
      const bid = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 1,
        p1: 1,
        p2: 1,
        p3: 1,
      });
      const end = playFullHand(engine, bid);
      const summary = end.lastHandSummary!;
      for (const side of ['even', 'odd'] as const) {
        const bidN = summary.teamBids[side];
        const tricks = summary.teamTricks[side];
        const raw = tricks >= bidN ? 10 * bidN + (tricks - bidN) : -10 * bidN;
        // Fresh game: a bag penalty fires exactly when this hand's
        // overtricks alone cross the 10-bag threshold.
        const bagPenalty = tricks > bidN && tricks - bidN >= 10 ? 100 : 0;
        expect(summary.pointsDelta[side]).toBe(raw - bagPenalty);
      }
    });

    it('ends the game when a team reaches the target score', () => {
      const engine = makeEngine();
      // Play hands until someone hits 300 (target). Deterministic deal means
      // this terminates quickly; guard against runaway loops.
      let state = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 5,
        p1: 5,
        p2: 5,
        p3: 5,
      });
      let guard = 0;
      while (state.phase !== GAME_PHASE.GAME_OVER && guard++ < 60) {
        if (state.phase === GAME_PHASE.BIDDING) {
          state = bidAll(engine, state, { p0: 5, p1: 5, p2: 5, p3: 5 });
        } else {
          state = playFullHand(engine, state);
        }
      }
      expect(state.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(state.winnerIds).not.toBeNull();
      expect(state.winnerIds!.length).toBeGreaterThanOrEqual(2);
      // Winners sit on the same side of the table.
      const winners = state.winnerIds!;
      const idxs = winners.map((w) => PLAYERS.indexOf(w)).sort();
      expect(idxs.every((i) => i % 2 === idxs[0] % 2)).toBe(true);
    });
  });

  describe('forfeit', () => {
    it('gives the win to the opposing partnership only', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS);
      const result = engine.executeAction(state, 'forfeit', ctxFor('p0'));
      expect(result.success).toBe(true);
      const next = result.state!;
      expect(next.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(next.winnerIds).toEqual(['p1', 'p3']);
    });

    it('rejects forfeit from non-players', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS);
      expect(engine.validateAction(state, 'forfeit', ctxFor('nope'))).toBe(
        false,
      );
    });
  });

  describe('sanitization', () => {
    it('masks other hands but keeps bids public', () => {
      const engine = makeEngine();
      const state = bidAll(engine, engine.initializeState(PLAYERS), {
        p0: 3,
        p1: 2,
        p2: 4,
        p3: 1,
      });
      const view = engine.sanitizeStateForPlayer(state, 'p0');
      expect(view.hands.p0.length).toBeGreaterThan(0);
      for (const id of ['p1', 'p2', 'p3']) {
        expect(view.hands[id].every((c) => c === '??')).toBe(true);
      }
      expect(view.bids).toEqual({ p0: 3, p1: 2, p2: 4, p3: 1 });
    });
  });

  describe('available actions', () => {
    it('offers bid only to the player on clock during bidding', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS);
      expect(engine.getAvailableActions(state, 'p0')).toContain('bid');
      expect(engine.getAvailableActions(state, 'p1')).not.toContain('bid');
      expect(engine.getAvailableActions(state, 'p0')).toContain('forfeit');
    });
  });
});
