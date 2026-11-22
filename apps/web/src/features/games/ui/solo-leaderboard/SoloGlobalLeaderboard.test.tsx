import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SoloGlobalLeaderboard } from './SoloGlobalLeaderboard';
import {
  soloScoresApi,
  type SoloLeaderboardEntry,
} from '@/shared/api/soloScores';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/api/soloScores', () => ({
  soloScoresApi: { getLeaderboard: vi.fn() },
}));

const baseEntry: SoloLeaderboardEntry = {
  rank: 1,
  playerId: 'p1',
  username: 'alice',
  displayName: 'Alice',
  score: 0,
  moves: 12,
  durationMs: 60_000,
  totalGames: 3,
  equippedAvatarId: null,
  equippedBadgeId: null,
  equippedNameColorId: null,
  equippedFrameId: null,
};

function rowText(): string {
  const name = screen.getByText('Alice');
  const row = name.closest('div[class*="grid"]');
  return row?.textContent ?? '';
}

describe('SoloGlobalLeaderboard', () => {
  beforeEach(() => {
    vi.mocked(soloScoresApi.getLeaderboard).mockResolvedValue({
      entries: [{ ...baseEntry }],
      total: 1,
    });
  });

  it('shows the ranked time first for time-sorted games', async () => {
    render(
      <SoloGlobalLeaderboard
        gameId="minesweeper_v1"
        difficulty="beginner"
        sortBy="durationMs"
        order="asc"
      />,
    );

    await screen.findByText('Alice');
    const text = rowText();
    const timeIndex = text.indexOf('01:00');
    expect(timeIndex).toBeGreaterThanOrEqual(0);
    expect(timeIndex).toBeLessThan(text.indexOf('-'));
  });

  it('shows the score first for score-sorted games', async () => {
    vi.mocked(soloScoresApi.getLeaderboard).mockResolvedValue({
      entries: [{ ...baseEntry, score: 1234 }],
      total: 1,
    });

    render(
      <SoloGlobalLeaderboard
        gameId="solitaire_v1"
        difficulty="default"
        sortBy="score"
        order="desc"
      />,
    );

    await screen.findByText('Alice');
    const text = rowText();
    expect(text.indexOf('1,234')).toBeLessThan(text.indexOf('01:00'));
  });

  it('renders an empty score cell when the game has no scores', async () => {
    render(
      <SoloGlobalLeaderboard
        gameId="sudoku_v1"
        difficulty="easy"
        sortBy="durationMs"
        order="asc"
      />,
    );

    await screen.findByText('Alice');
    expect(rowText()).toContain('-');
    expect(rowText()).not.toContain('00:00');
  });
});
