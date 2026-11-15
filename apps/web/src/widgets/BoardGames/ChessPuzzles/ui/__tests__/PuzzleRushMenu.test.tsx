import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleRushMenu } from '../PuzzleRushMenu';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'games.chess_v1.puzzleRush.title': 'Puzzle Rush',
        'games.chess_v1.puzzleRush.subtitle': 'Solve as many as you can',
        'games.chess_v1.puzzleRush.survival': 'Survival Mode',
        'games.chess_v1.puzzleRush.timed': 'Timed Mode',
        'games.chess_v1.puzzleRush.viewLeaderboard': 'View Leaderboard',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('@/shared/lib/daily-streak', () => ({
  DailyStreakManager: {
    getStreakState: () => ({
      currentStreak: 4,
      longestStreak: 7,
      lastCompletedDateString: '2026-10-04',
      freezeTokens: 1,
    }),
    calculateXpMultiplier: (streak: number) => (streak > 0 ? 1.4 : 1.0),
  },
}));

describe('PuzzleRushMenu', () => {
  it('renders menu with high scores and streak badge', () => {
    const handleStart = vi.fn();
    const handleLeaderboard = vi.fn();

    render(
      <PuzzleRushMenu
        highScores={{ survival: 32, timed: 24 }}
        onStart={handleStart}
        onOpenLeaderboard={handleLeaderboard}
      />,
    );

    expect(screen.getByText('Puzzle Rush')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText(/4 Day Streak/i)).toBeInTheDocument();

    const survivalBtn = screen.getByTestId('puzzle-rush-survival-btn');
    fireEvent.click(survivalBtn);
    expect(handleStart).toHaveBeenCalledWith('survival');

    const lbBtn = screen.getByTestId('puzzle-rush-leaderboard-btn');
    fireEvent.click(lbBtn);
    expect(handleLeaderboard).toHaveBeenCalled();
  });
});
