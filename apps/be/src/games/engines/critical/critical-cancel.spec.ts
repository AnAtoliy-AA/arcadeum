import { Test, TestingModule } from '@nestjs/testing';
import { CriticalEngine } from './critical.engine';
import { GameActionContext } from '../base/game-engine.interface';
import { CriticalState } from '../../critical/critical.state';

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

describe('CriticalCancel', () => {
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

  describe('Cancel basic Strike', () => {
    it('should cancel a Strike and restore turn to attacker', () => {
      const state = makeState(['p1', 'p2']);
      state.players[0].hand.push('strike');
      state.players[1].hand.push('cancel');

      // p1 plays Strike
      const attackResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'strike' },
      );
      expect(attackResult.success).toBe(true);
      expect(attackResult.state!.pendingDraws).toBe(2);
      expect(attackResult.state!.currentTurnIndex).toBe(1);

      // p2 plays Cancel
      const cancelResult = engine.executeAction(
        attackResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      // Turn should go back to p1
      expect(cancelResult.state!.currentTurnIndex).toBe(0);
      expect(cancelResult.state!.pendingDraws).toBe(1);
    });

    it('should un-cancel when second Cancel is played', () => {
      const state = makeState(['p1', 'p2', 'p3']);
      state.players[0].hand = ['strike'];
      state.players[1].hand = ['cancel', 'cancel'];
      state.players[2].hand = ['cancel'];

      // p1 plays Strike
      const attackResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'strike' },
      );
      expect(attackResult.success).toBe(true);

      // p2 cancels
      const cancel1 = engine.executeAction(
        attackResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancel1.success).toBe(true);
      expect(cancel1.state!.currentTurnIndex).toBe(0); // back to p1

      // p3 un-cancels
      const cancel2 = engine.executeAction(
        cancel1.state!,
        'play_cancel',
        createMockContext('p3'),
      );
      expect(cancel2.success).toBe(true);
      expect(cancel2.state!.currentTurnIndex).toBe(1); // back to p2 (target)
      expect(cancel2.state!.pendingDraws).toBe(2);
    });
  });

  describe('Cancel Targeted Strike', () => {
    it('should cancel targeted strike and restore turn', () => {
      const state = makeState(['p1', 'p2', 'p3']);
      state.players[0].hand = ['targeted_strike'];
      state.players[1].hand = ['cancel'];

      const attackResult = engine.executeAction(
        state,
        'targeted_strike',
        createMockContext('p1'),
        { targetPlayerId: 'p3' },
      );
      expect(attackResult.success).toBe(true);
      expect(attackResult.state!.currentTurnIndex).toBe(2); // p3's turn

      const cancelResult = engine.executeAction(
        attackResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.state!.currentTurnIndex).toBe(0); // back to p1
    });
  });

  describe('Cancel Evade (Skip)', () => {
    it('should cancel skip and restore turn', () => {
      const state = makeState(['p1', 'p2']);
      state.players[0].hand = ['evade'];
      state.players[1].hand = ['cancel'];

      const skipResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'evade' },
      );
      expect(skipResult.success).toBe(true);
      expect(skipResult.state!.currentTurnIndex).toBe(1); // turn advanced

      const cancelResult = engine.executeAction(
        skipResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.state!.currentTurnIndex).toBe(0); // back to p1
    });
  });

  describe('Cancel Smite', () => {
    it('should cancel smite and restore turn', () => {
      const state = makeState(['p1', 'p2'], { expansions: ['deity'] });
      state.players[0].hand = ['smite'];
      state.players[1].hand = ['cancel'];

      const smiteResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'smite', targetPlayerId: 'p2' },
      );
      expect(smiteResult.success).toBe(true);
      expect(smiteResult.state!.pendingDraws).toBe(3);

      const cancelResult = engine.executeAction(
        smiteResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.state!.currentTurnIndex).toBe(0);
      expect(cancelResult.state!.pendingDraws).toBe(1);
    });
  });

  describe('Cancel Miracle', () => {
    it('should cancel miracle and remove the neutralizer', () => {
      const state = makeState(['p1', 'p2'], { expansions: ['deity'] });
      state.players[0].hand = ['miracle'];
      state.players[1].hand = ['cancel'];

      const miracleResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'miracle' },
      );
      expect(miracleResult.success).toBe(true);
      expect(
        miracleResult.state!.players[0].hand.filter((c) => c === 'neutralizer')
          .length,
      ).toBeGreaterThanOrEqual(1);

      const cancelResult = engine.executeAction(
        miracleResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      // The extra neutralizer should be removed
      const originalDefuses = state.players[0].hand.filter(
        (c) => c === 'neutralizer',
      ).length;
      const afterDefuses = cancelResult.state!.players[0].hand.filter(
        (c) => c === 'neutralizer',
      ).length;
      expect(afterDefuses).toBe(originalDefuses);
    });
  });

  describe('Cancel Mark', () => {
    it('should cancel mark and remove the mark from target', () => {
      const state = makeState(['p1', 'p2'], { expansions: ['theft'] });
      state.players[0].hand = ['mark'];
      state.players[1].hand = ['cancel', 'strike', 'evade'];

      const markResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'mark', targetPlayerId: 'p2' },
      );
      expect(markResult.success).toBe(true);
      expect(markResult.state!.players[1].markedCards.length).toBe(1);

      const cancelResult = engine.executeAction(
        markResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.state!.players[1].markedCards.length).toBe(0);
    });
  });

  describe('Cancel Swap Hands', () => {
    it('should cancel swap hands and restore original hands', () => {
      const state = makeState(['p1', 'p2', 'p3'], {
        expansions: ['theft'],
      });
      state.players[0].hand = ['swap_hands', 'neutralizer'];
      // p3 has cancel so they can cancel after hands are swapped
      state.players[2].hand = ['cancel'];

      const swapResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'swap_hands', targetPlayerId: 'p2' },
      );
      expect(swapResult.success).toBe(true);

      const cancelResult = engine.executeAction(
        swapResult.state!,
        'play_cancel',
        createMockContext('p3'),
      );
      expect(cancelResult.success).toBe(true);
      // p1 should have original hand (minus swap_hands which was played)
      expect(cancelResult.state!.players[0].hand).toContain('neutralizer');
    });
  });

  describe('Cancel Steal Draw', () => {
    it('should cancel steal draw and clear pendingStealDraw', () => {
      const state = makeState(['p1', 'p2'], { expansions: ['theft'] });
      state.players[0].hand = ['steal_draw'];
      state.players[1].hand = ['cancel'];

      const stealResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'steal_draw', targetPlayerId: 'p2' },
      );
      expect(stealResult.success).toBe(true);
      expect(stealResult.state!.players[1].pendingStealDraw).toBe('p1');

      const cancelResult = engine.executeAction(
        stealResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.state!.players[1].pendingStealDraw).toBeUndefined();
    });
  });

  describe('Cancel Resurrection', () => {
    it('should cancel resurrection and re-eliminate the player', () => {
      const state = makeState(['p1', 'p2', 'p3'], {
        expansions: ['deity'],
      });
      state.players[2].alive = false;
      state.eliminatedPlayers = ['p3'];
      state.players[0].hand = ['resurrection'];
      state.players[1].hand = ['cancel'];

      const resResult = engine.executeAction(
        state,
        'play_card',
        createMockContext('p1'),
        { card: 'resurrection' },
      );
      expect(resResult.success).toBe(true);
      expect(resResult.state!.players[2].alive).toBe(true);

      const cancelResult = engine.executeAction(
        resResult.state!,
        'play_cancel',
        createMockContext('p2'),
      );
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.state!.players[2].alive).toBe(false);
    });
  });

  describe('Cancel without pending action', () => {
    it('should fail when no action is pending', () => {
      const state = makeState(['p1', 'p2']);
      state.players[0].hand = ['cancel'];

      const result = engine.executeAction(
        state,
        'play_cancel',
        createMockContext('p1'),
      );
      expect(result.success).toBe(false);
    });
  });
});
