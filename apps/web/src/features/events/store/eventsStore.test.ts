import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEventsStore } from './eventsStore';
import { eventsApi } from '../api';
import type { GameNightEvent, GameNightEventDetail } from '../model/types';

vi.mock('../api', () => ({
  eventsApi: {
    getEvents: vi.fn(),
    getFeaturedEvent: vi.fn(),
    getEventById: vi.fn(),
    joinEvent: vi.fn(),
  },
}));

describe('eventsStore', () => {
  const mockEvent: GameNightEvent = {
    id: 'evt-1',
    title: 'Friday Night Blitz Chess',
    description: 'Blitz showdown.',
    gameType: 'chess',
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    prizeBadge: 'champion_crown',
    participantCount: 2,
    activeGamesCount: 1,
    mvpUserId: 'user-1',
    mvpDisplayName: 'GrandmasterAlex',
    mvpPoints: 12,
    createdAt: new Date().toISOString(),
  };

  const mockDetail: GameNightEventDetail = {
    ...mockEvent,
    participants: [],
    leaderboard: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useEventsStore.setState({
      events: [],
      featuredEvent: null,
      currentEvent: null,
      loading: false,
      error: null,
    });
  });

  it('fetchEvents sets event list', async () => {
    vi.mocked(eventsApi.getEvents).mockResolvedValue([mockEvent]);

    await useEventsStore.getState().fetchEvents();

    expect(useEventsStore.getState().events).toEqual([mockEvent]);
    expect(useEventsStore.getState().loading).toBe(false);
  });

  it('fetchFeaturedEvent sets featured event', async () => {
    vi.mocked(eventsApi.getFeaturedEvent).mockResolvedValue(mockEvent);

    await useEventsStore.getState().fetchFeaturedEvent();

    expect(useEventsStore.getState().featuredEvent).toEqual(mockEvent);
  });

  it('fetchEventById sets current event detail', async () => {
    vi.mocked(eventsApi.getEventById).mockResolvedValue(mockDetail);

    await useEventsStore.getState().fetchEventById('evt-1');

    expect(useEventsStore.getState().currentEvent).toEqual(mockDetail);
  });

  it('joinEvent updates current event', async () => {
    vi.mocked(eventsApi.joinEvent).mockResolvedValue(mockDetail);

    const result = await useEventsStore
      .getState()
      .joinEvent('evt-1', 'fake-token');

    expect(result).toEqual(mockDetail);
    expect(useEventsStore.getState().currentEvent).toEqual(mockDetail);
  });
});
