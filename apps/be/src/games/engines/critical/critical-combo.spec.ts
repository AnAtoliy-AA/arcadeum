import { Test, TestingModule } from '@nestjs/testing';
import { CriticalEngine } from './critical.engine';
import { GameActionContext } from '../base/game-engine.interface';
import { CriticalCard } from '../../critical/critical.state';

const createMockContext = (userId: string): GameActionContext => ({
  userId,
  roomId: 'room1',
  sessionId: 'test-session',
  timestamp: new Date(),
});

describe('CriticalCombo', () => {
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

  describe('Pair combo (2 matching cards)', () => {
    it('should steal a random card from target', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].hand = [
        'collection_alpha',
        'collection_alpha',
        'neutralizer',
      ];
      state.players[1].hand = ['strike', 'evade', 'trade'];

      const result = engine.executeAction(
        state,
        'play_cat_combo',
        createMockContext('p1'),
        {
          cards: ['collection_alpha', 'collection_alpha'] as CriticalCard[],
          targetPlayerId: 'p2',
          selectedIndex: 0,
        },
      );
      expect(result.success).toBe(true);
      // p1 should have gained a card, p2 should have lost one
      expect(result.state!.players[0].hand.length).toBe(2); // played 2, stole 1 = net +1 - 2 played = 2
      expect(result.state!.players[1].hand.length).toBe(2);
    });
  });

  describe('Trio combo (3 matching cards)', () => {
    it('should steal a specific requested card from target', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].hand = [
        'collection_beta',
        'collection_beta',
        'collection_beta',
        'neutralizer',
      ];
      state.players[1].hand = ['strike', 'evade', 'trade'];

      const result = engine.executeAction(
        state,
        'play_cat_combo',
        createMockContext('p1'),
        {
          cards: [
            'collection_beta',
            'collection_beta',
            'collection_beta',
          ] as CriticalCard[],
          targetPlayerId: 'p2',
          requestedCard: 'strike' as CriticalCard,
        },
      );
      expect(result.success).toBe(true);
      expect(result.state!.players[0].hand).toContain('strike');
      expect(result.state!.players[1].hand).not.toContain('strike');
    });

    it('should handle target not having the requested card', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].hand = [
        'collection_gamma',
        'collection_gamma',
        'collection_gamma',
        'neutralizer',
      ];
      state.players[1].hand = ['evade', 'trade'];

      const result = engine.executeAction(
        state,
        'play_cat_combo',
        createMockContext('p1'),
        {
          cards: [
            'collection_gamma',
            'collection_gamma',
            'collection_gamma',
          ] as CriticalCard[],
          targetPlayerId: 'p2',
          requestedCard: 'strike' as CriticalCard,
        },
      );
      expect(result.success).toBe(true);
      // Target didn't have the card, but combo still succeeds
      const log = result.state!.logs.find((l) =>
        l.message.includes("didn't have"),
      );
      expect(log).toBeDefined();
    });
  });

  describe('Fiver combo (5 different cards)', () => {
    it('should take a card from discard pile', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].hand = [
        'collection_alpha',
        'collection_beta',
        'collection_gamma',
        'collection_delta',
        'collection_epsilon',
        'neutralizer',
      ];
      state.discardPile = ['strike', 'evade'];

      const result = engine.executeAction(
        state,
        'play_cat_combo',
        createMockContext('p1'),
        {
          cards: [
            'collection_alpha',
            'collection_beta',
            'collection_gamma',
            'collection_delta',
            'collection_epsilon',
          ] as CriticalCard[],
          requestedDiscardCard: 'strike' as CriticalCard,
        },
      );
      expect(result.success).toBe(true);
      expect(result.state!.players[0].hand).toContain('strike');
      expect(result.state!.discardPile).not.toContain('strike');
    });

    it('should fail if requested card not in discard', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].hand = [
        'collection_alpha',
        'collection_beta',
        'collection_gamma',
        'collection_delta',
        'collection_epsilon',
        'neutralizer',
      ];
      state.discardPile = ['evade'];

      const result = engine.executeAction(
        state,
        'play_cat_combo',
        createMockContext('p1'),
        {
          cards: [
            'collection_alpha',
            'collection_beta',
            'collection_gamma',
            'collection_delta',
            'collection_epsilon',
          ] as CriticalCard[],
          requestedDiscardCard: 'strike' as CriticalCard,
        },
      );
      expect(result.success).toBe(false);
    });
  });

  describe('Combo validation', () => {
    it('should reject combo with less than 2 cards', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].hand = ['collection_alpha', 'neutralizer'];

      const result = engine.executeAction(
        state,
        'play_cat_combo',
        createMockContext('p1'),
        {
          cards: ['collection_alpha'] as CriticalCard[],
          targetPlayerId: 'p2',
        },
      );
      expect(result.success).toBe(false);
    });

    it('should reject combo with non-matching cards', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].hand = [
        'collection_alpha',
        'collection_beta',
        'neutralizer',
      ];

      const result = engine.executeAction(
        state,
        'play_cat_combo',
        createMockContext('p1'),
        {
          cards: ['collection_alpha', 'collection_beta'] as CriticalCard[],
          targetPlayerId: 'p2',
          selectedIndex: 0,
        },
      );
      expect(result.success).toBe(false);
    });
  });
});
