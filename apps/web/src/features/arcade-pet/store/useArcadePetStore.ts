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
import {
  getPetAdoptionCost,
  getRandomPetSpec,
  SELECT_PET_COST,
  type PetGiftPresent,
} from '../lib/arcade-pet-economy';

interface ArcadePetStoreState {
  pet: PetState | null;
  pets: PetState[];
  activePetId: string | null;
  gemBalance: number;
  adoptionCount: number;
  queuedThemeForNextPet: string | null;
  presents: PetGiftPresent[];
  isWidgetOpen: boolean;
  isAtHome: boolean;
  activeTreat: GameTreatId | null;
  initialize: (userId?: string, theme?: string) => void;
  performAction: (action: PetActionType, treatId?: GameTreatId) => void;
  hatch: (name: string, species: PetSpecies, theme?: string) => void;
  awardTreat: (treatId: GameTreatId) => void;
  adoptRandomPet: () => { success: boolean; pet?: PetState; error?: string };
  adoptSelectedPet: (
    species: PetSpecies,
    theme: string,
    name: string,
  ) => { success: boolean; pet?: PetState; error?: string };
  selectActivePet: (petId: string) => void;
  claimPresent: (presentId: string) => {
    success: boolean;
    present?: PetGiftPresent;
  };
  sendGiftPet: (
    recipientId: string,
    recipientName: string,
    gift: {
      species: PetSpecies;
      theme: string;
      petName: string;
      message?: string;
    },
  ) => { success: boolean; error?: string };
  buyGameTheme: (themeId: string) => void;
  addGems: (amount: number) => void;
  toggleWidget: () => void;
  setWidgetOpen: (open: boolean) => void;
  toggleHome: () => void;
  setAtHome: (atHome: boolean) => void;
}

const STORAGE_KEY = 'arcadeum_pet_collection_v2';
const LEGACY_STORAGE_KEY = 'arcadeum_pet_state';

interface StoredCollection {
  pets: PetState[];
  activePetId: string | null;
  gemBalance: number;
  adoptionCount: number;
  queuedThemeForNextPet: string | null;
  presents: PetGiftPresent[];
}

function loadStoredCollection(): StoredCollection | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredCollection;
      const refreshedPets = parsed.pets.map(applyDeterministicDecay);
      return {
        ...parsed,
        pets: refreshedPets,
      };
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyPet = applyDeterministicDecay(
        JSON.parse(legacyRaw) as PetState,
      );
      return {
        pets: [legacyPet],
        activePetId: legacyPet.id,
        gemBalance: 300,
        adoptionCount: 1,
        queuedThemeForNextPet: null,
        presents: [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveStoredCollection(state: StoredCollection): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const DEFAULT_WELCOME_PRESENT: PetGiftPresent = {
  id: 'present-welcome-gift',
  senderId: 'arcadeum-team',
  senderName: 'Arcadeum Club',
  species: 'dragon',
  theme: 'galaxy',
  petName: 'Starling Dragon',
  message: 'Welcome to Arcadeum! Here is a special cosmic companion gift.',
  createdAt: Date.now(),
  isOpened: false,
};

export const useArcadePetStore = create<ArcadePetStoreState>((set, get) => ({
  pet: null,
  pets: [],
  activePetId: null,
  gemBalance: 300,
  adoptionCount: 0,
  queuedThemeForNextPet: null,
  presents: [DEFAULT_WELCOME_PRESENT],
  isWidgetOpen: false,
  isAtHome: false,
  activeTreat: null,

  initialize: (userId = 'local-user', theme = 'cyberpunk') => {
    const current = get().pet;
    if (current) {
      const refreshed = applyDeterministicDecay(current);
      set({ pet: refreshed });
      return;
    }

    const stored = loadStoredCollection();
    if (stored && stored.pets.length > 0) {
      const active =
        stored.pets.find((p) => p.id === stored.activePetId) ??
        stored.pets[0] ??
        null;
      set({
        pets: stored.pets,
        activePetId: active?.id ?? null,
        pet: active,
        gemBalance: stored.gemBalance ?? 300,
        adoptionCount: stored.adoptionCount ?? stored.pets.length,
        queuedThemeForNextPet: stored.queuedThemeForNextPet ?? null,
        presents: stored.presents ?? [DEFAULT_WELCOME_PRESENT],
      });
      return;
    }

    const spec = getRandomPetSpec(theme);
    const firstPet = createInitialPet({
      id: userId || 'local-pet-1',
      name: spec.name,
      theme: spec.theme,
    });
    firstPet.species = spec.species;
    firstPet.stage = 'adult';

    const initialCollection: StoredCollection = {
      pets: [firstPet],
      activePetId: firstPet.id,
      gemBalance: 300,
      adoptionCount: 1,
      queuedThemeForNextPet: null,
      presents: [DEFAULT_WELCOME_PRESENT],
    };

    set({
      pets: initialCollection.pets,
      activePetId: firstPet.id,
      pet: firstPet,
      gemBalance: initialCollection.gemBalance,
      adoptionCount: initialCollection.adoptionCount,
      queuedThemeForNextPet: null,
      presents: initialCollection.presents,
    });
    saveStoredCollection(initialCollection);
  },

  adoptRandomPet: () => {
    const { adoptionCount, gemBalance, pets, queuedThemeForNextPet } = get();
    const cost = getPetAdoptionCost(adoptionCount);

    if (gemBalance < cost) {
      return { success: false, error: 'INSUFFICIENT_GEMS' };
    }

    const spec = getRandomPetSpec(queuedThemeForNextPet);
    const newId = `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPet = createInitialPet({
      id: newId,
      name: spec.name,
      theme: spec.theme,
    });
    newPet.species = spec.species;
    newPet.stage = 'adult';

    const nextPets = [...pets, newPet];
    const nextGems = gemBalance - cost;
    const nextCount = adoptionCount + 1;

    set({
      pets: nextPets,
      activePetId: newId,
      pet: newPet,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
    });

    saveStoredCollection({
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
      presents: get().presents,
    });

    return { success: true, pet: newPet };
  },

  adoptSelectedPet: (species, theme, name) => {
    const { gemBalance, pets, adoptionCount } = get();
    if (gemBalance < SELECT_PET_COST) {
      return { success: false, error: 'INSUFFICIENT_GEMS' };
    }

    const newId = `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPet = createInitialPet({
      id: newId,
      name: name.trim() || 'Custom Pet',
      theme,
    });
    newPet.species = species;
    newPet.stage = 'adult';

    const nextPets = [...pets, newPet];
    const nextGems = gemBalance - SELECT_PET_COST;
    const nextCount = adoptionCount + 1;

    set({
      pets: nextPets,
      activePetId: newId,
      pet: newPet,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
    });

    saveStoredCollection({
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
      presents: get().presents,
    });

    return { success: true, pet: newPet };
  },

  selectActivePet: (petId) => {
    const { pets } = get();
    const target = pets.find((p) => p.id === petId);
    if (!target) return;

    set({
      activePetId: petId,
      pet: target,
    });

    saveStoredCollection({
      pets,
      activePetId: petId,
      gemBalance: get().gemBalance,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: get().presents,
    });
  },

  claimPresent: (presentId) => {
    const { presents, pets, gemBalance } = get();
    const target = presents.find((p) => p.id === presentId && !p.isOpened);
    if (!target) return { success: false };

    const newId = `present-pet-${Date.now()}`;
    const giftedPet = createInitialPet({
      id: newId,
      name: target.petName,
      theme: target.theme,
    });
    giftedPet.species = target.species;
    giftedPet.stage = 'adult';

    const nextPresents = presents.map((p) =>
      p.id === presentId ? { ...p, isOpened: true } : p,
    );
    const nextPets = [...pets, giftedPet];
    const nextGems = gemBalance + 50;

    set({
      presents: nextPresents,
      pets: nextPets,
      activePetId: newId,
      pet: giftedPet,
      gemBalance: nextGems,
    });

    saveStoredCollection({
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: nextPresents,
    });

    return { success: true, present: target };
  },

  sendGiftPet: (_recipientId, _recipientName, _gift) => {
    const { gemBalance } = get();
    const giftCost = 50;
    if (gemBalance < giftCost) {
      return { success: false, error: 'INSUFFICIENT_GEMS' };
    }

    const nextGems = gemBalance - giftCost;
    set({ gemBalance: nextGems });

    saveStoredCollection({
      pets: get().pets,
      activePetId: get().activePetId,
      gemBalance: nextGems,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: get().presents,
    });

    return { success: true };
  },

  buyGameTheme: (themeId) => {
    set({ queuedThemeForNextPet: themeId });
    saveStoredCollection({
      pets: get().pets,
      activePetId: get().activePetId,
      gemBalance: get().gemBalance,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: themeId,
      presents: get().presents,
    });
  },

  addGems: (amount) => {
    const nextGems = Math.max(0, get().gemBalance + amount);
    set({ gemBalance: nextGems });
    saveStoredCollection({
      pets: get().pets,
      activePetId: get().activePetId,
      gemBalance: nextGems,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: get().presents,
    });
  },

  performAction: (action, treatId) => {
    const current = get().pet;
    if (!current) return;

    const result = executePetAction(current, action, { treatId });
    if (result.success) {
      const updatedPets = get().pets.map((p) =>
        p.id === current.id ? result.state : p,
      );
      set({ pet: result.state, pets: updatedPets });
      saveStoredCollection({
        pets: updatedPets,
        activePetId: get().activePetId,
        gemBalance: get().gemBalance,
        adoptionCount: get().adoptionCount,
        queuedThemeForNextPet: get().queuedThemeForNextPet,
        presents: get().presents,
      });
    }
  },

  hatch: (name, species, theme) => {
    const current = get().pet;
    if (!current) return;

    const result = executePetAction(current, 'hatch', { species, theme });
    if (result.success) {
      result.state.name = name;
      const updatedPets = get().pets.map((p) =>
        p.id === current.id ? result.state : p,
      );
      set({ pet: result.state, pets: updatedPets });
      saveStoredCollection({
        pets: updatedPets,
        activePetId: get().activePetId,
        gemBalance: get().gemBalance,
        adoptionCount: get().adoptionCount,
        queuedThemeForNextPet: get().queuedThemeForNextPet,
        presents: get().presents,
      });
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
    const updatedPets = get().pets.map((p) =>
      p.id === current.id ? updated : p,
    );
    set({ pet: updated, pets: updatedPets });
    saveStoredCollection({
      pets: updatedPets,
      activePetId: get().activePetId,
      gemBalance: get().gemBalance,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: get().presents,
    });
  },

  toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
  setWidgetOpen: (open) => set({ isWidgetOpen: open }),
  toggleHome: () => set((state) => ({ isAtHome: !state.isAtHome })),
  setAtHome: (atHome) => set({ isAtHome: atHome }),
}));
