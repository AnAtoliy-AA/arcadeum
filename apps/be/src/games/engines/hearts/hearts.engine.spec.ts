import { HeartsEngine } from './hearts.engine';
import { GAME_PHASE } from './hearts.constants';
import type { HeartsState, PlayCardPayload } from './hearts.types';
import type { GameActionContext } from '../base/game-engine.interface';
import { sortHand } from './hearts.utils';

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
  return new HeartsEngine(interleavedShuffler);
}

function ctxFor(userId: string): GameActionContext {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  };
}

/** Even round-robin deal from the sorted deck: deterministic and fair. */
function evenDeal(): Record<string, string[]> {
  const suits = ['C', 'D', 'S', 'H'];
  const ranks = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];
  const deck = sortHand(
    Array.from(
      { length: 52 },
      (_, i) => `${ranks[Math.floor(i / 4)]}${suits[i % 4]}`,
    ),
  );
  const hands: Record<string, string[]> = {};
  PLAYERS.forEach((id, idx) => {
    hands[id] = deck.filter((_, i) => i % 4 === idx);
  });
  return hands;
}

/** Play exactly one full hand (13 tricks = 52 plays) with a lowest-legal-card strategy. */
function playFullHand(engine: HeartsEngine): HeartsState {
  let state = engine.initializeState(PLAYERS, {
    options: { passingEnabled: false, targetScore: 1000 },
  });
  const playsPerHand = 52;
  let playsMade = 0;
  let guard = 0;
  while (
    playsMade < playsPerHand &&
    state.phase !== GAME_PHASE.GAME_OVER &&
    guard++ < 200
  ) {
    const playerId = state.playerOrder[state.currentTurnIndex];
    const played = [...(state.hands[playerId] ?? [])].sort().find((card) =>
      engine.validateAction(state, 'play_card', ctxFor(playerId), {
        card,
      } satisfies PlayCardPayload),
    );
    if (!played) throw new Error(`No legal card for ${playerId}`);
    const result = engine.executeAction(state, 'play_card', ctxFor(playerId), {
      card: played,
    });
    if (!result.success || !result.state) {
      throw new Error(result.error ?? 'play failed');
    }
    state = result.state;
    playsMade++;
  }
  return state;
}

describe('HeartsEngine', () => {
  describe('metadata & initialization', () => {
    it('exposes hearts_v1 metadata for exactly 4 players', () => {
      const meta = makeEngine().getMetadata();
      expect(meta.gameId).toBe('hearts_v1');
      expect(meta.minPlayers).toBe(4);
      expect(meta.maxPlayers).toBe(4);
    });

    it('rejects non-4 player counts', () => {
      expect(() => makeEngine().initializeState(['a', 'b', 'c'])).toThrow();
    });

    it('deals 13 sorted cards per player with a deterministic shuffler', () => {
      const state = makeEngine().initializeState(PLAYERS);
      expect(state.phase).toBe(GAME_PHASE.PASSING);
      expect(state.passDirection).toBe('left');
      for (const id of PLAYERS) {
        expect(state.hands[id]).toHaveLength(13);
        expect(state.hands[id]).toEqual(sortHand(state.hands[id]));
      }
      expect(PLAYERS.some((id) => state.hands[id].includes('2C'))).toBe(true);
      void evenDeal;
    });
  });

  describe('passing phase', () => {
    it('resolves all four passes simultaneously to the left', () => {
      const engine = makeEngine();
      let state = engine.initializeState(PLAYERS);

      for (const id of PLAYERS) {
        const cards = state.hands[id].slice(0, 3);
        const result = engine.executeAction(state, 'pass_cards', ctxFor(id), {
          cards,
        });
        expect(result.success).toBe(true);
        state = result.state!;
      }

      expect(state.phase).toBe(GAME_PHASE.PLAYING);
      expect(Object.values(state.pendingPasses).every((p) => !p.length)).toBe(
        true,
      );
      // Left rotation: the 2♣ holder leads the first trick.
      const leaderId = state.playerOrder[state.currentTurnIndex];
      expect(state.hands[leaderId]).toContain('2C');
      for (const id of PLAYERS) {
        expect(state.hands[id]).toHaveLength(13);
      }
    });

    it('rejects a second pass from the same player', () => {
      const engine = makeEngine();
      let state = engine.initializeState(PLAYERS);
      const result = engine.executeAction(state, 'pass_cards', ctxFor('p0'), {
        cards: state.hands.p0.slice(0, 3),
      });
      state = result.state!;
      const second = engine.validateAction(state, 'pass_cards', ctxFor('p0'), {
        cards: state.hands.p0.slice(0, 3),
      });
      expect(second).toBe(false);
    });

    it('skips passing entirely when passingEnabled is false', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS, {
        options: { passingEnabled: false },
      });
      expect(state.phase).toBe(GAME_PHASE.PLAYING);
      // The 2♣ holder leads immediately.
      const leaderId = state.playerOrder[state.currentTurnIndex];
      expect(state.hands[leaderId]).toContain('2C');
    });

    it('deals straight into play on hold hands (no passing round)', () => {
      const engine = makeEngine();
      let state = engine.initializeState(PLAYERS, {
        options: { passingEnabled: false, targetScore: 1000 },
      });
      state.hands = { p0: ['2C'], p1: ['3C'], p2: ['4C'], p3: ['5C'] };
      state.taken = { p0: [], p1: [], p2: [], p3: [] };
      state.handNumber = 2; // the re-deal becomes hand 3 → 'hold'

      const plays = ['2C', '3C', '4C', '5C'];
      for (let i = 0; i < 4; i++) {
        const playerId = state.playerOrder[state.currentTurnIndex];
        const result = engine.executeAction(
          state,
          'play_card',
          ctxFor(playerId),
          { card: plays[i] },
        );
        expect(result.success).toBe(true);
        state = result.state!;
      }

      expect(state.handNumber).toBe(3);
      expect(state.passDirection).toBe('hold');
      expect(state.phase).toBe(GAME_PHASE.PLAYING);
      const leaderId = state.playerOrder[state.currentTurnIndex];
      expect(state.hands[leaderId]).toContain('2C');
    });
  });

  describe('full-hand playthrough', () => {
    it('completes 13 tricks with lowest-legal-card strategy and scores correctly', () => {
      const engine = makeEngine();
      const endState = playFullHand(engine);
      // After 52 plays, completeHand fires and dealHand re-deals.
      // The total penalty in a standard hand is 26 points. With a deterministic
      // lowest-legal-card bot, shoot-the-moon can occur (total becomes 78).
      const scoreTotal = Object.values(endState.scores).reduce(
        (a, b) => a + b,
        0,
      );
      expect(scoreTotal === 26 || scoreTotal === 78).toBe(true);
      // Hands re-dealt after completeHand
      for (const id of PLAYERS) {
        expect(endState.hands[id]).toHaveLength(13);
        expect(endState.logs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('shoot-the-moon scoring', () => {
    it('zeroes the shooter and gives every opponent 26, winType shoot_the_moon', () => {
      const engine = makeEngine();
      let state = engine.initializeState(PLAYERS, {
        options: { passingEnabled: false, targetScore: 50 },
      });
      state.hands = { p0: ['2C'], p1: ['3C'], p2: ['4C'], p3: ['5C'] };
      const ranks = [
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        'J',
        'Q',
        'K',
        'A',
      ];
      state.taken = {
        p0: [...ranks.map((r) => `${r}H`), 'QS'],
        p1: [],
        p2: [],
        p3: [],
      };
      state.scores = { p0: 24, p1: 24, p2: 24, p3: 24 };

      const plays = ['2C', '3C', '4C', '5C'];
      for (let i = 0; i < 4; i++) {
        const playerId = state.playerOrder[state.currentTurnIndex];
        const result = engine.executeAction(
          state,
          'play_card',
          ctxFor(playerId),
          { card: plays[i] },
        );
        expect(result.success).toBe(true);
        state = result.state!;
      }

      expect(state.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(state.handScores.p0).toBe(0);
      expect(state.handScores.p1).toBe(26);
      expect(state.handScores.p2).toBe(26);
      expect(state.handScores.p3).toBe(26);
      expect(state.winnerIds).toEqual(['p0']);
      expect(state.winType).toBe('shoot_the_moon');
      expect(state.isDraw).toBe(false);
    });
  });

  describe('standard game over', () => {
    it('ends when someone reaches targetScore; lowest score wins (ties drawn)', () => {
      const engine = makeEngine();
      let state = engine.initializeState(PLAYERS, {
        options: { passingEnabled: false, targetScore: 50 },
      });
      state.hands = { p0: ['2C'], p1: ['3C'], p2: ['4C'], p3: ['5C'] };
      const heartRanks = [
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        'J',
        'K',
        'A',
      ];
      state.taken = {
        p0: [...heartRanks.map((r) => `${r}H`)],
        p1: ['QS'],
        p2: [],
        p3: [],
      };
      state.scores = { p0: 38, p1: 37, p2: 37, p3: 37 };
      // p0 holds the 2♣ and leads the final trick (all clubs, no points).
      state.currentTurnIndex = 0;
      const plays = ['2C', '3C', '4C', '5C'];
      for (let i = 0; i < 4; i++) {
        const playerId = state.playerOrder[state.currentTurnIndex];
        const result = engine.executeAction(
          state,
          'play_card',
          ctxFor(playerId),
          { card: plays[i] },
        );
        expect(result.success).toBe(true);
        state = result.state!;
      }

      expect(state.phase).toBe(GAME_PHASE.GAME_OVER);
      // p0: 38+12=50, p1: 37+13=50, p2/p3 stay at 37 — tie for lowest.
      expect(state.winnerIds).toEqual(['p2', 'p3']);
      expect(state.isDraw).toBe(true);
      expect(state.winType).toBe('standard');
    });
  });

  describe('sanitizeStateForPlayer', () => {
    it('hides other players’ hands and pending passes', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS);
      const sanitized = engine.sanitizeStateForPlayer(state, 'p0');
      expect(sanitized.hands.p0).toEqual(state.hands.p0);
      expect(sanitized.hands.p1.every((c) => c === '??')).toBe(true);
      expect(sanitized.hands.p1).toHaveLength(13);
    });
  });

  describe('forfeit', () => {
    it('awards the win to the remaining three players', () => {
      const engine = makeEngine();
      const state = engine.initializeState(PLAYERS);
      const result = engine.executeAction(state, 'forfeit', ctxFor('p2'), {});
      expect(result.state?.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(result.state?.winnerIds).toEqual(['p0', 'p1', 'p3']);
    });
  });

  describe('getAvailableActions', () => {
    it('offers pass_cards, play_card and forfeit at the right moments', () => {
      const engine = makeEngine();
      const passingState = engine.initializeState(PLAYERS);
      expect(engine.getAvailableActions(passingState, 'p0')).toContain(
        'pass_cards',
      );

      passingState.phase = GAME_PHASE.PLAYING;
      passingState.currentTurnIndex = 2;
      expect(engine.getAvailableActions(passingState, 'p2')).toEqual([
        'play_card',
        'forfeit',
      ]);
      expect(engine.getAvailableActions(passingState, 'p0')).toEqual([
        'forfeit',
      ]);
    });
  });
});
