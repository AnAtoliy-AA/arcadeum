import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SeasonBanner } from './SeasonBanner';
import type { SeasonDetailView } from '../model/types';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params && 'days' in params ? `${key}(${params.days})` : key,
  }),
}));

const getCurrentSeason = vi.fn();

vi.mock('../api', () => ({
  seasonsApi: {
    getCurrentSeason: () => getCurrentSeason(),
    getLeaderboard: vi.fn(),
  },
}));

function makeSeason(
  overrides: Partial<SeasonDetailView> = {},
): SeasonDetailView {
  const now = Date.now();
  return {
    id: '2026Q3',
    number: 3,
    theme: 'ember',
    status: 'active',
    startsAt: new Date(now - 15 * 86_400_000).toISOString(),
    endsAt: new Date(now + 15 * 86_400_000).toISOString(),
    rewardTiers: [
      {
        rankFrom: 1,
        rankTo: 1,
        rewardId: 'season_champion',
        kind: 'badge',
        icon: '♛',
        color: '#ec4899',
      },
      {
        rankFrom: 2,
        rankTo: 10,
        rewardId: 'season_top10',
        kind: 'boardSkin',
        icon: '◆',
        color: '#22d3ee',
      },
    ],
    archivedAt: null,
    champions: [],
    ...overrides,
  };
}

beforeEach(() => {
  getCurrentSeason.mockReset();
});

describe('SeasonBanner', () => {
  it('renders the themed identity, countdown and rewards once loaded', async () => {
    getCurrentSeason.mockResolvedValue(makeSeason());

    render(<SeasonBanner />);

    await waitFor(() => {
      expect(screen.getByTestId('season-banner')).toBeTruthy();
    });
    expect(screen.getByTestId('season-banner-eyebrow').textContent).toContain(
      'pages.seasons.label 3',
    );
    expect(screen.getByTestId('season-banner-title').textContent).toBe(
      'pages.seasons.theme.ember',
    );
    expect(screen.getByTestId('season-banner-countdown').textContent).toContain(
      'pages.seasons.daysLeft(',
    );
    expect(screen.getAllByTestId('season-reward-row')).toHaveLength(2);
  });

  it('exposes an accessible progressbar roughly mid-season', async () => {
    getCurrentSeason.mockResolvedValue(makeSeason());

    render(<SeasonBanner />);

    const bar = await screen.findByRole('progressbar');
    const value = Number(bar.getAttribute('aria-valuenow'));
    expect(value).toBeGreaterThan(30);
    expect(value).toBeLessThan(70);
  });

  it('renders nothing while loading or when no season exists', async () => {
    getCurrentSeason.mockResolvedValue(null);

    const { container } = render(<SeasonBanner />);

    await waitFor(() => {
      expect(getCurrentSeason).toHaveBeenCalled();
    });
    expect(container.querySelector('[data-testid="season-banner"]')).toBeNull();
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('renders without a rewards section when tiers are empty', async () => {
    getCurrentSeason.mockResolvedValue(makeSeason({ rewardTiers: [] }));

    render(<SeasonBanner />);

    await screen.findByTestId('season-banner');
    expect(screen.queryByTestId('season-rewards')).toBeNull();
  });
});
