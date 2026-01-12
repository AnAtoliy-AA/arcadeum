import { Test, TestingModule } from '@nestjs/testing';
import { CriticalEngine } from './critical.engine';
import { GameActionContext } from '../base/game-engine.interface';

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
    state.deck = ['skip', 'skip', 'skip', 'skip'];

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

  it('should set pendingDraws to 2 when Attack is played', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);

    // Give Player 1 an Attack card
    state.players[0].hand.push('attack');

    // Player 1 plays Attack
    const result = engine.executeAction(
      state,
      'play_card',
      createMockContext('p1'),
      { card: 'attack' },
    );
    expect(result.success).toBe(true);

    // Turn should have advanced to Player 2
    expect(result.state!.currentTurnIndex).toBe(1);

    // Player 2 should have 2 pending draws
    expect(result.state!.pendingDraws).toBe(2);
  });

  it('should decrement pendingDraws to 0 and advance turn when Skip is played', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);

    // Give Player 1 a Skip card
    state.players[0].hand.push('skip');

    // Player 1 plays Skip (has 1 pending draw by default)
    const result = engine.executeAction(
      state,
      'play_card',
      createMockContext('p1'),
      { card: 'skip' },
    );
    expect(result.success).toBe(true);

    // Turn should have advanced to Player 2 (since pendingDraws went from 1 to 0)
    expect(result.state!.currentTurnIndex).toBe(1);

    // Player 2 should have 1 pending draw (new turn)
    expect(result.state!.pendingDraws).toBe(1);
  });

  it('should only cancel one pending draw when Skip is played after Attack', () => {
    const playerIds = ['p1', 'p2'];
    const state = engine.initializeState(playerIds);

    // Give Player 1 an Attack card
    state.players[0].hand.push('attack');

    // Player 1 plays Attack
    const attackResult = engine.executeAction(
      state,
      'play_card',
      createMockContext('p1'),
      { card: 'attack' },
    );
    expect(attackResult.success).toBe(true);
    expect(attackResult.state!.currentTurnIndex).toBe(1); // Player 2's turn
    expect(attackResult.state!.pendingDraws).toBe(2); // Player 2 has 2 pending draws

    // Give Player 2 a Skip card
    attackResult.state!.players[1].hand.push('skip');

    // Player 2 plays Skip (should only cancel 1 draw)
    const skipResult = engine.executeAction(
      attackResult.state!,
      'play_card',
      createMockContext('p2'),
      { card: 'skip' },
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
});
