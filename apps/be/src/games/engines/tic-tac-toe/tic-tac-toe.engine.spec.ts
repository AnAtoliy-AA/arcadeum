import { TicTacToeEngine } from './tic-tac-toe.engine';
import { GAME_PHASE } from './tic-tac-toe.constants';
import type { GameActionContext } from '../base/game-engine.interface';

const engine = new TicTacToeEngine();

function ctx(
  userId: string,
  overrides: Partial<GameActionContext> = {},
): GameActionContext {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
    ...overrides,
  };
}

describe('TicTacToeEngine', () => {
  describe('initializeState', () => {
    it('builds a 3×3 board with winLength 3 by default', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(state.options.boardSize).toBe(3);
      expect(state.winLength).toBe(3);
      expect(state.board).toHaveLength(3);
      expect(state.phase).toBe(GAME_PHASE.PLAYING);
      expect(state.playerOrder).toEqual(['a', 'b']);
      expect(state.players[0].symbol).toBe('X');
      expect(state.players[1].symbol).toBe('O');
    });

    it('builds a 5×5 board with winLength 4', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { boardSize: 5 },
      });
      expect(state.board).toHaveLength(5);
      expect(state.winLength).toBe(4);
    });

    it('builds a 9×9 board with winLength 5', () => {
      const state = engine.initializeState(['a', 'b'], {
        options: { boardSize: 9 },
      });
      expect(state.board).toHaveLength(9);
      expect(state.winLength).toBe(5);
    });

    it('populates teams when teamMode=true', () => {
      const state = engine.initializeState(['a', 'b', 'c', 'd'], {
        options: { teamMode: true },
      });
      expect(state.teams).toHaveLength(2);
      expect(state.teams[0].playerIds).toEqual(['a', 'b']);
      expect(state.teams[1].playerIds).toEqual(['c', 'd']);
      expect(state.playerOrder).toEqual([state.teams[0].id, state.teams[1].id]);
      expect(state.players[0].teamId).toBe(state.teams[0].id);
      expect(state.players[3].teamId).toBe(state.teams[1].id);
    });
  });

  describe('place_mark — 3×3 wins', () => {
    it('horizontal win sets winnerId, winLine, phase=game_over', () => {
      let state = engine.initializeState(['a', 'b']);
      // a (0,0), b (1,0), a (0,1), b (1,1), a (0,2) → row 0 wins for a
      const moves: Array<[string, number, number]> = [
        ['a', 0, 0],
        ['b', 1, 0],
        ['a', 0, 1],
        ['b', 1, 1],
        ['a', 0, 2],
      ];
      for (const [userId, row, col] of moves) {
        const r = engine.executeAction(state, 'place_mark', ctx(userId), {
          row,
          col,
        });
        expect(r.success).toBe(true);
        state = r.state!;
      }
      expect(state.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(state.winnerId).toBe('a');
      expect(state.winLine).toHaveLength(3);
    });

    it('diagonal win', () => {
      let state = engine.initializeState(['a', 'b']);
      const moves: Array<[string, number, number]> = [
        ['a', 0, 0],
        ['b', 0, 1],
        ['a', 1, 1],
        ['b', 0, 2],
        ['a', 2, 2],
      ];
      for (const [userId, row, col] of moves) {
        state = engine.executeAction(state, 'place_mark', ctx(userId), {
          row,
          col,
        }).state!;
      }
      expect(state.winnerId).toBe('a');
    });

    it('draws when board is full with no winner', () => {
      let state = engine.initializeState(['a', 'b']);
      // X O X / X O X / O X O — no winner
      const moves: Array<[string, number, number]> = [
        ['a', 0, 0],
        ['b', 0, 1],
        ['a', 0, 2],
        ['b', 1, 1],
        ['a', 1, 0],
        ['b', 2, 0],
        ['a', 1, 2],
        ['b', 2, 2],
        ['a', 2, 1],
      ];
      for (const [userId, row, col] of moves) {
        state = engine.executeAction(state, 'place_mark', ctx(userId), {
          row,
          col,
        }).state!;
      }
      expect(state.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(state.isDraw).toBe(true);
      expect(state.winnerId).toBeNull();
    });
  });

  describe('place_mark — 5×5 wins', () => {
    it('4-in-a-row wins on 5×5', () => {
      let state = engine.initializeState(['a', 'b'], {
        options: { boardSize: 5 },
      });
      const moves: Array<[string, number, number]> = [
        ['a', 2, 0],
        ['b', 0, 0],
        ['a', 2, 1],
        ['b', 0, 1],
        ['a', 2, 2],
        ['b', 0, 2],
        ['a', 2, 3],
      ];
      for (const [userId, row, col] of moves) {
        state = engine.executeAction(state, 'place_mark', ctx(userId), {
          row,
          col,
        }).state!;
      }
      expect(state.winnerId).toBe('a');
      expect(state.winLine).toHaveLength(4);
    });
  });

  describe('validation', () => {
    it('rejects out-of-turn place_mark', () => {
      const state = engine.initializeState(['a', 'b']);
      const r = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 0,
      });
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/not your turn/i);
    });

    it('rejects place_mark on occupied cell', () => {
      let state = engine.initializeState(['a', 'b']);
      state = engine.executeAction(state, 'place_mark', ctx('a'), {
        row: 0,
        col: 0,
      }).state!;
      const r = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 0,
      });
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/taken/i);
    });

    it('rejects out-of-bounds', () => {
      const state = engine.initializeState(['a', 'b']);
      const r = engine.executeAction(state, 'place_mark', ctx('a'), {
        row: 5,
        col: 5,
      });
      expect(r.success).toBe(false);
    });
  });

  describe('team mode rotation', () => {
    it('rotates between teams and within team shooters', () => {
      let state = engine.initializeState(['a', 'b', 'c', 'd'], {
        options: { teamMode: true },
      });
      const t1 = state.teams[0].id;
      const t2 = state.teams[1].id;

      // a (team1) places — turn passes to team2's first shooter (c)
      state = engine.executeAction(state, 'place_mark', ctx('a'), {
        row: 0,
        col: 0,
      }).state!;
      expect(state.playerOrder[state.currentTurnIndex]).toBe(t2);
      expect(state.board[0][0]).toBe(t1);
      expect(state.teams[0].currentShooterIndex).toBe(1); // next time team1 shoots, b

      // c (team2) places — turn passes back to team1's next shooter (b)
      state = engine.executeAction(state, 'place_mark', ctx('c'), {
        row: 1,
        col: 0,
      }).state!;
      expect(state.playerOrder[state.currentTurnIndex]).toBe(t1);
      expect(state.board[1][0]).toBe(t2);

      // a should be rejected now — b is up
      const wrong = engine.executeAction(state, 'place_mark', ctx('a'), {
        row: 2,
        col: 0,
      });
      expect(wrong.success).toBe(false);

      const ok = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 2,
        col: 0,
      });
      expect(ok.success).toBe(true);
    });
  });

  describe('forfeit', () => {
    it('ends game when only one player remains in FFA', () => {
      const state = engine.initializeState(['a', 'b']);
      const r = engine.executeAction(state, 'forfeit', ctx('a'));
      expect(r.success).toBe(true);
      expect(r.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(r.state!.winnerId).toBe('b');
    });
  });

  describe('getAvailableActions', () => {
    it('returns place_mark + forfeit for current player, just forfeit otherwise', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(engine.getAvailableActions(state, 'a')).toContain('place_mark');
      expect(engine.getAvailableActions(state, 'b')).not.toContain(
        'place_mark',
      );
      expect(engine.getAvailableActions(state, 'b')).toContain('forfeit');
    });
  });

  describe('metadata', () => {
    it('returns correct gameId, min/max players, category', () => {
      const m = engine.getMetadata();
      expect(m.gameId).toBe('tic_tac_toe_v1');
      expect(m.minPlayers).toBe(2);
      expect(m.maxPlayers).toBe(4);
      expect(m.category).toBe('Board Game');
    });
  });
});
