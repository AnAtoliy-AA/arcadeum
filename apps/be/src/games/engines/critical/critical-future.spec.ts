import { Test, TestingModule } from '@nestjs/testing';
import { CriticalEngine } from './critical.engine';
import { GameActionContext } from '../base/game-engine.interface';
import { CriticalCard, CriticalState } from '../../critical/critical.state';

const createMockContext = (userId: string): GameActionContext => ({
  userId,
  roomId: 'room1',
  sessionId: 'test-session',
  timestamp: new Date(),
});

function makeState(
  playerIds: string[],
  config?: Record<string, unknown>,
): CriticalState {
  const engine = new CriticalEngine();
  return engine.initializeState(playerIds, config);
}

describe('CriticalFuture Pack', () => {
  let engine: CriticalEngine;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [CriticalEngine],
    }).compile();
    engine = module.get<CriticalEngine>(CriticalEngine);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('See the Future (5x)', () => {
    it('should peek at top 5 cards', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['see_future_5x'];
      state.deck = [
        'strike',
        'evade',
        'trade',
        'reorder',
        'insight',
        'cancel',
        'cancel',
      ] as CriticalCard[];

      const result = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'see_future_5x' },
      );
      expect(result.success).toBe(true);
      // Should have a private log with card reveals
      const privateLog = result.state!.logs.find(
        (l) =>
          l.scope === 'private' && l.message.includes('seeTheFuture.reveal'),
      );
      expect(privateLog).toBeDefined();
    });
  });

  describe('Alter the Future (3x)', () => {
    it('should set pendingAlter state', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['alter_future_3x'];
      state.deck = [
        'strike',
        'evade',
        'trade',
        'cancel',
        'cancel',
      ] as CriticalCard[];

      const result = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'alter_future_3x' },
      );
      expect(result.success).toBe(true);
      expect(result.state!.pendingAlter).toBeDefined();
      expect(result.state!.pendingAlter!.playerId).toBe('p1');
      expect(result.state!.pendingAlter!.count).toBe(3);
    });

    it('should commit alter future with valid reorder', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['alter_future_3x'];
      state.deck = [
        'strike',
        'evade',
        'trade',
        'cancel',
        'cancel',
      ] as CriticalCard[];

      const alterResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'alter_future_3x' },
      );
      expect(alterResult.success).toBe(true);

      // Commit with reordered cards
      const commitResult = engine.executeAction(
        alterResult.state!,
        'commit_alter_future',
        createMockContext('p1'),
        { newOrder: ['trade', 'strike', 'evade'] as CriticalCard[] },
      );
      expect(commitResult.success).toBe(true);
      expect(commitResult.state!.pendingAlter).toBeNull();
      // Top 3 should now be reordered
      expect(commitResult.state!.deck[0]).toBe('trade');
      expect(commitResult.state!.deck[1]).toBe('strike');
      expect(commitResult.state!.deck[2]).toBe('evade');
    });

    it('should reject commit with cards not from the original top', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['alter_future_3x'];
      state.deck = [
        'strike',
        'evade',
        'trade',
        'cancel',
        'cancel',
      ] as CriticalCard[];

      const alterResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'alter_future_3x' },
      );

      // Try to inject cards that weren't in the top 3
      const commitResult = engine.executeAction(
        alterResult.state!,
        'commit_alter_future',
        createMockContext('p1'),
        {
          newOrder: [
            'critical_event',
            'critical_event',
            'critical_event',
          ] as CriticalCard[],
        },
      );
      expect(commitResult.success).toBe(false);
    });
  });

  describe('Reveal the Future (3x)', () => {
    it('should publicly reveal top 3 cards', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['reveal_future_3x'];
      state.deck = ['strike', 'evade', 'trade', 'cancel'] as CriticalCard[];

      const result = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'reveal_future_3x' },
      );
      expect(result.success).toBe(true);
      // Should have a public log revealing cards
      const publicLog = result.state!.logs.find(
        (l) => l.scope === 'all' && l.message.includes('Revealed the Future'),
      );
      expect(publicLog).toBeDefined();
    });
  });

  describe('Draw From Bottom', () => {
    it('should draw from bottom of deck', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['draw_bottom'];
      state.deck = [
        'strike',
        'evade',
        'trade',
        'cancel',
        'cancel',
      ] as CriticalCard[];
      const bottomCard = state.deck[state.deck.length - 1];

      const result = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'draw_bottom' },
      );
      expect(result.success).toBe(true);
      expect(result.state!.players[0].hand).toContain(bottomCard);
    });

    it('should handle critical_event from bottom draw', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['draw_bottom', 'neutralizer'];
      state.deck = ['strike', 'critical_event'] as CriticalCard[];

      const result = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'draw_bottom' },
      );
      expect(result.success).toBe(true);
      // Should trigger defuse
      expect(result.state!.pendingDefuse).toBe('p1');
    });
  });

  describe('Swap Top and Bottom', () => {
    it('should swap top and bottom cards', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['swap_top_bottom'];
      state.deck = [
        'strike',
        'evade',
        'trade',
        'cancel',
        'insight',
      ] as CriticalCard[];

      const result = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'swap_top_bottom' },
      );
      expect(result.success).toBe(true);
      expect(result.state!.deck[0]).toBe('insight');
      expect(result.state!.deck[result.state!.deck.length - 1]).toBe('strike');
    });
  });

  describe('Bury', () => {
    it('should draw top card and reinsert randomly', () => {
      const state = makeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      state.players[0].hand = ['bury'];
      state.deck = [
        'strike',
        'evade',
        'trade',
        'cancel',
        'cancel',
      ] as CriticalCard[];
      const originalDeckSize = state.deck.length;

      const result = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'bury' },
      );
      expect(result.success).toBe(true);
      // Deck size should remain the same (card was drawn and reinserted)
      expect(result.state!.deck.length).toBe(originalDeckSize);
    });
  });
});
