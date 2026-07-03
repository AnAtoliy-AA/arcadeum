import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStatsStore } from './statsStore';

describe('useLocalStatsStore', () => {
  beforeEach(() => {
    useLocalStatsStore.getState().resetStats();
  });

  it('starts with empty records', () => {
    const { records, getOverview, getByGameType } =
      useLocalStatsStore.getState();
    expect(records).toEqual([]);
    expect(getOverview()).toEqual({
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    });
    expect(getByGameType()).toEqual([]);
  });

  it('records a won game', () => {
    useLocalStatsStore.getState().recordGameResult({
      gameId: 'tic_tac_toe_v1',
      result: 'won',
      timestamp: Date.now(),
      sessionId: 's1',
    });

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(1);
    expect(overview.wins).toBe(1);
    expect(overview.losses).toBe(0);
    expect(overview.winRate).toBe(100);
  });

  it('records a lost game', () => {
    useLocalStatsStore.getState().recordGameResult({
      gameId: 'cascade_v1',
      result: 'lost',
      timestamp: Date.now(),
      sessionId: 's1',
    });

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(1);
    expect(overview.wins).toBe(0);
    expect(overview.losses).toBe(1);
    expect(overview.winRate).toBe(0);
  });

  it('records a draw', () => {
    useLocalStatsStore.getState().recordGameResult({
      gameId: 'tic_tac_toe_v1',
      result: 'draw',
      timestamp: Date.now(),
      sessionId: 's1',
    });

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(1);
    expect(overview.draws).toBe(1);
    expect(overview.winRate).toBe(0);
  });

  it('computes correct win rate with mixed results', () => {
    const store = useLocalStatsStore.getState();
    store.recordGameResult({
      gameId: 'a',
      result: 'won',
      timestamp: 1,
      sessionId: 's1',
    });
    store.recordGameResult({
      gameId: 'a',
      result: 'won',
      timestamp: 2,
      sessionId: 's2',
    });
    store.recordGameResult({
      gameId: 'a',
      result: 'lost',
      timestamp: 3,
      sessionId: 's3',
    });
    store.recordGameResult({
      gameId: 'a',
      result: 'lost',
      timestamp: 4,
      sessionId: 's4',
    });

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(4);
    expect(overview.wins).toBe(2);
    expect(overview.losses).toBe(2);
    expect(overview.winRate).toBe(50);
  });

  it('groups stats by game type', () => {
    const store = useLocalStatsStore.getState();
    store.recordGameResult({
      gameId: 'tic_tac_toe_v1',
      result: 'won',
      timestamp: 1,
      sessionId: 's1',
    });
    store.recordGameResult({
      gameId: 'tic_tac_toe_v1',
      result: 'won',
      timestamp: 2,
      sessionId: 's2',
    });
    store.recordGameResult({
      gameId: 'cascade_v1',
      result: 'lost',
      timestamp: 3,
      sessionId: 's3',
    });

    const byGame = useLocalStatsStore.getState().getByGameType();
    expect(byGame).toHaveLength(2);

    const ttt = byGame.find((g) => g.gameId === 'tic_tac_toe_v1');
    expect(ttt).toEqual({
      gameId: 'tic_tac_toe_v1',
      totalGames: 2,
      wins: 2,
      losses: 0,
      draws: 0,
      winRate: 100,
    });

    const cascade = byGame.find((g) => g.gameId === 'cascade_v1');
    expect(cascade).toEqual({
      gameId: 'cascade_v1',
      totalGames: 1,
      wins: 0,
      losses: 1,
      draws: 0,
      winRate: 0,
    });
  });

  it('sorts by game type by total games descending', () => {
    const store = useLocalStatsStore.getState();
    store.recordGameResult({
      gameId: 'rare',
      result: 'won',
      timestamp: 1,
      sessionId: 's1',
    });
    store.recordGameResult({
      gameId: 'popular',
      result: 'won',
      timestamp: 2,
      sessionId: 's2',
    });
    store.recordGameResult({
      gameId: 'popular',
      result: 'won',
      timestamp: 3,
      sessionId: 's3',
    });

    const byGame = useLocalStatsStore.getState().getByGameType();
    expect(byGame[0].gameId).toBe('popular');
    expect(byGame[1].gameId).toBe('rare');
  });

  it('caps records at 1000', () => {
    const store = useLocalStatsStore.getState();
    for (let i = 0; i < 1005; i++) {
      store.recordGameResult({
        gameId: 'a',
        result: 'won',
        timestamp: i,
        sessionId: `s${i}`,
      });
    }

    const { records } = useLocalStatsStore.getState();
    expect(records).toHaveLength(1000);
    expect(records[0].sessionId).toBe('s5');
  });

  it('resetStats clears everything', () => {
    const store = useLocalStatsStore.getState();
    store.recordGameResult({
      gameId: 'a',
      result: 'won',
      timestamp: 1,
      sessionId: 's1',
    });
    store.recordGameResult({
      gameId: 'b',
      result: 'lost',
      timestamp: 2,
      sessionId: 's2',
    });

    store.resetStats();

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(0);
    expect(useLocalStatsStore.getState().records).toEqual([]);
  });
});
