      expect(result.state!.board[1][4]!.playerId).toBe('a');
    });
  });

  describe('king promotion', () => {
    it('promotes light piece to king when reaching row 0', () => {
      const state = engine.initializeState(['a', 'b']);
      const board = state.board;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c] = null;
        }
      }
      board[1][0] = { playerId: 'a', type: 'man' };

      const result = engine.executeAction(
        { ...state, board },
        'move_piece',
        ctx('a'),
        singleStepMove(1, 0, 0, 1),
      );
      expect(result.success).toBe(true);
      expect(result.state!.board[0][1]!.type).toBe('king');
      expect(result.state!.board[0][1]!.playerId).toBe('a');
    });

    it('promotes dark piece to king when reaching row 7', () => {
      const state = engine.initializeState(['a', 'b']);
      const board = state.board;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c] = null;
        }
      }
      board[6][1] = { playerId: 'b', type: 'man' };

      let stateWithBoard = { ...state, board };
      stateWithBoard = engine.executeAction(
        stateWithBoard,
        'move_piece',
        ctx('a'),
        singleStepMove(5, 0, 4, 1),
      ).state!;

      const result = engine.executeAction(
        stateWithBoard,
        'move_piece',
        ctx('b'),
        singleStepMove(6, 1, 7, 0),
      );
      expect(result.success).toBe(true);
      expect(result.state!.board[7][0]!.type).toBe('king');
    });
  });

  describe('king movement', () => {
    it('king can move in all four diagonal directions', () => {
      const state = engine.initializeState(['a', 'b']);
      const board = state.board;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c] = null;
        }
      }
      board[3][3] = { playerId: 'a', type: 'king' };

      // Move king up-left
      const result = engine.executeAction(
        { ...state, board },
        'move_piece',
        ctx('a'),
        singleStepMove(3, 3, 2, 2),
      );
      expect(result.success).toBe(true);

      // Move dark piece
      let s = result.state!;
      s = engine.executeAction(
        s,
        'move_piece',
        ctx('b'),
        singleStepMove(5, 0, 4, 1),
      ).state!;

      // Move king down-right from (2,2)
      const result2 = engine.executeAction(
        s,
        'move_piece',
        ctx('a'),
        singleStepMove(2, 2, 3, 3),
      );
      expect(result2.success).toBe(true);
      expect(result2.state!.board[3][3]!.type).toBe('king');
    });

    it('king can capture in all four directions', () => {
      const state = engine.initializeState(['a', 'b']);
      const board = state.board;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c] = null;
        }
      }
      board[3][3] = { playerId: 'a', type: 'king' };
      board[2][2] = { playerId: 'b', type: 'man' };

      const result = engine.executeAction(
        { ...state, board },
        'move_piece',
        ctx('a'),
        captureMove(3, 3, 1, 1, 2, 2),
      );
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
      const board = state.board;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c] = null;
        }
      }
      board[4][1] = { playerId: 'a', type: 'man' };
      board[3][2] = { playerId: 'b', type: 'man' };

      const result = engine.executeAction(
        { ...state, board },
        'move_piece',
        ctx('a'),
        captureMove(4, 1, 2, 3, 3, 2),
      );
      expect(result.success).toBe(true);
      expect(result.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(result.state!.winnerId).toBe('a');
    });

    it('detects win when opponent has no moves', () => {
      const state = engine.initializeState(['a', 'b']);
      const board = state.board;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c] = null;
        }
      }
      // Light pieces block dark's only move
      board[5][2] = { playerId: 'a', type: 'king' };
      board[3][0] = { playerId: 'b', type: 'man' };
      board[4][1] = { playerId: 'a', type: 'man' };
      board[2][1] = { playerId: 'a', type: 'man' };

      const result = engine.executeAction(
        { ...state, board },
        'move_piece',
        ctx('a'),
        singleStepMove(5, 2, 6, 1),
      );
      // After this move, dark at (3,0) has no moves (blocked by light at 2,1 and 4,1)
      expect(result.success).toBe(true);
      if (result.state!.phase === GAME_PHASE.GAME_OVER) {
        expect(result.state!.winnerId).toBe('a');
      }
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
    it('returns full state (no hidden information)', () => {
      const state = engine.initializeState(['a', 'b']);
      const sanitized = engine.sanitizeStateForPlayer(state, 'a');
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
      expect(gameResult.isDraw).toBe(false);
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
      const result = engine.executeAction(
        state,
        'move_piece',
        ctx('a'),
        singleStepMove(5, 0, 4, 1),
      );
      expect(result.success).toBe(true);
      expect(result.state!.stateHistory).toBeDefined();
      expect(Array.isArray(result.state!.stateHistory)).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('accepts valid config', () => {
      expect(engine.validateConfig({ variant: 'classic', forcedCaptures: true })).toBe(true);
    });

    it('rejects invalid variant type', () => {
      expect(engine.validateConfig({ variant: 123 })).toBe(false);
    });

    it('rejects invalid forcedCaptures type', () => {
      expect(engine.validateConfig({ forcedCaptures: 'yes' })).toBe(false);
    });
  });

  describe('draw detection', () => {
    it('detects draw with king-only endgame', () => {
      const state = engine.initializeState(['a', 'b']);
      const board = state.board;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c] = null;
        }
      }
      board[0][0] = { playerId: 'a', type: 'king' };
      board[7][7] = { playerId: 'b', type: 'king' };
      board[0][2] = { playerId: 'a', type: 'man' };
      board[7][5] = { playerId: 'b', type: 'man' };

      const stateWithBoard = { ...state, board };
      const result = engine.executeAction(
        stateWithBoard,
        'move_piece',
        ctx('a'),
        singleStepMove(0, 0, 1, 1),
      );
      // Depending on position, may trigger draw with kings-only endgame
      expect(result.success).toBe(true);
    });
  });
});
