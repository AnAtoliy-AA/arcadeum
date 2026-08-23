import { HeartsBotService } from './hearts-bot.service';
import { HeartsService } from './hearts.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '../engines/hearts/hearts.constants';
import type { HeartsState } from '../engines/hearts/hearts.types';

const PLAYERS = ['bot-1', 'bot-2', 'human', 'bot-3'];

function makeBot() {
  const fakeService = {
    passCards: jest.fn(),
    playCard: jest.fn(),
    completeSession: jest.fn(),
  };
  const fakeSessions = {
    findSessionByRoom: jest.fn().mockResolvedValue(null),
  };
  return {
    bot: new HeartsBotService(
      fakeService as unknown as HeartsService,
      fakeSessions as unknown as GameSessionsService,
    ),
    fakeService,
  };
}

function makeState(
  overrides?: Partial<HeartsState>,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): HeartsState {
  return {
    phase: GAME_PHASE.PLAYING,
    options: {
      passingEnabled: true,
      targetScore: 100,
      aiDifficulty: difficulty,
    },
    handNumber: 0,
    passDirection: 'left',
    hands: {
      'bot-1': ['2C', '3C'],
      'bot-2': ['4C', '5C'],
      human: ['6C', '7C'],
      'bot-3': ['8C', '9C'],
    },
    taken: { 'bot-1': [], 'bot-2': [], human: [], 'bot-3': [] },
    pendingPasses: { 'bot-1': [], 'bot-2': [], human: [], 'bot-3': [] },
    scores: { 'bot-1': 0, 'bot-2': 0, human: 0, 'bot-3': 0 },
    handScores: { 'bot-1': 0, 'bot-2': 0, human: 0, 'bot-3': 0 },
    currentTrick: { plays: [], leadSuit: null },
    currentTurnIndex: 0,
    playerOrder: PLAYERS,
    players: PLAYERS.map((playerId) => ({ playerId })),
    heartsBroken: false,
    winnerIds: null,
    winType: null,
    isDraw: false,
    logs: [],
    ...overrides,
  };
}

describe('HeartsBotService', () => {
  describe('pickPassCards', () => {
    it.each(['easy', 'medium', 'hard'] as const)(
      '%s: picks exactly 3 owned cards',
      (difficulty) => {
        const { bot } = makeBot();
        const state = makeState(
          {
            phase: GAME_PHASE.PASSING,
            hands: {
              'bot-1': ['QS', 'AS', '2H', '5D', 'JC'],
              'bot-2': [],
              human: [],
              'bot-3': [],
            },
          },
          difficulty,
        );
        const cards = bot.pickPassCards(state, 'bot-1');
        expect(cards).toHaveLength(3);
        for (const card of cards) {
          expect(state.hands['bot-1']).toContain(card);
        }
        expect(new Set(cards).size).toBe(3);
      },
    );

    it('medium sheds the Queen of Spades when spades are unguarded', () => {
      const { bot } = makeBot();
      const state = makeState({
        phase: GAME_PHASE.PASSING,
        hands: {
          'bot-1': ['QS', '2H', '5D', 'JC'],
          'bot-2': [],
          human: [],
          'bot-3': [],
        },
      });
      expect(bot.pickPassCards(state, 'bot-1')).toContain('QS');
    });
  });
});
