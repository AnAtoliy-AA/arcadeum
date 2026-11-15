import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CriticalRankedHub } from './CriticalRankedHub';
import type { RankingPlayer } from '@/features/ranking/model/types';

const joinQueueMock = vi.fn();
const leaveQueueMock = vi.fn();

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { accessToken: 'token-123', userId: 'user-abc' },
  }),
}));

const mockRankingStoreState = {
  ratings: {
    critical_v1: {
      gameId: 'critical_v1',
      season: '2026Q4',
      elo: 1540,
      tier: 'gold' as const,
      peakElo: 1590,
      wins: 15,
      losses: 3,
      draws: 0,
      rankedGames: 18,
      rank: 4,
    },
  },
};

vi.mock('@/features/ranking/store/rankingStore', () => ({
  useRankingStore: (selector: (s: typeof mockRankingStoreState) => unknown) =>
    selector(mockRankingStoreState),
}));

let mockMatchmakingState = {
  isQueued: false,
  gameId: null as string | null,
  ranked: null as boolean | null,
  joinQueue: joinQueueMock,
  leaveQueue: leaveQueueMock,
};

vi.mock('@/features/games/ui/MatchmakingQueue', () => ({
  useMatchmaking: () => mockMatchmakingState,
}));

vi.mock('@/features/ranking/api', () => ({
  rankingApi: {
    getRankings: vi.fn().mockResolvedValue({
      gameId: 'critical_v1',
      season: '2026Q4',
      total: 1,
      entries: [
        {
          rank: 1,
          userId: 'pro-1',
          username: 'ApexDuelist',
          elo: 2200,
          tier: 'master',
          wins: 50,
          losses: 2,
          draws: 0,
          peakElo: 2220,
        },
      ] as RankingPlayer[],
    }),
  },
}));

describe('CriticalRankedHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchmakingState = {
      isQueued: false,
      gameId: null,
      ranked: null,
      joinQueue: joinQueueMock,
      leaveQueue: leaveQueueMock,
    };
  });

  it('renders section title, kicker, user rating, and rule cards', async () => {
    render(<CriticalRankedHub initialLeaderboard={[]} />);

    expect(screen.getByTestId('critical-ranked-hub')).toBeInTheDocument();
    expect(
      screen.getByText('Critical Ranked ELO & Duel Arena'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('user-ranked-elo')).toHaveTextContent('1540');
    expect(screen.getByText('Ranked 1v1 Duel Rules')).toBeInTheDocument();
    expect(screen.getByText('High-Stakes 1v1 Duel')).toBeInTheDocument();
    expect(screen.getByText('Secret Bomb Re-Insertion')).toBeInTheDocument();
    expect(screen.getByText('Dynamic ELO Stakes')).toBeInTheDocument();
  });

  it('triggers joinQueue with ranked=true when clicking the queue button', () => {
    render(<CriticalRankedHub initialLeaderboard={[]} />);

    const queueButton = screen.getByTestId('queue-ranked-critical-button');
    expect(queueButton).toHaveTextContent('Queue Ranked 1v1 Showdown');

    fireEvent.click(queueButton);
    expect(joinQueueMock).toHaveBeenCalledWith('critical_v1', undefined, true);
  });

  it('renders cancel queue state when user is currently in ranked queue for critical', () => {
    mockMatchmakingState = {
      isQueued: true,
      gameId: 'critical_v1',
      ranked: true,
      joinQueue: joinQueueMock,
      leaveQueue: leaveQueueMock,
    };

    render(<CriticalRankedHub initialLeaderboard={[]} />);

    const queueButton = screen.getByTestId('queue-ranked-critical-button');
    expect(queueButton).toHaveTextContent('Cancel Queue');
    expect(
      screen.getByText('Searching for ranked opponent...'),
    ).toBeInTheDocument();

    fireEvent.click(queueButton);
    expect(leaveQueueMock).toHaveBeenCalledTimes(1);
  });
});
