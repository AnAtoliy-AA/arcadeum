import { CheckersEngine } from './checkers.engine';
import { GAME_PHASE, BOARD_SIZE } from './checkers.constants';
import {
  ctx,
  s,
  singleStep,
  capture,
  multiCapture,
} from './checkers-test-utils';
import type { MovePayload } from './checkers.types';

const engine = new CheckersEngine();
type CheckersState = ReturnType<typeof engine.initializeState>;

function clearBoard(state: CheckersState): void {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      state.board[r][c] = null;
    }
  }
}

function doMove(state: CheckersState, userId: string, payload: MovePayload) {
  return engine.executeAction(state, 'move_piece', ctx(userId), payload);
}

describe('CheckersEngine', () => {
  describe('metadata', () => {
    it('returns correct gameId, min/max players, category', () => {
      const m = engine.getMetadata();
      expect(m.gameId).toBe('checkers_v1');
      expect(m.minPlayers).toBe(2);
      expect(m.maxPlayers).toBe(2);
      expect(m.category).toBe('Board Game');
    });
  });

  describe('initializeState', () => {
    it('builds an 8x8 board with correct initial setup', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(state.board).toHaveLength(BOARD_SIZE);
      expect(state.board[0]).toHaveLength(BOARD_SIZE);
      expect(state.phase).toBe(GAME_PHASE.PLAYING);
      expect(state.players).toHaveLength(2);
      expect(state.players[0].playerId).toBe('a');
      expect(state.players[0].color).toBe('light');
      expect(state.players[1].playerId).toBe('b');
      expect(state.players[1].color).toBe('dark');
      expect(state.currentTurnIndex).toBe(0);
      expect(state.playerOrder).toEqual(['a', 'b']);
    });

    it('places 12 dark pieces (rows 0-2) and 12 light pieces (rows 5-7)', () => {
      const state = engine.initializeState(['a', 'b']);
      let darkCount = 0;
      let lightCount = 0;
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const p = state.board[row][col]?.playerId;
          if (p === 'b' && row < 3) darkCount++;
          if (p === 'a' && row >= 5) lightCount++;
        }
      }
      expect(darkCount).toBe(12);
      expect(lightCount).toBe(12);
    });

    it('has no pieces on light squares', () => {
      const state = engine.initializeState(['a', 'b']);
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if ((row + col) % 2 === 0) {
            expect(state.board[row][col]).toBeNull();
          }
        }
      }
    });

    it('applies custom options', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { forcedCaptures: false, variant: 'neon' },
      });
      expect(state.options.forcedCaptures).toBe(false);
      expect(state.options.variant).toBe('neon');
    });
  });

  describe('simple moves', () => {
    it('allows a valid diagonal move for light (player a)', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = doMove(state, 'a', singleStep(5, 0, 4, 1));
      expect(result.success).toBe(true);
      expect(result.state!.board[5][0]).toBeNull();
      expect(result.state!.board[4][1]).not.toBeNull();
      expect(result.state!.board[4][1]!.playerId).toBe('a');
    });

    it('allows a valid diagonal move for dark (player b)', () => {
      const state = engine.initializeState(['a', 'b']);
      const r1 = doMove(state, 'a', singleStep(5, 0, 4, 1));
      expect(r1.success).toBe(true);
      const r2 = doMove(r1.state!, 'b', singleStep(2, 1, 3, 0));
      expect(r2.success).toBe(true);
      expect(r2.state!.board[2][1]).toBeNull();
      expect(r2.state!.board[3][0]!.playerId).toBe('b');
    });

    it('rejects invalid moves (non-diagonal, occupied, out-of-turn, out-of-bounds)', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(doMove(state, 'a', singleStep(5, 0, 5, 1)).success).toBe(false);
      const r1 = doMove(state, 'a', singleStep(5, 0, 4, 1));
      const r2 = doMove(r1.state!, 'b', singleStep(2, 1, 3, 0));
      expect(doMove(r2.state!, 'a', singleStep(4, 1, 3, 0)).success).toBe(
        false,
      );
      expect(doMove(state, 'b', singleStep(2, 1, 3, 0)).success).toBe(false);
      expect(doMove(state, 'a', singleStep(5, 0, -1, 0)).success).toBe(false);
    });

    it('advances turn after move', () => {
      const state = engine.initializeState(['a', 'b']);
      const r1 = doMove(state, 'a', singleStep(5, 0, 4, 1));
      expect(r1.state!.currentTurnIndex).toBe(1);
      expect(r1.state!.playerOrder[r1.state!.currentTurnIndex]).toBe('b');
    });
  });

  describe('captures', () => {
    it('captures an opponent piece', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[4][1] = { playerId: 'a', type: 'man' };
      state.board[3][2] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', capture(4, 1, 2, 3, 3, 2));
      expect(result.success).toBe(true);
      expect(result.state!.board[4][1]).toBeNull();
      expect(result.state!.board[3][2]).toBeNull();
      expect(result.state!.board[2][3]!.playerId).toBe('a');
    });
  });

  describe('forced captures', () => {
    it('forces a capture when available', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[4][1] = { playerId: 'a', type: 'man' };
      state.board[3][2] = { playerId: 'b', type: 'man' };
      state.board[5][4] = { playerId: 'a', type: 'man' };
      state.board[4][5] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', singleStep(5, 4, 3, 6));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/capture/i);
    });
  });

  describe('multi-jump', () => {
    it('allows a multi-jump chain in a single payload', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[5][0] = { playerId: 'a', type: 'man' };
      state.board[4][1] = { playerId: 'b', type: 'man' };
      state.board[2][3] = { playerId: 'b', type: 'man' };
      const result = doMove(
        state,
        'a',
        multiCapture([s(5, 0, 3, 2, 4, 1), s(3, 2, 1, 4, 2, 3)]),
      );
      expect(result.success).toBe(true);
      expect(result.state!.board[5][0]).toBeNull();
      expect(result.state!.board[4][1]).toBeNull();
      expect(result.state!.board[3][2]).toBeNull();
      expect(result.state!.board[2][3]).toBeNull();
      expect(result.state!.board[1][4]!.playerId).toBe('a');
    });

    it('allows a multi-jump chain with promotion and continues as king in russian variant', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: {
          mode: 'russian',
          forcedCaptures: true,
          variant: 'classic',
          backwardCaptures: false,
        },
      });
      clearBoard(state);
      state.board[2][1] = { playerId: 'a', type: 'man' };
      state.board[1][2] = { playerId: 'b', type: 'man' };
      state.board[1][4] = { playerId: 'b', type: 'man' };

      const result = doMove(
        state,
        'a',
        multiCapture([s(2, 1, 0, 3, 1, 2), s(0, 3, 2, 5, 1, 4)]),
      );
      expect(result.success).toBe(true);
      expect(result.state!.board[2][5]!.type).toBe('king');
      expect(result.state!.board[1][2]).toBeNull();
      expect(result.state!.board[1][4]).toBeNull();
    });

    it('rejects multi-jump with disconnected steps', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[5][0] = { playerId: 'a', type: 'man' };
      state.board[4][1] = { playerId: 'b', type: 'man' };
      const result = doMove(
        state,
        'a',
        multiCapture([s(5, 0, 3, 2, 4, 1), s(1, 4, 3, 2)]),
      );
      expect(result.success).toBe(false);
    });
  });

  describe('king promotion', () => {
    it('promotes light piece to king when reaching row 0', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[1][0] = { playerId: 'a', type: 'man' };
      const result = doMove(state, 'a', singleStep(1, 0, 0, 1));
      expect(result.success).toBe(true);
      expect(result.state!.board[0][1]!.type).toBe('king');
      expect(result.state!.board[0][1]!.playerId).toBe('a');
    });

    it('promotes dark piece to king when reaching row 7', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[5][2] = { playerId: 'a', type: 'man' };
      state.board[6][1] = { playerId: 'b', type: 'man' };
      const r1 = doMove(state, 'a', singleStep(5, 2, 4, 3));
      expect(r1.success).toBe(true);
      const r2 = doMove(r1.state!, 'b', singleStep(6, 1, 7, 0));
      expect(r2.success).toBe(true);
      expect(r2.state!.board[7][0]!.type).toBe('king');
    });
  });

  describe('king movement', () => {
    it('king can move backward and forward diagonally', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[3][3] = { playerId: 'a', type: 'king' };
      state.board[5][0] = { playerId: 'b', type: 'man' };
      const r1 = doMove(state, 'a', singleStep(3, 3, 2, 2));
      expect(r1.success).toBe(true);
      expect(r1.state!.board[2][2]!.type).toBe('king');
      const r2 = doMove(r1.state!, 'b', singleStep(5, 0, 6, 1));
      expect(r2.success).toBe(true);
      const r3 = doMove(r2.state!, 'a', singleStep(2, 2, 3, 3));
      expect(r3.success).toBe(true);
      expect(r3.state!.board[3][3]!.type).toBe('king');
    });

    it('king can capture in all four diagonal directions', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[3][3] = { playerId: 'a', type: 'king' };
      state.board[2][2] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', capture(3, 3, 1, 1, 2, 2));
      expect(result.success).toBe(true);
      expect(result.state!.board[1][1]!.type).toBe('king');
      expect(result.state!.board[2][2]).toBeNull();
      expect(result.state!.board[3][3]).toBeNull();
    });
  });

  describe('forfeit', () => {
    it('ends game with opponent as winner', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = engine.executeAction(state, 'forfeit', ctx('a'));
      expect(result.success).toBe(true);
      expect(result.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(result.state!.winnerId).toBe('b');
    });
  });

  describe('game over detection', () => {
    it('detects win when opponent has no pieces', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[4][1] = { playerId: 'a', type: 'man' };
      state.board[3][2] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', capture(4, 1, 2, 3, 3, 2));
      expect(result.success).toBe(true);
      expect(result.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(result.state!.winnerId).toBe('a');
    });
  });

  describe('getAvailableActions', () => {
    it('returns move_piece + forfeit for current player', () => {
      const state = engine.initializeState(['a', 'b']);
      const actions = engine.getAvailableActions(state, 'a');
      expect(actions).toContain('move_piece');
      expect(actions).toContain('forfeit');
    });

    it('returns only forfeit for opponent', () => {
      const state = engine.initializeState(['a', 'b']);
      const actions = engine.getAvailableActions(state, 'b');
      expect(actions).not.toContain('move_piece');
      expect(actions).toContain('forfeit');
    });

    it('returns empty array after game over', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = engine.executeAction(state, 'forfeit', ctx('a'));
      expect(engine.getAvailableActions(result.state!, 'a')).toEqual([]);
      expect(engine.getAvailableActions(result.state!, 'b')).toEqual([]);
    });
  });

  describe('sanitizeStateForPlayer', () => {
    it('returns full state', () => {
      const state = engine.initializeState(['a', 'b']);
      const sanitized = engine.sanitizeStateForPlayer(state);
      expect(sanitized).toBe(state);
    });
  });

  describe('getResult', () => {
    it('returns no winner before game over', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = engine.getResult(state);
      expect(result.winnerIds).toEqual([]);
      expect(result.isDraw).toBe(false);
    });

    it('returns winner after forfeit', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = engine.executeAction(state, 'forfeit', ctx('a'));
      const gameResult = engine.getResult(result.state!);
      expect(gameResult.winnerIds).toContain('b');
    });
  });

  describe('getWinners', () => {
    it('returns empty array when game is not over', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(engine.getWinners(state)).toEqual([]);
    });
  });

  describe('isGameOver', () => {
    it('returns false for active game', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(engine.isGameOver(state)).toBe(false);
    });

    it('returns true after forfeit', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = engine.executeAction(state, 'forfeit', ctx('a'));
      expect(engine.isGameOver(result.state!)).toBe(true);
    });
  });

  describe('unknown action', () => {
    it('rejects unknown action', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = engine.executeAction(state, 'unknown_action', ctx('a'));
      expect(result.success).toBe(false);
    });
  });

  describe('state history', () => {
    it('preserves state history after move', () => {
      const state = engine.initializeState(['a', 'b']);
      const result = doMove(state, 'a', singleStep(5, 0, 4, 1));
      expect(result.success).toBe(true);
      expect(result.state!.stateHistory).toBeDefined();
      expect(Array.isArray(result.state!.stateHistory)).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('accepts valid config', () => {
      expect(
        engine.validateConfig({ variant: 'classic', forcedCaptures: true }),
      ).toBe(true);
    });

    it('rejects invalid variant type', () => {
      expect(engine.validateConfig({ variant: 123 })).toBe(false);
    });

    it('rejects invalid forcedCaptures type', () => {
      expect(engine.validateConfig({ forcedCaptures: 'yes' })).toBe(false);
    });

    it('accepts mode in config', () => {
      expect(engine.validateConfig({ mode: 'international' })).toBe(true);
    });

    it('rejects invalid mode', () => {
      expect(engine.validateConfig({ mode: 'invalid' })).toBe(false);
    });

    it('accepts backwardCaptures in config', () => {
      expect(engine.validateConfig({ backwardCaptures: true })).toBe(true);
    });

    it.each(['easy', 'medium', 'hard', 'expert'])(
      'accepts %s botDifficulty',
      (d) => {
        expect(engine.validateConfig({ botDifficulty: d })).toBe(true);
      },
    );

    it.each(['easy', 'medium', 'hard', 'expert'])(
      'accepts %s aiDifficulty',
      (d) => {
        expect(engine.validateConfig({ aiDifficulty: d })).toBe(true);
      },
    );

    it('rejects an unknown bot difficulty', () => {
      expect(engine.validateConfig({ botDifficulty: 'impossible' })).toBe(
        false,
      );
    });
  });
});
