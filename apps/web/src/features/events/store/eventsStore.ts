import { create } from 'zustand';
import type {
  GameNightEvent,
  GameNightEventDetail,
  EventStatus,
} from '../model/types';
import { eventsApi } from '../api';

interface EventsState {
  events: GameNightEvent[];
  featuredEvent: GameNightEvent | null;
  currentEvent: GameNightEventDetail | null;
  loading: boolean;
  error: string | null;

  fetchEvents: (status?: EventStatus, token?: string) => Promise<void>;
  fetchFeaturedEvent: (token?: string) => Promise<void>;
  fetchEventById: (id: string, token?: string) => Promise<void>;
  joinEvent: (id: string, token: string) => Promise<GameNightEventDetail>;
  resetCurrentEvent: () => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  featuredEvent: null,
  currentEvent: null,
  loading: false,
  error: null,

  fetchEvents: async (status, token) => {
    set({ loading: true, error: null });
    try {
      const data = await eventsApi.getEvents(
        status ? { status } : undefined,
        token ? { token } : undefined,
      );
      set({ events: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchFeaturedEvent: async (token) => {
    try {
      const data = await eventsApi.getFeaturedEvent(
        token ? { token } : undefined,
      );
      set({ featuredEvent: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchEventById: async (id, token) => {
    set({ loading: true, error: null });
    try {
      const data = await eventsApi.getEventById(
        id,
        token ? { token } : undefined,
      );
      set({ currentEvent: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  joinEvent: async (id, token) => {
    set({ loading: true, error: null });
    try {
      const updated = await eventsApi.joinEvent(id, { token });
      set({ currentEvent: updated, loading: false });
      return updated;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  resetCurrentEvent: () => {
    set({ currentEvent: null, error: null });
  },
}));
