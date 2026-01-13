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

describe('CriticalEngine', () => {
  let engine: CriticalEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CriticalEngine],
    }).compile();

    engine = module.get<CriticalEngine>(CriticalEngine);
  });

  it('should reset pendingDraws to 1 when turn advances after drawing a card', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);

    // Ensure deck has safe cards
    state.deck = ['evade', 'evade', 'evade', 'evade'];

    // Player 1 draws a card
    const result = engine.executeAction(
      state,
      'draw_card',
      createMockContext('p1'),
    );
    expect(result.success).toBe(true);

    // Turn should have advanced to Player 2
    expect(result.state!.currentTurnIndex).toBe(1);

    // Player 2 should have 1 pending draw
    expect(result.state!.pendingDraws).toBe(1);

    // Player 2 should be able to draw
    const result2 = engine.executeAction(
      result.state!,
      'draw_card',
      createMockContext('p2'),
    );
    expect(result2.success).toBe(true);
  });

  it('should set pendingDraws to 2 when Strike is played', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);

    // Give Player 1 a Strike card
    state.players[0].hand.push('strike');

    // Player 1 plays Strike
    const result = engine.executeAction(
      state,
      'play_card',
      createMockContext('p1'),
      { card: 'strike' },
    );
    expect(result.success).toBe(true);

    // Turn should have advanced to Player 2
    expect(result.state!.currentTurnIndex).toBe(1);

    // Player 2 should have 2 pending draws
    expect(result.state!.pendingDraws).toBe(2);
  });

  it('should decrement pendingDraws to 0 and advance turn when Evade is played', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);

    // Give Player 1 an Evade card
    state.players[0].hand.push('evade');

    // Player 1 plays Evade (has 1 pending draw by default)
    const result = engine.executeAction(
      state,
      'play_card',
      createMockContext('p1'),
      { card: 'evade' },
    );
    expect(result.success).toBe(true);

    // Turn should have advanced to Player 2 (since pendingDraws went from 1 to 0)
    expect(result.state!.currentTurnIndex).toBe(1);

    // Player 2 should have 1 pending draw (new turn)
    expect(result.state!.pendingDraws).toBe(1);
  });

  it('should only cancel one pending draw when Evade is played after Strike', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);

    // Give Player 1 a Strike card
    state.players[0].hand.push('strike');

    // Player 1 plays Strike
    const attackResult = engine.executeAction(
      state,
      'play_card',
      createMockContext('p1'),
      { card: 'strike' },
    );
    expect(attackResult.success).toBe(true);
    expect(attackResult.state!.currentTurnIndex).toBe(1); // Player 2's turn
    expect(attackResult.state!.pendingDraws).toBe(2); // Player 2 has 2 pending draws

    // Give Player 2 an Evade card
    attackResult.state!.players[1].hand.push('evade');

    // Player 2 plays Evade (should only cancel 1 draw)
    const skipResult = engine.executeAction(
      attackResult.state!,
      'play_card',
      createMockContext('p2'),
      { card: 'evade' },
    );
    expect(skipResult.success).toBe(true);

    // Turn should NOT advance - still Player 2's turn
    expect(skipResult.state!.currentTurnIndex).toBe(1);

    // Player 2 should have 1 pending draw remaining
    expect(skipResult.state!.pendingDraws).toBe(1);
  });

  describe('sanitizeStateForPlayer - log filtering', () => {
    it('should filter player-only logs for spectators', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.logs = [
        {
          id: '1',
          type: 'message',
          message: 'public msg',
          scope: 'all',
          createdAt: '',
        },
        {
          id: '2',
          type: 'message',
          message: 'private msg',
          scope: 'players',
          createdAt: '',
        },
        { id: '3', type: 'system', message: 'system msg', createdAt: '' }, // undefined scope = public
      ];

      // Spectator (non-participant) should only see public logs
      const sanitized = engine.sanitizeStateForPlayer(state, 'spectator');
      expect(sanitized.logs?.length).toBe(2);
      expect(sanitized.logs?.map((l) => l.id)).toEqual(['1', '3']);
    });

    it('should show player-only logs to game participants', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.logs = [
        {
          id: '1',
          type: 'message',
          message: 'public msg',
          scope: 'all',
          createdAt: '',
        },
        {
          id: '2',
          type: 'message',
          message: 'private msg',
          scope: 'players',
          createdAt: '',
        },
      ];

      // Player should see both logs
      const sanitized = engine.sanitizeStateForPlayer(state, 'p1');
      expect(sanitized.logs?.length).toBe(2);
    });

    it('should show private logs only to the sender', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.logs = [
        {
          id: '1',
          type: 'message',
          message: 'public',
          scope: 'all',
          createdAt: '',
        },
        {
          id: '2',
          type: 'message',
          message: 'p1 private',
          scope: 'private',
          senderId: 'p1',
          createdAt: '',
        },
        {
          id: '3',
          type: 'message',
          message: 'p2 private',
          scope: 'private',
          senderId: 'p2',
          createdAt: '',
        },
      ];

      // p1 should see their private log but not p2's
      const sanitizedP1 = engine.sanitizeStateForPlayer(state, 'p1');
      expect(sanitizedP1.logs?.length).toBe(2);
      expect(sanitizedP1.logs?.map((l) => l.id)).toEqual(['1', '2']);

      // p2 should see their private log but not p1's
      const sanitizedP2 = engine.sanitizeStateForPlayer(state, 'p2');
      expect(sanitizedP2.logs?.length).toBe(2);
      expect(sanitizedP2.logs?.map((l) => l.id)).toEqual(['1', '3']);
    });
  });

  describe('Deck initialization with expansions', () => {
    it('should have 44 cards for 2 players with no expansions', () => {
      const state = engine.initializeState(['p1', 'p2'], { expansions: [] });
      expect(state.deck.length).toBe(44);
    });

    it('should have 56 cards for 2 players with Theft Pack (+12 cards)', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['theft'],
      });
      expect(state.deck.length).toBe(56);
    });

    it('should have 57 cards for 2 players with Attack Pack (+13 cards)', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['attack'],
      });
      expect(state.deck.length).toBe(57);
    });

    it('should have 69 cards for 2 players with Future Pack (+25 cards)', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['future'],
      });
      expect(state.deck.length).toBe(69);
    });

    it('should have 94 cards for 2 players with all expansions (+50 cards)', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['theft', 'attack', 'future'],
      });
      expect(state.deck.length).toBe(94);
    });

    it('should respect custom card counts', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['theft'],
        customCards: {
          wildcard: 10, // +6 from default 4
        },
      });
      // 56 (default theft) + 6 extra wildcards = 62
      expect(state.deck.length).toBe(62);
    });
  });

  describe('Theft Pack Actions', () => {
    it('should allow playing stash with 1-3 cards', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['theft'],
      });
      const p1 = state.players[0];
      p1.hand = ['stash', 'neutralizer', 'strike', 'evade'];

      const context = createMockContext('p1');
      const payload = {
        card: 'stash' as const,
        cardsToStash: ['neutralizer', 'strike'] as CriticalCard[],
      };

      const result = engine.executeAction(state, 'play_card', context, payload);

      expect(result.success).toBe(true);
      expect(result.state?.players[0].stash).toContain('neutralizer');
      expect(result.state?.players[0].stash).toContain('strike');
      expect(result.state?.players[0].hand).not.toContain('neutralizer');
      expect(result.state?.players[0].hand).not.toContain('strike');
    });

    it('should fail stash if no cards provided', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['theft'],
      });
      const p1 = state.players[0];
      p1.hand = ['stash', 'neutralizer'];

      const context = createMockContext('p1');
      const payload = {
        card: 'stash' as const,
        cardsToStash: [] as CriticalCard[],
      };

      const result = engine.executeAction(state, 'play_card', context, payload);
      expect(result.success).toBe(false);
    });

    it('should allow playing mark on a target player', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['theft'],
      });
      state.players[0].hand = ['mark'];
      state.players[1].hand = ['strike', 'evade'];

      const context = createMockContext('p1');
      const payload = { card: 'mark' as const, targetPlayerId: 'p2' };

      const result = engine.executeAction(state, 'play_card', context, payload);
      expect(result.success).toBe(true);
      expect(result.state?.players[1].markedCards.length).toBe(1);
    });

    it('should allow playing steal_draw on a target player', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        expansions: ['theft'],
      });
      state.players[0].hand = ['steal_draw'];

      const context = createMockContext('p1');
      const payload = { card: 'steal_draw' as const, targetPlayerId: 'p2' };

      const result = engine.executeAction(state, 'play_card', context, payload);
      expect(result.success).toBe(true);
      expect(result.state?.players[1].pendingStealDraw).toBe('p1');
    });

    it('should unstash cards', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].stash = ['strike'];
      state.players[0].hand = ['neutralizer'];

      const context = createMockContext('p1');
      const payload = { card: 'unstash', cardsToUnstash: ['strike'] };

      const result = engine.executeAction(state, 'play_card', context, payload);
      expect(result.success).toBe(true);
      expect(result.state?.players[0].stash).toHaveLength(0);
      expect(result.state?.players[0].hand).toContain('strike');
    });

    it('should fail unstash if cards not in stash', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].stash = ['strike'];

      const context = createMockContext('p1');
      const payload = { card: 'unstash', cardsToUnstash: ['evade'] };

      const result = engine.executeAction(state, 'play_card', context, payload);
      expect(result.success).toBe(false);
    });
  });
});
