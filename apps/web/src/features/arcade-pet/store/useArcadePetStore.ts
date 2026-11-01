import { create } from 'zustand';
import {
  applyDeterministicDecay,
  createInitialPet,
  executePetAction,
  type GameTreatId,
  type PetActionType,
  type PetSpecies,
  type PetState,
} from '@arcadeum/games-core';

interface ArcadePetStoreState {
  pet: PetState | null;
  isWidgetOpen: boolean;
  activeTreat: GameTreatId | null;
  initialize: (userId?: string, theme?: string) => void;
  performAction: (action: PetActionType, treatId?: GameTreatId) => void;
  hatch: (name: string, species: PetSpecies, theme?: string) => void;
  awardTreat: (treatId: GameTreatId) => void;
  toggleWidget: () => void;
  setWidgetOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'arcadeum_pet_state';

function loadStoredPet(): PetState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PetState;
    return applyDeterministicDecay(parsed);
  } catch {
    return null;
  }
}

function saveStoredPet(pet: PetState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
  } catch {}
}

export const useArcadePetStore = create<ArcadePetStoreState>((set, get) => ({
  pet: null,
  isWidgetOpen: false,
  activeTreat: null,

  initialize: (userId = 'local-user', theme = 'retro') => {
    const current = get().pet;
    if (current) {
      const refreshed = applyDeterministicDecay(current);
      set({ pet: refreshed });
      saveStoredPet(refreshed);
      return;
    }

    const stored = loadStoredPet();
    if (stored) {
      set({ pet: stored });
      return;
    }

    const initial = createInitialPet({ id: userId, name: 'ArcadePet', theme });
    set({ pet: initial });
    saveStoredPet(initial);
  },

  performAction: (action, treatId) => {
    const current = get().pet;
    if (!current) return;

    const result = executePetAction(current, action, { treatId });
    if (result.success) {
      set({ pet: result.state });
      saveStoredPet(result.state);
    }
  },

  hatch: (name, species, theme) => {
    const current = get().pet;
    if (!current) return;

    const result = executePetAction(current, 'hatch', { species, theme });
    if (result.success) {
      result.state.name = name;
      set({ pet: result.state });
      saveStoredPet(result.state);
    }
  },

  awardTreat: (treatId) => {
    const current = get().pet;
    if (!current) return;

    const count = current.inventory[treatId] ?? 0;
    const updated: PetState = {
      ...current,
      inventory: {
        ...current.inventory,
        [treatId]: count + 1,
      },
    };
    set({ pet: updated });
    saveStoredPet(updated);
  },

  toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
  setWidgetOpen: (open) => set({ isWidgetOpen: open }),
}));
