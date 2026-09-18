import { CatDashEngine } from './cat-dash.engine';
import type { CatDashState } from './cat-dash.types';
import type { GameActionContext } from '../base/game-engine.interface';

function ctx(userId: string): GameActionContext {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  };
}

describe('CatDashEngine', () => {
  const engine = new CatDashEngine();

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = engine.getMetadata();
      expect(meta.gameId).toBe('cat_dash_v1');
      expect(meta.name).toBe('Cat Dash');
      expect(meta.minPlayers).toBe(2);
      expect(meta.maxPlayers).toBe(6);
    });
  });

  describe('initializeState', () => {
    it('creates a state with correct player count', () => {
      const state = engine.initializeState(['p1', 'p2', 'p3']);
      expect(state.players).toHaveLength(3);
      expect(state.track).toBeDefined();
      expect(state.track.length).toBeGreaterThan(0);
      expect(state.gameOver).toBe(false);
      expect(state.logs.length).toBeGreaterThan(0);
    });

    it('assigns cat IDs to players', () => {
      const state = engine.initializeState(['p1', 'p2']);
      expect(state.players[0].catId).toBeDefined();
      expect(state.players[1].catId).toBeDefined();
    });

    it('starts all players at position 0', () => {
      const state = engine.initializeState(['p1', 'p2']);
      for (const player of state.players) {
        expect(player.position).toBe(0);
      }
    });
  });

  describe('validateAction', () => {
    it('allows rollDice for current player', () => {
      const state = engine.initializeState(['p1', 'p2']);
      expect(engine.validateAction(state, 'rollDice', ctx('p1'))).toBe(true);
    });

    it('rejects rollDice for non-current player', () => {
      const state = engine.initializeState(['p1', 'p2']);
      expect(engine.validateAction(state, 'rollDice', ctx('p2'))).toBe(false);
    });

    it('rejects actions when game is over', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.gameOver = true;
      expect(engine.validateAction(state, 'rollDice', ctx('p1'))).toBe(false);
    });
  });

  describe('executeAction - rollDice', () => {
    it('moves the player forward', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const result = engine.executeAction(state, 'rollDice', ctx('p1'));
      expect(result.success).toBe(true);
      const newState = result.state as CatDashState;
      expect(newState.players[0].position).toBeGreaterThan(0);
    });

    it('advances turn after roll', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const result = engine.executeAction(state, 'rollDice', ctx('p1'));
      const newState = result.state as CatDashState;
      expect(newState.currentPlayerIndex).toBe(1);
    });

    it('adds a log entry', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const result = engine.executeAction(state, 'rollDice', ctx('p1'));
      const newState = result.state as CatDashState;
      expect(newState.logs.length).toBeGreaterThan(1);
    });
  });

  describe('isGameOver / getWinners', () => {
    it('returns false when game is not over', () => {
      const state = engine.initializeState(['p1', 'p2']);
      expect(engine.isGameOver(state)).toBe(false);
      expect(engine.getWinners(state)).toEqual([]);
    });

    it('returns true when game is over with winner', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.gameOver = true;
      state.winner = 'p1';
      expect(engine.isGameOver(state)).toBe(true);
      expect(engine.getWinners(state)).toEqual(['p1']);
    });
  });

  describe('getAvailableActions', () => {
    it('returns rollDice for current player', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const actions = engine.getAvailableActions(state, 'p1');
      expect(actions).toContain('rollDice');
    });

    it('returns empty for non-current player', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const actions = engine.getAvailableActions(state, 'p2');
      expect(actions).toEqual([]);
    });

    it('returns empty when game is over', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.gameOver = true;
      const actions = engine.getAvailableActions(state, 'p1');
      expect(actions).toEqual([]);
    });
  });

  describe('sanitizeStateForPlayer', () => {
    it('hides abilities from other players', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].abilitiesUsed = ['ability_1'];
      const sanitized = engine.sanitizeStateForPlayer(
        state,
        'p2',
      ) as CatDashState;
      expect(sanitized.players[0].abilitiesUsed).toEqual([]);
    });

    it('keeps own abilities visible', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].abilitiesUsed = ['ability_1'];
      const sanitized = engine.sanitizeStateForPlayer(
        state,
        'p1',
      ) as CatDashState;
      expect(sanitized.players[0].abilitiesUsed).toEqual(['ability_1']);
    });
  });

  describe('getResult', () => {
    it('returns no winner when game is not over', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const result = engine.getResult(state);
      expect(result.winnerIds).toEqual([]);
      expect(result.isDraw).toBe(false);
    });

    it('returns winner when game is over', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.gameOver = true;
      state.winner = 'p1';
      const result = engine.getResult(state);
      expect(result.winnerIds).toEqual(['p1']);
      expect(result.isDraw).toBe(false);
    });
  });

  describe('tactical mechanics: abilities, collision bumping, drafting', () => {
    it('applies speed boost and burns power token', () => {
      const state = engine.initializeState(['p1', 'p2']);
      expect(state.players[0].powerTokens).toBe(3);

      const abilityRes = engine.executeAction(
        state,
        'useAbility',
        ctx('p1'),
        { abilityId: 'neon_boost' },
      );
      expect(abilityRes.success).toBe(true);
      const s1 = abilityRes.state as CatDashState;
      expect(s1.players[0].powerTokens).toBe(2);
      expect(s1.players[0].speedBoostPending).toBe(3);

      const rollRes = engine.executeAction(s1, 'rollDice', ctx('p1'));
      expect(rollRes.success).toBe(true);
      const s2 = rollRes.state as CatDashState;
      expect(s2.players[0].position).toBeGreaterThanOrEqual(4);
    });

    it('activates shield and absorbs obstacle', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const abilityRes = engine.executeAction(
        state,
        'useAbility',
        ctx('p1'),
        { abilityId: 'neon_shield' },
      );
      expect(abilityRes.success).toBe(true);
      const s1 = abilityRes.state as CatDashState;
      expect(s1.players[0].shielded).toBe(true);
    });

    it('slingshots player ahead of nearest rival', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].catId = 'whiskers';
      state.players[0].position = 2;
      state.players[1].position = 6;

      const abilityRes = engine.executeAction(
        state,
        'useAbility',
        ctx('p1'),
        { abilityId: 'whiskers_slingshot' },
      );
      expect(abilityRes.success).toBe(true);
      const s1 = abilityRes.state as CatDashState;
      expect(s1.players[0].position).toBe(8);
    });

    it('bumps non-shielded rival back 1 space on collision', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].position = 0;
      state.players[0].speedBoostPending = 999; // exact roll 4
      state.players[1].position = 4; // rival waiting at 4
      state.players[1].shielded = false;

      const rollRes = engine.executeAction(state, 'rollDice', ctx('p1'));
      expect(rollRes.success).toBe(true);
      const s1 = rollRes.state as CatDashState;
      expect(s1.players[0].position).toBe(4);
      expect(s1.players[1].position).toBe(3); // rival bumped back
    });

    it('absorbs bump if rival is shielded', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].position = 0;
      state.players[0].speedBoostPending = 999; // exact roll 4
      state.players[1].position = 4;
      state.players[1].shielded = true;

      const rollRes = engine.executeAction(state, 'rollDice', ctx('p1'));
      expect(rollRes.success).toBe(true);
      const s1 = rollRes.state as CatDashState;
      expect(s1.players[0].position).toBe(4);
      expect(s1.players[1].position).toBe(4); // not bumped
      expect(s1.players[1].shielded).toBe(false); // shield consumed
    });

    it('grants drafting slipstream +1 boost when stopping directly behind rival', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.players[0].position = 0;
      state.players[0].speedBoostPending = 999; // rolls 4
      state.players[1].position = 5; // rival at 5, so landing on 4 is directly behind

      const rollRes = engine.executeAction(state, 'rollDice', ctx('p1'));
      expect(rollRes.success).toBe(true);
      const s1 = rollRes.state as CatDashState;
      // Landing at 4 behind 5 gives drafting boost to 5, which then bumps rival at 5 to 4!
      expect(s1.players[0].position).toBe(5);
      expect(s1.players[1].position).toBe(4);
    });
  });
});
