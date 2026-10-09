import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PuzzleRushLeaderboard } from '../PuzzleRushLeaderboard';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'games.chess_v1.puzzleRush.leaderboardTitle': 'Leaderboard',
        'games.chess_v1.puzzleRush.survival': 'Survival Mode',
        'games.chess_v1.puzzleRush.timed': 'Timed Mode',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('@/features/chess/lib/puzzle-rush-api', () => ({
  fetchPuzzleRushLeaderboard: vi.fn().mockImplementation((mode: string) => {
    if (mode === 'survival') {
      return Promise.resolve([
        {
          rank: 1,
          userId: 'user_alpha',
          username: 'AlphaTactics',
          score: 45,
          bestStreak: 45,
          totalTimeSeconds: 400,
          rating: 2500,
          createdAt: '2026-10-01T00:00:00Z',
        },
      ]);
    }
    return Promise.resolve([
      {
        rank: 1,
        userId: 'user_speed',
        username: 'SpeedDemon99',
        score: 38,
        bestStreak: 25,
        totalTimeSeconds: 180,
        rating: 2400,
        createdAt: '2026-10-01T00:00:00Z',
      },
    ]);
  }),
}));

describe('PuzzleRushLeaderboard', () => {
  it('renders leaderboard entries for initial mode', async () => {
    render(<PuzzleRushLeaderboard initialMode="survival" />);

    await waitFor(() => {
      expect(screen.getByText('AlphaTactics')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  it('switches modes when tab is clicked', async () => {
    render(<PuzzleRushLeaderboard initialMode="survival" />);

    await waitFor(() => {
      expect(screen.getByText('AlphaTactics')).toBeInTheDocument();
    });

    const timedTab = screen.getByTestId('leaderboard-tab-timed');
    fireEvent.click(timedTab);

    await waitFor(() => {
      expect(screen.getByText('SpeedDemon99')).toBeInTheDocument();
      expect(screen.getByText('38')).toBeInTheDocument();
    });
  });

  it('invokes onBack when back button is pressed', async () => {
    const handleBack = vi.fn();
    render(<PuzzleRushLeaderboard onBack={handleBack} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('rush-leaderboard-back-btn'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('rush-leaderboard-back-btn'));
    expect(handleBack).toHaveBeenCalled();
  });
});
