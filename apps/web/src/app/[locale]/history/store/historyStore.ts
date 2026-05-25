import { create } from 'zustand';
import type { HistorySummary } from '../types';

interface HistoryState {
  // Selection
  selectedEntry: HistorySummary | null;

  // Participant Selection for Rematch
  participantSelection: Record<string, boolean>;

  // Actions
  selectEntry: (entry: HistorySummary | null, currentUserId?: string) => void;
  toggleParticipant: (id: string, value: boolean) => void;
  setParticipantSelection: (selection: Record<string, boolean>) => void;
  reset: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  selectedEntry: null,
  participantSelection: {},

  selectEntry: (entry, _currentUserId) => {
    // When selecting an entry, we can auto-populate participants if we have the data right there,
    // or just reset selection.
    // However, the participant list usually comes from the FULL detail, which might not be loaded yet.
    // So distinct from 'detail', selectedEntry is just the summary.
    // We will reset selection first.
    set({ selectedEntry: entry, participantSelection: {} });

    // NOTE: The actual initialization of participantSelection with "others selected by default"
    // should happen when the Detail data is loaded (in the hook/component).
    // Or we could do it here if we passed the full detail, but we only have summary.
  },

  toggleParticipant: (id, value) =>
    set((state) => ({
      participantSelection: { ...state.participantSelection, [id]: value },
    })),

  setParticipantSelection: (selection) =>
    set({ participantSelection: selection }),

  reset: () => set({ selectedEntry: null, participantSelection: {} }),
}));
