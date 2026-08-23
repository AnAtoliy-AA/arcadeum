import { SpadesBotService } from './spades-bot.service';
import { SpadesService } from './spades.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '../engines/spades/spades.constants';
import type { SpadesState } from '../engines/spades/spades.types';

const PLAYERS = ['bot-1', 'bot-2', 'human', 'bot-3'];

function makeBot() {
  const fakeService = {
    bid: jest.fn(),
    playCard: jest.fn(),
    completeSession: jest.fn(),
  };
  const fakeSessions = {
    findSessionByRoom: jest.fn().mockResolvedValue(null),
  };
  return {
    bot: new SpadesBotService(
      fakeService as unknown as SpadesService,
      fakeSessions as unknown as GameSessionsService,
    ),
    fakeService,
  };
}

function makeState(
  overrides?: Partial<SpadesState>,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): SpadesState {
  return {
    phase: GAME_PHASE.PLAYING,
    options: {
      targetScore: 500,
      nilEnabled: true,
      aiDifficulty: difficulty,
    },
    handNumber: 0,
    hands: {
      'bot-1': ['AC', 'KC', 'QS'],
      'bot-2': ['4C', '5C'],
      human: ['6C', '7C'],
      'bot-3': ['8C', '9C'],
    },
    taken: { 'bot-1': [], 'bot-2': [], human: [], 'bot-3': [] },
    bids: { 'bot-1': null, 'bot-2': 2, human: 2, 'bot-3': 2 },
    scores: { 'bot-1': 0, 'bot-2': 0, human: 0, 'bot-3': 0 },
    bags: { 'bot-1': 0, 'bot-2': 0, human: 0, 'bot-3': 0 },
    currentTrick: { plays: [], leadSuit: null },
    currentTurnIndex: 0,
    playerOrder: PLAYERS,
    players: PLAYERS.map((playerId) => ({ playerId })),
    spadesBroken: false,
    lastHandSummary: null,
    winnerIds: null,
    isDraw: false,
    logs: [],
    ...overrides,
  };
}

describe('SpadesBotService', () => {
  describe('pickBid', () => {
    it.each(['easy', 'medium', 'hard'] as const)(
      '%s: returns a whole number between nil and 13',
      (difficulty) => {
        const { bot } = makeBot();
        const state = makeState(
          {
            phase: GAME_PHASE.BIDDING,
            hands: {
              'bot-1': ['AS', 'KS', 'AH', '7D', '3C'],
              'bot-2': [],
              human: [],
              'bot-3': [],
            },
          },
          difficulty,
        );
        const bid = bot.pickBid(state, 'bot-1');
        expect(Number.isInteger(bid)).toBe(true);
        expect(bid).toBeGreaterThanOrEqual(0);
        expect(bid).toBeLessThanOrEqual(13);
      },
    );

    it('bids higher with strong spades and aces', () => {
      const { bot } = makeBot();
      const state = makeState(
        {
          phase: GAME_PHASE.BIDDING,
          hands: {
            'bot-1': ['AS', 'KS', 'QD', 'AD', 'AC'],
            'bot-2': [],
            human: [],
            'bot-3': [],
          },
        },
        'medium',
      );
      const strong = bot.pickBid(state, 'bot-1');

      const weakState = makeState(
        {
          phase: GAME_PHASE.BIDDING,
          hands: {
            'bot-1': ['2C', '3C', '4D', '5D', '6H'],
            'bot-2': [],
            human: [],
            'bot-3': [],
          },
        },
        'medium',
      );
      const weak = bot.pickBid(weakState, 'bot-1');
      expect(strong).toBeGreaterThan(weak);
      expect(strong).toBeGreaterThanOrEqual(3);
    });

    it('considers nil with a flat hand when enabled', () => {
      const { bot } = makeBot();
      const state = makeState(
        {
          phase: GAME_PHASE.BIDDING,
          options: { targetScore: 500, nilEnabled: true, aiDifficulty: 'hard' },
          hands: {
            'bot-1': ['2C', '3C', '4D', '6H', '8S'],
            'bot-2': [],
            human: [],
            'bot-3': [],
          },
        },
        'hard',
      );
      expect(bot.pickBid(state, 'bot-1')).toBe(0);
    });
  });

  describe('legalCards', () => {
    it('excludes unbroken spades from leads', () => {
      const { bot } = makeBot();
      const state = makeState({
        hands: { ...makeState().hands, 'bot-1': ['2S', 'AC', 'KH'] },
        spadesBroken: false,
      });
      const legal = bot.legalCards(state, 'bot-1');
      expect(legal).not.toContain('2S');
      expect(legal).toContain('AC');
    });

    it('allows any card once spades are broken', () => {
      const { bot } = makeBot();
      const state = makeState({
        hands: { ...makeState().hands, 'bot-1': ['2S', 'AC'] },
        spadesBroken: true,
      });
      const legal = bot.legalCards(state, 'bot-1');
      expect(legal).toContain('2S');
    });

    it('restricts to the led suit when able to follow', () => {
      const { bot } = makeBot();
      const state = makeState({
        currentTrick: {
          plays: [{ playerId: 'human', card: '9C' }],
          leadSuit: 'C',
        },
      });
      const legal = bot.legalCards(state, 'bot-1');
      expect(legal.every((c) => c.endsWith('C'))).toBe(true);
    });
  });

  describe('pickCardToPlay', () => {
    it('picks a card that is actually in the hand', () => {
      const { bot } = makeBot();
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        const state = makeState({}, difficulty);
        const card = bot.pickCardToPlay(state, 'bot-1');
        expect(state.hands['bot-1']).toContain(card);
      }
    });

    it('ducks under the current winner when following suit', () => {
      const { bot } = makeBot();
      // Trick led clubs; AC currently winning. Bot holds KC + low clubs.
      const state = makeState({
        currentTrick: {
          plays: [
            { playerId: 'human', card: '9C' },
            { playerId: 'bot-2', card: 'AC' },
          ],
          leadSuit: 'C',
        },
        hands: { ...makeState().hands, 'bot-1': ['KC', '2C', 'AS'] },
        spadesBroken: false,
      });
      // Partner is not winning (opponent AC wins) — bot should try a winner:
      // none beat AC in clubs, so it ducks lowest.
      const card = bot.pickCardToPlay(state, 'bot-1')!;
      expect(card).toBe('2C');
    });

    it('wins cheaply when an opponent is winning the trick', () => {
      const { bot } = makeBot();
      const state = makeState({
        currentTrick: {
          plays: [{ playerId: 'human', card: '9C' }],
          leadSuit: 'C',
        },
        hands: { ...makeState().hands, 'bot-1': ['KC', 'AC', 'AS'] },
        spadesBroken: false,
      });
      const card = bot.pickCardToPlay(state, 'bot-1');
      expect(card).toBe('KC');
    });

    it('ducks low when its partner is winning the trick', () => {
      const { bot } = makeBot();
      // bot-2 is partner of... seat parity: PLAYERS[0] & PLAYERS[2] are
      // partners, so bot-1's partner is 'human'. Human leads with QC.
      const state = makeState({
        currentTrick: {
          plays: [{ playerId: 'human', card: 'QC' }],
          leadSuit: 'C',
        },
        hands: { ...makeState().hands, 'bot-1': ['KC', 'AC'] },
        spadesBroken: false,
      });
      const card = bot.pickCardToPlay(state, 'bot-1');
      expect(card).toBe('KC');
    });

    it('discards the lowest non-spade when void in the led suit', () => {
      const { bot } = makeBot();
      const state = makeState({
        currentTrick: {
          plays: [{ playerId: 'human', card: '9D' }],
          leadSuit: 'D',
        },
        hands: { ...makeState().hands, 'bot-1': ['AS', 'KC', '2C'] },
        spadesBroken: false,
      });
      const card = bot.pickCardToPlay(state, 'bot-1');
      expect(card).not.toBe('AS');
    });
  });
});
