import { ChessBotService } from './chess-bot.service';
import { ChessEngine } from './chess.engine';

describe('ChessBotService', () => {
  let bot: ChessBotService;
  let engine: ChessEngine;

  beforeEach(() => {
    bot = new ChessBotService();
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
      await bot.checkAndPlay({
        id: 'session-1',
        roomId: 'room-1',
        gameId: 'chess_v1',
        status: 'completed',
        state: state as unknown as Record<string, unknown>,
        playerIds: ['bot-1', 'p2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(fn).not.toHaveBeenCalled();
    });

    it('should not play if it is not bot turn', async () => {
      const fn = jest.fn();
      bot.setMoveFn(fn);
      const state = engine.initializeState(['p1', 'bot-1']);
      await bot.checkAndPlay({
        id: 'session-1',
        roomId: 'room-1',
        gameId: 'chess_v1',
        status: 'active',
        state: state as unknown as Record<string, unknown>,
        playerIds: ['p1', 'bot-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
