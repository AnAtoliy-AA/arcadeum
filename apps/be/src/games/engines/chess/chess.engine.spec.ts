import { ChessEngine } from './chess.engine';
import { parseFen } from './chess.board';
import type { ChessState, MovePayload } from './chess.types';

describe('ChessEngine', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const meta = engine.getMetadata();
      expect(meta.gameId).toBe('chess_v1');
      expect(meta.name).toBe('Chess');
      expect(meta.minPlayers).toBe(2);
      expect(meta.maxPlayers).toBe(2);
    });
  });

  describe('initializeState', () => {
    it('should initialize with standard starting position', () => {
      const state = engine.initializeState(['p1', 'p2']);
      expect(state.board).toHaveLength(8);
      expect(state.board[0]).toHaveLength(8);
      expect(state.board[0][0]).toEqual({ type: 'rook', color: 'black' });
      expect(state.board[0][4]).toEqual({ type: 'king', color: 'black' });
      expect(state.board[7][4]).toEqual({ type: 'king', color: 'white' });
      expect(state.board[6][0]).toEqual({ type: 'pawn', color: 'white' });
      expect(state.currentTurnColor).toBe('white');
    });

    it('should throw with less than 2 players', () => {
      expect(() => engine.initializeState(['p1'])).toThrow();
    });

    it('should initialize with time control', () => {
      const state = engine.initializeState(['p1', 'p2'], {
        timeControl: {
          type: 'blitz',
          initialSeconds: 300,
          incrementSeconds: 3,
        },
      });
      expect(state.clocks).not.toBeNull();
      expect(state.clocks?.white.remainingSeconds).toBe(300);
    });
  });

  describe('validateAction', () => {
    let state: ChessState;

    beforeEach(() => {
      state = engine.initializeState(['p1', 'p2']);
    });

    it('should validate move action for correct player', () => {
      const payload: MovePayload = {
        fromFile: 'e',
        fromRank: 2,
        toFile: 'e',
        toRank: 4,
      };
      expect(
        engine.validateAction(
          state,
          'move',
          {
            userId: 'p1',
            roomId: 'r1',
            sessionId: 's1',
            timestamp: new Date(),
          },
          payload,
        ),
      ).toBe(true);
    });

    it('should reject move for wrong player', () => {
      const payload: MovePayload = {
        fromFile: 'e',
        fromRank: 2,
        toFile: 'e',
        toRank: 4,
      };
      expect(
        engine.validateAction(
          state,
          'move',
          {
            userId: 'p2',
            roomId: 'r1',
            sessionId: 's1',
            timestamp: new Date(),
          },
          payload,
        ),
      ).toBe(false);
    });

    it('should accept resign', () => {
      expect(
        engine.validateAction(state, 'resign', {
          userId: 'p1',
          roomId: 'r1',
          sessionId: 's1',
          timestamp: new Date(),
        }),
      ).toBe(true);
    });
  });

  describe('executeAction - move', () => {
    let state: ChessState;

    beforeEach(() => {
      state = engine.initializeState(['p1', 'p2']);
    });

    it('should execute e2-e4', () => {
      const payload: MovePayload = {
        fromFile: 'e',
        fromRank: 2,
        toFile: 'e',
        toRank: 4,
      };
      const result = engine.executeAction(
        state,
        'move',
        { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
        payload,
      );
      expect(result.success).toBe(true);
      expect(result.state?.board[4][4]).toEqual({
        type: 'pawn',
        color: 'white',
      });
      expect(result.state?.board[6][4]).toBeNull();
      expect(result.state?.currentTurnColor).toBe('black');
    });

    it('should execute knight move', () => {
      const payload: MovePayload = {
        fromFile: 'g',
        fromRank: 1,
        toFile: 'f',
        toRank: 3,
      };
      const result = engine.executeAction(
        state,
        'move',
        { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
        payload,
      );
      expect(result.success).toBe(true);
      expect(result.state?.board[5][5]).toEqual({
        type: 'knight',
        color: 'white',
      });
    });

    it('should not allow moving pinned piece', () => {
      state.board = parseFen('3qk3/8/8/8/8/3N4/8/3K4');
      state.currentTurnColor = 'white';
      state.players[0].color = 'white';
      const payload: MovePayload = {
        fromFile: 'd',
        fromRank: 3,
        toFile: 'f',
        toRank: 4,
      };
      const result = engine.executeAction(
        state,
        'move',
        { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
        payload,
      );
      expect(result.success).toBe(false);
    });

    it('should detect check', () => {
      state.board = parseFen('rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR');
      const payload: MovePayload = {
        fromFile: 'g',
        fromRank: 1,
        toFile: 'e',
        toRank: 2,
      };
      const result = engine.executeAction(
        state,
        'move',
        { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
        payload,
      );
      expect(result.success).toBe(true);
    });

    it('should handle pawn capture', () => {
      state.board = parseFen('rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR');
      const payload: MovePayload = {
        fromFile: 'd',
        fromRank: 4,
        toFile: 'e',
        toRank: 5,
      };
      const result = engine.executeAction(
        state,
        'move',
        { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
        payload,
      );
      expect(result.success).toBe(true);
      expect(result.state?.board[3][4]).toEqual({
        type: 'pawn',
        color: 'white',
      });
    });

    it('should handle castling', () => {
      state.board = parseFen('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R');
      const payload: MovePayload = {
        fromFile: 'e',
        fromRank: 1,
        toFile: 'g',
        toRank: 1,
      };
      const result = engine.executeAction(
        state,
        'move',
        { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
        payload,
      );
      expect(result.success).toBe(true);
      expect(result.state?.board[7][6]).toEqual({
        type: 'king',
        color: 'white',
      });
      expect(result.state?.board[7][5]).toEqual({
        type: 'rook',
        color: 'white',
      });
    });
  });

  describe('executeAction - resign', () => {
    it('should handle resignation', () => {
      const state = engine.initializeState(['p1', 'p2']);
      const result = engine.executeAction(state, 'resign', {
        userId: 'p1',
        roomId: 'r1',
        sessionId: 's1',
        timestamp: new Date(),
      });
      expect(result.success).toBe(true);
      expect(result.state?.winnerColor).toBe('black');
    });
  });

  describe('isGameOver', () => {
    it('should return false for active game', () => {
      const state = engine.initializeState(['p1', 'p2']);
      expect(engine.isGameOver(state)).toBe(false);
    });

    it('should return true for checkmate', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.isCheckmate = true;
      expect(engine.isGameOver(state)).toBe(true);
    });

    it('should return true for stalemate', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.isStalemate = true;
      expect(engine.isGameOver(state)).toBe(true);
    });
  });

  describe('getWinners', () => {
    it('should return winner for checkmate', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.winnerColor = 'white';
      expect(engine.getWinners(state)).toEqual(['p1']);
    });

    it('should return empty for draw', () => {
      const state = engine.initializeState(['p1', 'p2']);
      state.isStalemate = true;
      expect(engine.getWinners(state)).toEqual([]);
    });
  });

  describe('FEN parsing', () => {
    it('should parse FEN correctly', () => {
      const board = parseFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
      expect(board[0][0]).toEqual({ type: 'rook', color: 'black' });
      expect(board[0][4]).toEqual({ type: 'king', color: 'black' });
      expect(board[7][4]).toEqual({ type: 'king', color: 'white' });
    });
  });
});
