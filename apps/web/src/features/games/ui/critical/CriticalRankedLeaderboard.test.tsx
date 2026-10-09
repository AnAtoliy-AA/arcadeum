import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CriticalRankedLeaderboard } from './CriticalRankedLeaderboard';
import type { RankingPlayer } from '@/features/ranking/model/types';

describe('CriticalRankedLeaderboard', () => {
  const sampleEntries: RankingPlayer[] = [
    {
      rank: 1,
      userId: 'user-1',
      username: 'BombMaster',
      elo: 2150,
      tier: 'master',
      wins: 42,
      losses: 5,
      draws: 0,
      peakElo: 2200,
    },
    {
      rank: 2,
      userId: 'user-2',
      username: 'DefuseKing',
      elo: 1890,
      tier: 'diamond',
      wins: 28,
      losses: 12,
      draws: 1,
      peakElo: 1910,
    },
  ];

  it('renders leaderboard rows with username, winrate, and rating badge', () => {
    render(
      <CriticalRankedLeaderboard
        entries={sampleEntries}
        title="Season Top Competitors"
        subtitle="Top rated Critical duelists this season"
        emptyMessage="No ranked duelists recorded yet this season."
      />,
    );

    expect(screen.getByText('Season Top Competitors')).toBeInTheDocument();
    expect(screen.getByText('BombMaster')).toBeInTheDocument();
    expect(screen.getByText('42W - 5L (89%)')).toBeInTheDocument();
    expect(screen.getByText('DefuseKing')).toBeInTheDocument();
    expect(screen.getByText('28W - 12L (68%)')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-row-2')).toBeInTheDocument();
  });

  it('renders loading state when loading is true', () => {
    render(
      <CriticalRankedLeaderboard
        entries={[]}
        loading={true}
        title="Top Competitors"
        subtitle="Loading..."
        emptyMessage="No duelists"
      />,
    );

    expect(
      screen.getByTestId('ranked-leaderboard-loading'),
    ).toBeInTheDocument();
  });

  it('renders empty message when no entries exist', () => {
    render(
      <CriticalRankedLeaderboard
        entries={[]}
        loading={false}
        title="Top Competitors"
        subtitle="Current rankings"
        emptyMessage="Be the first to claim Rank #1 in Critical this season!"
      />,
    );

    expect(screen.getByTestId('ranked-leaderboard-empty')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Be the first to claim Rank #1 in Critical this season!',
      ),
    ).toBeInTheDocument();
  });
});
