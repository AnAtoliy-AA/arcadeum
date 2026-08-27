import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostGameAnalytics } from './PostGameAnalytics';
import type { TranslationKey } from '@/shared/lib/useTranslation';

const mockT = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => {
  if (params?.seconds) return `${params.seconds}s / turn`;
  if (params?.count) return `${params.count} actions`;
  return key;
};

describe('PostGameAnalytics', () => {
  it('renders highlights and moves timeline tab by default', () => {
    render(
      <PostGameAnalytics
        stats={{ turns: 10, duration: 60, accuracy: '80%' }}
        moveTimeline={[
          {
            turn: 1,
            description: 'Fired missile at B4',
            playerId: 'user1',
          },
          {
            turn: 2,
            description: 'Placed ship defense',
            playerId: 'bot-1',
          },
        ]}
        headToHead={null}
        headToHeadLoading={false}
        trends={null}
        trendsLoading={false}
        onLoadHeadToHead={vi.fn()}
        onLoadTrends={vi.fn()}
        currentUserId="user1"
        t={mockT}
      />,
    );

    expect(screen.getByText('Fired missile at B4')).toBeInTheDocument();
    expect(screen.getByText('Placed ship defense')).toBeInTheDocument();
    expect(screen.getByText('Accuracy: 80%')).toBeInTheDocument();
  });

  it('allows filtering moves timeline by user and opponent', () => {
    render(
      <PostGameAnalytics
        moveTimeline={[
          {
            turn: 1,
            description: 'My Special Move',
            playerId: 'user1',
          },
          {
            turn: 2,
            description: 'Opponent Counter Move',
            playerId: 'bot-1',
          },
        ]}
        headToHead={null}
        headToHeadLoading={false}
        trends={null}
        trendsLoading={false}
        onLoadHeadToHead={vi.fn()}
        onLoadTrends={vi.fn()}
        currentUserId="user1"
        t={mockT}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'games.table.analytics.moves.filterMine',
      }),
    );
    expect(screen.getByText('My Special Move')).toBeInTheDocument();
    expect(screen.queryByText('Opponent Counter Move')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'games.table.analytics.moves.filterOpponent',
      }),
    );
    expect(screen.queryByText('My Special Move')).not.toBeInTheDocument();
    expect(screen.getByText('Opponent Counter Move')).toBeInTheDocument();
  });

  it('switches to rivalry head-to-head tab and triggers onLoadHeadToHead', () => {
    const handleLoadHeadToHead = vi.fn();
    render(
      <PostGameAnalytics
        moveTimeline={[]}
        headToHead={{
          totalGames: 5,
          player1: { wins: 3, losses: 2, draws: 0 },
          player2: { wins: 2, losses: 3, draws: 0 },
        }}
        headToHeadLoading={false}
        trends={null}
        trendsLoading={false}
        onLoadHeadToHead={handleLoadHeadToHead}
        onLoadTrends={vi.fn()}
        currentUserId="user1"
        opponentId="user2"
        t={mockT}
      />,
    );

    fireEvent.click(screen.getByText('games.table.analytics.tabs.headToHead'));
    expect(handleLoadHeadToHead).toHaveBeenCalledTimes(1);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('switches to performance trends tab and displays form strip', () => {
    const handleLoadTrends = vi.fn();
    render(
      <PostGameAnalytics
        moveTimeline={[]}
        headToHead={null}
        headToHeadLoading={false}
        trends={{
          records: [
            { result: 'won', timestamp: 1000, sessionId: 's1' },
            { result: 'lost', timestamp: 2000, sessionId: 's2' },
          ],
          winRate: 50,
          currentStreak: 2,
          currentStreakType: 'won',
        }}
        trendsLoading={false}
        onLoadHeadToHead={vi.fn()}
        onLoadTrends={handleLoadTrends}
        currentUserId="user1"
        t={mockT}
      />,
    );

    fireEvent.click(screen.getByText('games.table.analytics.tabs.trends'));
    expect(handleLoadTrends).toHaveBeenCalledTimes(1);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });
});
