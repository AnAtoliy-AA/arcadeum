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
});
