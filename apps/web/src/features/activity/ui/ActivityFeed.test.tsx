import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ActivityFeed } from './ActivityFeed';
import * as api from '@/shared/api/activity';
import type { ActivityFeedItem } from '@/shared/api/activity';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));
vi.mock('@/shared/i18n/useLanguage', () => ({
  useLanguage: () => ({ locale: 'en', messages: {} }),
}));
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));
vi.mock('@/shared/ui/PlayerAvatar', () => ({
  EquippedPlayerAvatar: ({ name }: { name: string }) => (
    <span data-testid="avatar">{name}</span>
  ),
}));
vi.mock('@/shared/api/activity', async (orig) => ({
  ...(await orig<typeof import('@/shared/api/activity')>()),
  fetchActivityFeed: vi.fn(),
}));

const ALICE = {
  kind: 'user' as const,
  name: 'Alice',
  profileId: 'u-alice',
  avatarId: null,
  frameId: null,
  role: null,
};
const BOT = { ...ALICE, kind: 'bot' as const, name: null, profileId: null };
const GUEST = { ...ALICE, kind: 'guest' as const, name: null, profileId: null };

function item(
  id: string,
  over: Partial<ActivityFeedItem> = {},
): ActivityFeedItem {
  return {
    id,
    type: 'game_completed',
    timestamp: new Date().toISOString(),
    gameId: 'chess_v1',
    actor: ALICE,
    opponents: [GUEST],
    teammates: [],
    result: 'win',
    endReason: null,
    score: null,
    ratingDelta: null,
    replayId: null,
    achievement: null,
    level: null,
    streak: null,
    tournament: null,
    ...over,
  };
}

const mocked = vi.mocked(api.fetchActivityFeed);

describe('ActivityFeed', () => {
  beforeEach(() => mocked.mockReset());
  afterEach(() => vi.useRealTimers());

  it('shows a skeleton while loading', async () => {
    let resolve: (page: api.ActivityFeedPage) => void = () => {};
    mocked.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<ActivityFeed />);
    expect(screen.getByTestId('activity-feed-skeleton')).toBeInTheDocument();
    await act(async () => resolve({ items: [], hasMore: false }));
    expect(screen.queryByTestId('activity-feed-skeleton')).toBeNull();
  });

  it('explains the empty state and offers a call to action', async () => {
    mocked.mockResolvedValue({ items: [], hasMore: false });
    render(<ActivityFeed />);
    expect(
      await screen.findByText('home.homeRecentActivityEmpty'),
    ).toBeInTheDocument();
    expect(screen.getByText('home.activityFeed.emptyCta')).toBeInTheDocument();
  });

  it('shows an error with a retry that reloads', async () => {
    mocked.mockRejectedValueOnce(new Error('x'));
    mocked.mockResolvedValueOnce({ items: [item('a')], hasMore: false });
    render(<ActivityFeed />);
    expect(
      await screen.findByText('home.homeRecentActivityError'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('home.activityFeed.retry'));
    expect(await screen.findByTestId('activity-card')).toBeInTheDocument();
  });

  it('renders names, profile links, result chips and replay links', async () => {
    mocked.mockResolvedValue({
      items: [
        item('a', {
          replayId: 'rp-1',
          opponents: [BOT],
          score: { actor: 3, opponents: [1] },
          ratingDelta: 12,
          endReason: 'timeout',
        }),
        item('b', { actor: GUEST, opponents: [ALICE], result: 'draw' }),
      ],
      hasMore: false,
    });
    render(<ActivityFeed />);
    const cards = await screen.findAllByTestId('activity-card');
    const first = within(cards[0]);
    expect(first.getByRole('link', { name: 'Alice' })).toHaveAttribute(
      'href',
      expect.stringContaining('u-alice'),
    );
    expect(first.getByText('home.activityFeed.resultWin')).toBeInTheDocument();
    expect(
      first.getByText('home.activityFeed.reasonTimeout'),
    ).toBeInTheDocument();
    expect(first.getByText('3 - 1')).toBeInTheDocument();
    expect(first.getByText('+12')).toBeInTheDocument();
    expect(first.getByTestId('activity-action-replay')).toHaveAttribute(
      'href',
      '/en/replay/rp-1',
    );
    expect(
      first.getByText(/home\.activityFeed\.versus.*home\.activityFeed\.bot/),
    ).toBeInTheDocument();

    const second = within(cards[1]);
    expect(
      second.getAllByText('home.activityFeed.guest').length,
    ).toBeGreaterThan(0);
    expect(
      second.queryByRole('link', { name: 'home.activityFeed.guest' }),
    ).toBeNull();
    expect(
      second.getByText('home.activityFeed.resultDraw'),
    ).toBeInTheDocument();
    expect(second.getByTestId('activity-action-game')).toHaveAttribute(
      'href',
      '/en/games/chess',
    );
  });

  it('groups repeated wins into one card', async () => {
    mocked.mockResolvedValue({
      items: [item('a'), item('b'), item('c')],
      hasMore: false,
    });
    render(<ActivityFeed />);
    const group = await screen.findByTestId('activity-group');
    expect(
      within(group).getByText(/home\.activityFeed\.groupWins.*"count":3/),
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId('activity-card')).toHaveLength(0);
  });

  it('refetches with the selected filter tab', async () => {
    mocked.mockResolvedValue({ items: [item('a')], hasMore: false });
    render(<ActivityFeed />);
    await screen.findByTestId('activity-card');
    fireEvent.click(screen.getByTestId('activity-filter-wins'));
    await waitFor(() =>
      expect(mocked).toHaveBeenLastCalledWith(
        expect.objectContaining({ filter: 'wins' }),
      ),
    );
  });

  it('loads older items with the last timestamp as cursor', async () => {
    const first = item('a', { timestamp: '2026-11-28T10:00:00.000Z' });
    mocked.mockResolvedValueOnce({ items: [first], hasMore: true });
    mocked.mockResolvedValueOnce({
      items: [
        item('z', { timestamp: '2026-11-28T09:00:00.000Z', actor: GUEST }),
      ],
      hasMore: false,
    });
    render(<ActivityFeed />);
    fireEvent.click(await screen.findByTestId('activity-feed-more'));
    await waitFor(() =>
      expect(screen.getAllByTestId('activity-card')).toHaveLength(2),
    );
    expect(mocked).toHaveBeenLastCalledWith(
      expect.objectContaining({ before: '2026-11-28T10:00:00.000Z' }),
    );
    expect(screen.queryByTestId('activity-feed-more')).toBeNull();
  });

  it('holds polled items behind a "new activity" pill instead of jumping', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mocked.mockResolvedValueOnce({
      items: [item('a', { actor: GUEST })],
      hasMore: false,
    });
    mocked.mockResolvedValue({
      items: [
        item('n', { actor: GUEST, result: 'draw' }),
        item('a', { actor: GUEST }),
      ],
      hasMore: false,
    });
    render(<ActivityFeed />);
    await screen.findByTestId('activity-card');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    const pill = await screen.findByTestId('activity-feed-new');
    expect(screen.getAllByTestId('activity-card')).toHaveLength(1);
    fireEvent.click(pill);
    expect(screen.getAllByTestId('activity-card')).toHaveLength(2);
    expect(screen.queryByTestId('activity-feed-new')).toBeNull();
  });
});
