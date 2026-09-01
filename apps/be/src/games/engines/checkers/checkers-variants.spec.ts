import { CheckersEngine } from './checkers.engine';
import { GAME_PHASE } from './checkers.constants';
import {
  ctx,
  s,
  singleStep,
  capture,
  multiCapture,
} from './checkers-test-utils';

const engine = new CheckersEngine();
type CheckersState = ReturnType<typeof engine.initializeState>;

function clearBoard(state: CheckersState): void {
  const size = state.board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      state.board[r][c] = null;
    }
  }
}

function doMove(
  state: CheckersState,
  userId: string,
  payload: { steps: import('./checkers.types').MoveStep[] },
) {
  return engine.executeAction(state, 'move_piece', ctx(userId), payload);
}

describe('CheckersEngine — variants and edge cases', () => {
  describe('international variant (10x10)', () => {
    it('initializes 10x10 board with 20 pieces per player', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'international' },
      });
      expect(state.board).toHaveLength(10);
      expect(state.board[0]).toHaveLength(10);
      expect(state.options.mode).toBe('international');

      let darkCount = 0;
      let lightCount = 0;
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const p = state.board[row][col]?.playerId;
          if (p === 'b' && row < 4) darkCount++;
          if (p === 'a' && row >= 6) lightCount++;
        }
      }
      expect(darkCount).toBe(20);
      expect(lightCount).toBe(20);
    });

    it('allows man to capture backwards in international variant', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'international' },
      });
      clearBoard(state);
      state.board[5][4] = { playerId: 'a', type: 'man' };
      state.board[4][3] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', capture(5, 4, 3, 2, 4, 3));
      expect(result.success).toBe(true);
      expect(result.state!.board[5][4]).toBeNull();
      expect(result.state!.board[4][3]).toBeNull();
      expect(result.state!.board[3][2]!.playerId).toBe('a');
    });

    it('allows flying king to slide and capture', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'international' },
      });
      clearBoard(state);
      state.board[0][0] = { playerId: 'a', type: 'king' };
      state.board[4][4] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', capture(0, 0, 5, 5, 4, 4));
      expect(result.success).toBe(true);
      expect(result.state!.board[0][0]).toBeNull();
      expect(result.state!.board[4][4]).toBeNull();
      expect(result.state!.board[5][5]!.playerId).toBe('a');
    });
  });

  describe('russian variant', () => {
    it('initializes 8x8 board with 8 pieces per player', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'russian' },
      });
      expect(state.board).toHaveLength(8);
      expect(state.board[0]).toHaveLength(8);
      expect(state.options.mode).toBe('russian');

      let darkCount = 0;
      let lightCount = 0;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const p = state.board[row][col]?.playerId;
          if (p === 'b' && row < 2) darkCount++;
          if (p === 'a' && row >= 6) lightCount++;
        }
      }
      expect(darkCount).toBe(8);
      expect(lightCount).toBe(8);
    });

    it('allows flying king to slide in russian variant', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'russian', forcedCaptures: false },
      });
      clearBoard(state);
      state.board[3][3] = { playerId: 'a', type: 'king' };
      const result = doMove(state, 'a', singleStep(3, 3, 0, 0));
      expect(result.success).toBe(true);
      expect(result.state!.board[3][3]).toBeNull();
      expect(result.state!.board[0][0]!.playerId).toBe('a');
      expect(result.state!.board[0][0]!.type).toBe('king');
    });

    it('does not allow man to capture backwards in russian variant', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'russian' },
      });
      clearBoard(state);
      state.board[3][2] = { playerId: 'a', type: 'man' };
      state.board[4][3] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', capture(3, 2, 5, 4, 4, 3));
      expect(result.success).toBe(false);
    });
  });

  describe('no legal moves win condition', () => {
    it('wins when opponent has pieces but no legal moves', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[0][0] = { playerId: 'a', type: 'king' };
      state.board[7][0] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', singleStep(0, 0, 1, 1));
      expect(result.success).toBe(true);
      expect(result.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(result.state!.winnerId).toBe('a');
    });
  });

  describe('draw by insufficient material', () => {
    it('declares draw when both have kings with equal counts and few pieces', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[0][0] = { playerId: 'a', type: 'king' };
      state.board[7][7] = { playerId: 'b', type: 'king' };
      const result = doMove(state, 'a', singleStep(0, 0, 1, 1));
      expect(result.success).toBe(true);
      expect(result.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(result.state!.isDraw).toBe(true);
    });
  });

  describe('king multi-jump', () => {
    it('allows flying king to execute multi-jump capture chain', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { mode: 'international' },
      });
      clearBoard(state);
      state.board[0][0] = { playerId: 'a', type: 'king' };
      state.board[2][2] = { playerId: 'b', type: 'man' };
      state.board[4][4] = { playerId: 'b', type: 'man' };
      const result = doMove(
        state,
        'a',
        multiCapture([s(0, 0, 3, 3, 2, 2), s(3, 3, 5, 5, 4, 4)]),
      );
      expect(result.success).toBe(true);
      expect(result.state!.board[0][0]).toBeNull();
      expect(result.state!.board[2][2]).toBeNull();
      expect(result.state!.board[4][4]).toBeNull();
      expect(result.state!.board[5][5]!.playerId).toBe('a');
      expect(result.state!.board[5][5]!.type).toBe('king');
    });
  });

  describe('incomplete capture chain rejection', () => {
    it('rejects single capture when more captures are available', () => {
      const state = engine.initializeState(['a', 'b']);
      clearBoard(state);
      state.board[5][4] = { playerId: 'a', type: 'man' };
      state.board[4][3] = { playerId: 'b', type: 'man' };
      state.board[2][1] = { playerId: 'b', type: 'man' };
      const result = doMove(state, 'a', capture(5, 4, 3, 2, 4, 3));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Multi-jump not complete/i);
    });
  });
});
