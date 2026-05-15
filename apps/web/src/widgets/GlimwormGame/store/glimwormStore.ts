import { create } from 'zustand';
import type {
  ConnectionStatus,
  GlimwormDiscreteEvent,
  GlimwormSnapshot,
} from '../types';

interface GlimwormStoreState {
  latestSnapshot: GlimwormSnapshot | null;
  previousSnapshot: GlimwormSnapshot | null;
  localInput: { angle: number; usePowerup: boolean };
  selectedColor: string | null;
  connectionStatus: ConnectionStatus;
  discreteEvents: GlimwormDiscreteEvent[];

  ingestSnapshot: (snap: GlimwormSnapshot) => void;
  setInput: (input: { angle: number; usePowerup: boolean }) => void;
  setColor: (color: string | null) => void;
  setStatus: (status: ConnectionStatus) => void;
  pushEvent: (ev: GlimwormDiscreteEvent) => void;
  popEvents: () => GlimwormDiscreteEvent[];
  reset: () => void;
}

const initialState = {
  latestSnapshot: null,
  previousSnapshot: null,
  localInput: { angle: 0, usePowerup: false },
  selectedColor: null,
  connectionStatus: 'idle' as ConnectionStatus,
  discreteEvents: [] as GlimwormDiscreteEvent[],
};

export const useGlimwormStore = create<GlimwormStoreState>((set, get) => ({
  ...initialState,

  ingestSnapshot: (snap) =>
    set((state) => ({
      previousSnapshot: state.latestSnapshot,
      latestSnapshot: snap,
    })),

  setInput: (input) => set({ localInput: input }),

  setColor: (color) => set({ selectedColor: color }),

  setStatus: (status) => set({ connectionStatus: status }),

  pushEvent: (ev) =>
    set((state) => ({ discreteEvents: [...state.discreteEvents, ev] })),

  popEvents: () => {
    const events = get().discreteEvents;
    if (events.length === 0) return [];
    set({ discreteEvents: [] });
    return events;
  },

  reset: () => set({ ...initialState }),
}));
