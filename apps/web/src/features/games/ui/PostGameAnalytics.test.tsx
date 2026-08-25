import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostGameAnalytics } from './PostGameAnalytics';
import type { TranslationKey } from '@/shared/lib/useTranslation';

const mockT = (key: TranslationKey) => key;

describe('PostGameAnalytics', () => {
  it('defaults to moves tab when move timeline is available', () => {
    render(
      <PostGameAnalytics
        moveTimeline={[
          {
            turn: 1,
            description: 'Played card',
            playerId: 'user1',
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

    expect(screen.getByText('Played card')).toBeInTheDocument();
  });

  it('defaults to head to head tab when no moves but opponentId is present', () => {
    const handleLoadHeadToHead = vi.fn();
    render(
      <PostGameAnalytics
        moveTimeline={[]}
        headToHead={{
          totalGames: 10,
          player1: { wins: 6, losses: 4, draws: 0 },
          player2: { wins: 4, losses: 6, draws: 0 },
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

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('allows switching to trends tab', () => {
    const handleLoadTrends = vi.fn();
    render(
      <PostGameAnalytics
        moveTimeline={[]}
        headToHead={null}
        headToHeadLoading={false}
        trends={{
          records: [
            {
              result: 'won',
              timestamp: 1000,
              sessionId: 's1',
            },
          ],
          winRate: 60,
          currentStreak: 3,
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
    expect(handleLoadTrends).toHaveBeenCalled();
  });
});
