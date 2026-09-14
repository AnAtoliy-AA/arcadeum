import { describe, it, expect, vi } from 'vitest';
import {
  finishIfOver,
  undoReducer,
  type FinishIfOverConfig,
} from '../solo-game-store';

vi.mock('@/features/stats/store/statsStore', () => ({
  useLocalStatsStore: {
    getState: vi.fn(() => ({
      recordGameResult: vi.fn(),
    })),
  },
}));

vi.mock('@/features/stats/store/soloScoreStore', () => ({
  useSoloScoreStore: {
    getState: vi.fn(() => ({
      addScore: vi.fn(),
    })),
  },
}));

vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: {
    getState: vi.fn(() => ({
      snapshot: { userId: 'test-user' },
    })),
  },
}));

function makeConfig(
  overrides: Partial<FinishIfOverConfig> = {},
): FinishIfOverConfig {
  return {
    gameId: 'test_v1',
    sessionPrefix: 'test',
    difficulty: 'default',
    isOver: false,
    won: false,
    score: 0,
    moves: 0,
    startedAt: Date.now() - 10000,
    usedUndo: false,
    ...overrides,
  };
}

describe('finishIfOver', () => {
  it('returns null when game is not over', () => {
    const result = finishIfOver(makeConfig({ isOver: false }));
    expect(result).toBeNull();
  });

  it('returns finished state when game is won', () => {
    const result = finishIfOver(
      makeConfig({ isOver: true, won: true, score: 100, moves: 25 }),
    );
    expect(result).not.toBeNull();
    expect(result!.finished.won).toBe(true);
    expect(result!.finished.score).toBe(100);
    expect(result!.finished.moves).toBe(25);
    expect(result!.finished.durationMs).toBeGreaterThan(0);
  });

  it('returns finished state when game is lost', () => {
    const result = finishIfOver(
      makeConfig({ isOver: true, won: false, score: 0, moves: 10 }),
    );
    expect(result).not.toBeNull();
    expect(result!.finished.won).toBe(false);
  });

  it('uses custom mapper when provided', () => {
    const result = finishIfOver<{ custom: boolean }>(
      makeConfig({ isOver: true, won: true }),
      (info) => ({ custom: info.won }),
    );
    expect(result).not.toBeNull();
    expect(result!.finished.custom).toBe(true);
  });
});

describe('undoReducer', () => {
  it('returns null when history is empty', () => {
    expect(undoReducer([], null)).toBeNull();
  });

  it('returns null when game is finished', () => {
    const history = ['state1', 'state2'];
    expect(undoReducer(history, Date.now())).toBeNull();
  });

  it('pops last state and sets usedUndo', () => {
    const history = ['state1', 'state2', 'state3'];
    const result = undoReducer(history, null);
    expect(result).not.toBeNull();
    expect(result!.game).toBe('state3');
    expect(result!.history).toEqual(['state1', 'state2']);
    expect(result!.usedUndo).toBe(true);
  });
});
