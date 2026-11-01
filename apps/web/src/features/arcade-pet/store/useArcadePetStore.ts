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
  coinBalance: number;
  adoptionCount: number;
  queuedThemeForNextPet: string | null;
  presents: PetGiftPresent[];
  isWidgetOpen: boolean;
  isAtHome: boolean;
  activeTreat: GameTreatId | null;
  hasConfirmedCare: boolean;
  actionError: string | null;
  initialize: (userId?: string, theme?: string) => void;
  performAction: (
    action: PetActionType,
    treatId?: GameTreatId,
  ) => { success: boolean; error?: string };
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
    isAdmin?: boolean,
  ) => { success: boolean; error?: string };
  buyGameTheme: (themeId: string) => void;
  addGems: (amount: number) => void;
  addCoins: (amount: number) => void;
  clearActionError: () => void;
  toggleWidget: () => void;
  setWidgetOpen: (open: boolean) => void;
  toggleHome: () => void;
  setAtHome: (atHome: boolean) => void;
}
import {
  loadStoredCollection,
  saveStoredCollection,
  DEFAULT_WELCOME_PRESENT,
} from './arcade-pet-storage';

export const useArcadePetStore = create<ArcadePetStoreState>((set, get) => ({
  pet: null,
  pets: [],
  activePetId: null,
  gemBalance: 300,
  coinBalance: 50,
  adoptionCount: 0,
  queuedThemeForNextPet: null,
  presents: [DEFAULT_WELCOME_PRESENT],
  isWidgetOpen: false,
  isAtHome: false,
  activeTreat: null,
  hasConfirmedCare: false,
  actionError: null,

  initialize: (_userId = 'local-user', _theme = 'cyberpunk') => {
    const current = get().pet;
    if (current && get().hasConfirmedCare) {
      const refreshed = applyDeterministicDecay(current);
      set({ pet: refreshed });
      return;
    }

    const stored = loadStoredCollection();
    if (stored && stored.hasConfirmedCare && stored.pets.length > 0) {
      const active =
        stored.pets.find((p) => p.id === stored.activePetId) ??
        stored.pets[0] ??
        null;
      set({
        hasConfirmedCare: true,
        pets: stored.pets,
        activePetId: active?.id ?? null,
        pet: active,
        gemBalance: stored.gemBalance ?? 300,
        coinBalance: stored.coinBalance ?? 50,
        adoptionCount: stored.adoptionCount ?? stored.pets.length,
        queuedThemeForNextPet: stored.queuedThemeForNextPet ?? null,
        presents: stored.presents ?? [DEFAULT_WELCOME_PRESENT],
        actionError: null,
      });
      return;
    }

    set({
      hasConfirmedCare: false,
      pets: [],
      activePetId: null,
      pet: null,
      gemBalance: stored?.gemBalance ?? 300,
      coinBalance: stored?.coinBalance ?? 50,
      adoptionCount: stored?.adoptionCount ?? 0,
      queuedThemeForNextPet: stored?.queuedThemeForNextPet ?? null,
      presents: stored?.presents ?? [DEFAULT_WELCOME_PRESENT],
      actionError: null,
    });
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
      hasConfirmedCare: true,
      pets: nextPets,
      activePetId: newId,
      pet: newPet,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
    });

    saveStoredCollection({
      hasConfirmedCare: true,
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      coinBalance: get().coinBalance,
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
      hasConfirmedCare: true,
      pets: nextPets,
      activePetId: newId,
      pet: newPet,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
    });

    saveStoredCollection({
      hasConfirmedCare: true,
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      coinBalance: get().coinBalance,
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
      hasConfirmedCare: true,
      pets,
      activePetId: petId,
      gemBalance: get().gemBalance,
      coinBalance: get().coinBalance,
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
      hasConfirmedCare: true,
      presents: nextPresents,
      pets: nextPets,
      activePetId: newId,
      pet: giftedPet,
      gemBalance: nextGems,
    });

    saveStoredCollection({
      hasConfirmedCare: true,
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      coinBalance: get().coinBalance,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: nextPresents,
    });

    return { success: true, present: target };
  },

  sendGiftPet: (recipientId, _recipientName, gift, isAdmin = false) => {
    const { gemBalance, presents } = get();
    const giftCost = isAdmin ? 0 : 50;
    if (gemBalance < giftCost) {
      return { success: false, error: 'INSUFFICIENT_GEMS' };
    }

    const nextGems = gemBalance - giftCost;
    const newPresent: PetGiftPresent = {
      id: `gift-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: isAdmin ? 'admin' : 'friend',
      senderName: isAdmin ? '👑 Arcadeum Admin' : 'Friend',
      species: gift.species,
      theme: gift.theme,
      petName: gift.petName,
      message:
        gift.message ||
        (isAdmin ? 'Official Administrator Gift' : 'A special gift!'),
      createdAt: Date.now(),
      isOpened: false,
    };
    const nextPresents = [newPresent, ...presents];

    set({ gemBalance: nextGems, presents: nextPresents });

    saveStoredCollection({
      hasConfirmedCare: true,
      pets: get().pets,
      activePetId: get().activePetId,
      gemBalance: nextGems,
      coinBalance: get().coinBalance,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: nextPresents,
    });

    return { success: true };
  },

  buyGameTheme: (themeId) => {
    set({ queuedThemeForNextPet: themeId });
    saveStoredCollection({
      hasConfirmedCare: true,
      pets: get().pets,
      activePetId: get().activePetId,
      gemBalance: get().gemBalance,
      coinBalance: get().coinBalance,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: themeId,
      presents: get().presents,
    });
  },

  addGems: (amount) => {
    const nextGems = Math.max(0, get().gemBalance + amount);
    set({ gemBalance: nextGems });
    saveStoredCollection({
      hasConfirmedCare: true,
      pets: get().pets,
      activePetId: get().activePetId,
      gemBalance: nextGems,
      coinBalance: get().coinBalance,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: get().presents,
    });
  },

  addCoins: (amount) => {
    const nextCoins = Math.max(0, get().coinBalance + amount);
    set({ coinBalance: nextCoins });
    saveStoredCollection({
      hasConfirmedCare: true,
      pets: get().pets,
      activePetId: get().activePetId,
      gemBalance: get().gemBalance,
      coinBalance: nextCoins,
      adoptionCount: get().adoptionCount,
      queuedThemeForNextPet: get().queuedThemeForNextPet,
      presents: get().presents,
    });
  },

  clearActionError: () => set({ actionError: null }),

  performAction: (action, treatId) => {
    const current = get().pet;
    if (!current) return { success: false, error: 'NO_PET' };

    if (action === 'feed_snack') {
      const { coinBalance } = get();
      if (coinBalance < 1) {
        set({ actionError: 'Need 🪙 1 Coin to feed a snack!' });
        return { success: false, error: 'INSUFFICIENT_COINS' };
      }
      const nextCoins = coinBalance - 1;
      const result = executePetAction(current, action, { treatId });
      if (result.success) {
        const updatedPets = get().pets.map((p) =>
          p.id === current.id ? result.state : p,
        );
        set({
          pet: result.state,
          pets: updatedPets,
          coinBalance: nextCoins,
          actionError: null,
        });
        saveStoredCollection({
          hasConfirmedCare: true,
          pets: updatedPets,
          activePetId: get().activePetId,
          gemBalance: get().gemBalance,
          coinBalance: nextCoins,
          adoptionCount: get().adoptionCount,
          queuedThemeForNextPet: get().queuedThemeForNextPet,
          presents: get().presents,
        });
        return { success: true };
      }
      return { success: false };
    }

    set({ actionError: null });
    const result = executePetAction(current, action, { treatId });
    if (result.success) {
      const updatedPets = get().pets.map((p) =>
        p.id === current.id ? result.state : p,
      );
      set({ pet: result.state, pets: updatedPets });
      saveStoredCollection({
        hasConfirmedCare: true,
        pets: updatedPets,
        activePetId: get().activePetId,
        gemBalance: get().gemBalance,
        coinBalance: get().coinBalance,
        adoptionCount: get().adoptionCount,
        queuedThemeForNextPet: get().queuedThemeForNextPet,
        presents: get().presents,
      });
      return { success: true };
    }
    return { success: false };
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
        hasConfirmedCare: true,
        pets: updatedPets,
        activePetId: get().activePetId,
        gemBalance: get().gemBalance,
        coinBalance: get().coinBalance,
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
      hasConfirmedCare: true,
      pets: updatedPets,
      activePetId: get().activePetId,
      gemBalance: get().gemBalance,
      coinBalance: get().coinBalance,
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
