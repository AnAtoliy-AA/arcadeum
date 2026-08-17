import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRankingStore } from './rankingStore';
import { rankingApi } from '../api';
import type { MyRanking } from '../model/types';

vi.mock('../api', () => ({
  rankingApi: {
    getMyRankings: vi.fn(),
    getRankings: vi.fn(),
  },
}));

const mockedApi = vi.mocked(rankingApi);

describe('useRankingStore', () => {
  beforeEach(() => {
    useRankingStore.setState({
      ratings: {},
      loaded: false,
    });
    mockedApi.getMyRankings.mockReset();
  });

  it('loads my rankings into a gameId-keyed map', async () => {
    const rows: MyRanking[] = [
      {
        gameId: 'chess_v1',
        season: '2026Q3',
        elo: 1550,
        tier: 'gold',
        peakElo: 1600,
        wins: 5,
        losses: 1,
        draws: 0,
        rankedGames: 6,
        rank: 10,
      },
    ];
    mockedApi.getMyRankings.mockResolvedValue(rows);

    await useRankingStore.getState().loadMyRankings('user1');

    const state = useRankingStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.ratings.chess_v1).toMatchObject({ elo: 1550, tier: 'gold' });
  });

  it('does not fetch for anonymous users', async () => {
    await useRankingStore.getState().loadMyRankings('anon_abc123');
    expect(mockedApi.getMyRankings).not.toHaveBeenCalled();
  });

  it('applies a delta to an existing rating', () => {
    useRankingStore.setState({
      ratings: {
        chess_v1: {
          gameId: 'chess_v1',
          season: '2026Q3',
          elo: 1550,
          tier: 'gold',
          peakElo: 1600,
          wins: 5,
          losses: 1,
          draws: 0,
          rankedGames: 6,
          rank: 10,
        },
      },
    });

    useRankingStore.getState().applyDelta('chess_v1', {
      elo: 1566,
      delta: 16,
      tier: 'gold',
    });

    const rating = useRankingStore.getState().ratings.chess_v1;
    expect(rating.elo).toBe(1566);
    expect(rating.rankedGames).toBe(7);
    expect(rating.peakElo).toBe(1600);
  });

  it('creates a fresh rating when applying a delta without prior data', () => {
    useRankingStore.getState().applyDelta('checkers_v1', {
      elo: 1184,
      delta: -16,
      tier: 'bronze',
    });

    const rating = useRankingStore.getState().ratings.checkers_v1;
    expect(rating).toMatchObject({ elo: 1184, tier: 'bronze', losses: 1 });
  });

  it('resets state', () => {
    useRankingStore.setState({
      ratings: { chess_v1: {} as MyRanking },
      loaded: true,
    });
    useRankingStore.getState().reset();
    expect(useRankingStore.getState().ratings).toEqual({});
    expect(useRankingStore.getState().loaded).toBe(false);
  });
});
