import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventBanner } from './EventBanner';
import { useEventsStore } from '../store/eventsStore';
import type { GameNightEvent } from '../model/types';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params ? `${key}:${params.date}` : key,
  }),
}));

const EVENT: GameNightEvent = {
  id: 'evt-1',
  title: 'Friday Chess Night',
  description: '',
  gameType: 'chess',
  status: 'upcoming',
  startTime: '2030-01-05T18:00:00.000Z',
  endTime: '2030-01-05T20:00:00.000Z',
  prizeBadge: null,
  participantCount: 0,
  activeGamesCount: 0,
  mvpUserId: null,
  mvpDisplayName: null,
  mvpPoints: 0,
  createdAt: '2029-12-01T00:00:00.000Z',
};

describe('EventBanner', () => {
  beforeEach(() => {
    useEventsStore.setState({
      featuredEvent: EVENT,
      fetchFeaturedEvent: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('explains an upcoming event with a start time and a plain default description', () => {
    render(<EventBanner />);
    expect(screen.getByText('home.eventBadgeUpcoming')).toBeInTheDocument();
    expect(
      screen.getByText('home.eventDefaultDescription'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('event-banner-starts-at').textContent).toContain(
      'home.eventStartsAt',
    );
    expect(screen.getByText('home.eventActionUpcoming')).toBeInTheDocument();
  });

  it('shows live badge and play action without a start line when active', () => {
    useEventsStore.setState({
      featuredEvent: { ...EVENT, status: 'active' },
    });
    render(<EventBanner />);
    expect(screen.getByText('home.eventBadgeLive')).toBeInTheDocument();
    expect(screen.getByText('home.eventActionLive')).toBeInTheDocument();
    expect(screen.queryByTestId('event-banner-starts-at')).toBeNull();
  });
});
