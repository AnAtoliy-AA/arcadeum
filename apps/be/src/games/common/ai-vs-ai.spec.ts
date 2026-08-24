import {
  AI_VS_AI_DEFAULT_DELAY_MS,
  AI_VS_AI_DELAYS_MS,
  AI_VS_AI_GAME_IDS,
  extractAiVsAiExtras,
  getAiMoveDelayMs,
  isAiVsAiSession,
} from './ai-vs-ai';
import type { GameSessionSummary } from '../sessions/game-sessions.service';

function session(options?: Record<string, unknown>): GameSessionSummary {
  return {
    id: 's-1',
    roomId: 'r-1',
    gameId: 'g-1',
    engine: 'test',
    status: 'active',
    state: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...(options === undefined ? {} : { options }),
  };
}

describe('ai-vs-ai helpers', () => {
  it('lists the supported turn-based games', () => {
    expect(AI_VS_AI_GAME_IDS).toEqual([
      'chess_v1',
      'checkers_v1',
      'tic_tac_toe_v1',
      'cascade_v1',
      'critical_v1',
      'sea_battle_v1',
      'cat_dash_v1',
      'backgammon_v1',
      'hearts_v1',
      'spades_v1',
      'go_v1',
      'pachisi_v1',
    ]);
  });

  it('exposes the three allowed delays with a 2s default', () => {
    expect(AI_VS_AI_DELAYS_MS).toEqual([1000, 2000, 5000]);
    expect(AI_VS_AI_DEFAULT_DELAY_MS).toBe(2000);
  });

  describe('extractAiVsAiExtras', () => {
    it('returns null when no aiVsAi flag is present', () => {
      expect(extractAiVsAiExtras(undefined)).toBeNull();
      expect(extractAiVsAiExtras({ theme: 'zen' })).toBeNull();
    });

    it('returns the extras when aiVsAi is set', () => {
      const result = extractAiVsAiExtras({ aiVsAi: true, aiMoveDelayMs: 1000 });
      expect(result).toEqual({ aiVsAi: true, aiMoveDelayMs: 1000 });
    });
  });

  describe('isAiVsAiSession', () => {
    it('is false for sessions without options', () => {
      expect(isAiVsAiSession(session())).toBe(false);
    });

    it('is false when the flag is not a boolean true', () => {
      expect(isAiVsAiSession(session({ aiVsAi: false }))).toBe(false);
      expect(isAiVsAiSession(session({ aiVsAi: 'yes' }))).toBe(false);
    });

    it('is true when session.options.aiVsAi is true', () => {
      expect(isAiVsAiSession(session({ aiVsAi: true }))).toBe(true);
    });
  });

  describe('getAiMoveDelayMs', () => {
    it('returns null for non-AI-vs-AI sessions', () => {
      expect(getAiMoveDelayMs(session())).toBeNull();
      expect(getAiMoveDelayMs(session({ aiVsAi: false }))).toBeNull();
    });

    it('returns null when the delay is missing or malformed', () => {
      expect(getAiMoveDelayMs(session({ aiVsAi: true }))).toBeNull();
      expect(
        getAiMoveDelayMs(session({ aiVsAi: true, aiMoveDelayMs: 'fast' })),
      ).toBeNull();
      expect(
        getAiMoveDelayMs(session({ aiVsAi: true, aiMoveDelayMs: -5 })),
      ).toBeNull();
    });

    it('returns any positive finite delay (allowed values are DTO-validated)', () => {
      expect(
        getAiMoveDelayMs(session({ aiVsAi: true, aiMoveDelayMs: 1500 })),
      ).toBe(1500);
      expect(
        getAiMoveDelayMs(session({ aiVsAi: true, aiMoveDelayMs: 5000 })),
      ).toBe(5000);
    });
  });
});
