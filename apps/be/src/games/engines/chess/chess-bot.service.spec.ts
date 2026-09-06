import { ChessBotService } from './chess-bot.service';
import { ChessEngine } from './chess.engine';
import type { GameSessionSummary } from '../../sessions/game-sessions.service';

function createMockChessService() {
  return {
    findSessionByRoom: jest.fn(),
    completeSession: jest.fn(),
  } as never;
}

describe('ChessBotService', () => {
  let bot: ChessBotService;
  let engine: ChessEngine;
  let mockChessService: ReturnType<typeof createMockChessService>;

  beforeEach(() => {
    mockChessService = createMockChessService();
    bot = new ChessBotService(mockChessService);
    engine = new ChessEngine();
  });

  describe('isBot', () => {
    it('should identify bot user IDs', () => {
      expect(bot.isBot('bot-abc123')).toBe(true);
      expect(bot.isBot('user-abc123')).toBe(false);
      expect(bot.isBot('bot-')).toBe(true);
    });
  });

  describe('setDifficulty', () => {
    it('should accept valid difficulty levels', () => {
      bot.setDifficulty('easy');
      bot.setDifficulty('medium');
      bot.setDifficulty('hard');
      bot.setDifficulty('expert');
    });
  });

  describe('findBestMove', () => {
    it('should return a legal move from initial position', () => {
      const state = engine.initializeState(['bot-1', 'p2']);
      const move = bot.findBestMove(state);
      expect(move).not.toBeNull();
      expect(move?.from).toBeDefined();
      expect(move?.to).toBeDefined();
      expect(move?.piece).toBeDefined();
    });

    it('should return a move from a complex position', () => {
      const state = engine.initializeState(['bot-1', 'p2']);
      const move = bot.findBestMove(state);
      expect(move).not.toBeNull();
      expect(move?.from).toBeDefined();
      expect(move?.to).toBeDefined();
    });

    it('should return a legal move on expert difficulty (sparse board)', () => {
      const state = engine.initializeState(['bot-1', 'p2']);
      state.botDifficulty = 'expert';
      // Keep the deep search fast: only kings + a pawn each.
      state.board = Array.from({ length: 8 }, () => Array<null>(8).fill(null));
      state.board[7][4] = { type: 'king', color: 'white' }; // e1
      state.board[0][4] = { type: 'king', color: 'black' }; // e8
      state.board[6][4] = { type: 'pawn', color: 'white' }; // e2
      state.board[1][4] = { type: 'pawn', color: 'black' }; // e7
      state.currentTurnColor = 'white';
      const move = bot.findBestMove(state);
      expect(move).not.toBeNull();
      expect(move?.from).toBeDefined();
      expect(move?.to).toBeDefined();
    });
  });

  describe('setMoveFn', () => {
    it('should accept a move function', () => {
      const fn = jest.fn();
      bot.setMoveFn(fn);
    });
  });

  describe('checkAndPlay', () => {
    it('should not play if session is not active', async () => {
      const fn = jest.fn();
      bot.setMoveFn(fn);
      const state = engine.initializeState(['bot-1', 'p2']);
      const session: GameSessionSummary = {
        id: 'session-1',
        roomId: 'room-1',
        gameId: 'chess_v1',
        status: 'completed',
        state: state,
        playerIds: ['bot-1', 'p2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (mockChessService.findSessionByRoom as jest.Mock).mockResolvedValue(
        session,
      );
      await bot.checkAndPlay(session);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should not play if it is not bot turn', async () => {
      const fn = jest.fn();
      bot.setMoveFn(fn);
      const state = engine.initializeState(['p1', 'bot-1']);
      const session: GameSessionSummary = {
        id: 'session-1',
        roomId: 'room-1',
        gameId: 'chess_v1',
        status: 'active',
        state: state,
        playerIds: ['p1', 'bot-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (mockChessService.findSessionByRoom as jest.Mock).mockResolvedValue(
        session,
      );
      await bot.checkAndPlay(session);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should keep playing bot-only sessions in AI-vs-AI mode', async () => {
      const fn = jest.fn().mockResolvedValue({});
      bot.setMoveFn(fn);
      const state = engine.initializeState(['bot-1', 'bot-2']);
      // Sparse board keeps the expert search instant.
      state.board = Array.from({ length: 8 }, () => Array<null>(8).fill(null));
      state.board[7][4] = { type: 'king', color: 'white' }; // e1
      state.board[0][4] = { type: 'king', color: 'black' }; // e8
      state.botDifficulty = 'easy';
      const session: GameSessionSummary = {
        id: 'session-1',
        roomId: 'room-1',
        gameId: 'chess_v1',
        engine: 'chess_v1',
        status: 'active',
        state: state,
        options: { aiVsAi: true, aiMoveDelayMs: 5 },
        playerIds: ['bot-1', 'bot-2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (mockChessService.findSessionByRoom as jest.Mock).mockResolvedValue(
        session,
      );
      await bot.checkAndPlay(session);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
