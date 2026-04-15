import { create } from 'zustand';

interface RefreshState {
  signals: Record<string, number>;
  triggerRefresh: (key: string | string[]) => void;
  getSignal: (key: string) => number;
}

export const useRefreshStore = create<RefreshState>((set, get) => ({
  signals: {},
  triggerRefresh: (key) => {
    const keys = Array.isArray(key) ? key : [key];
    set((state) => {
      const nextSignals = { ...state.signals };
      keys.forEach((k) => {
        nextSignals[k] = (nextSignals[k] || 0) + 1;
      });
      return { signals: nextSignals };
    });
  },
  getSignal: (key) => get().signals[key] || 0,
}));
