import { create } from 'zustand';
import {
  applyDeterministicDecay,
  createInitialPet,
  executePetAction,
  type PetState,
} from '@arcadeum/games-core';
import {
  getPetAdoptionCost,
  getPetFoodCost,
  getRandomPetSpec,
  SELECT_PET_COST,
} from '../lib/arcade-pet-economy';
import {
  loadStoredCollection,
  persistStore,
  DEFAULT_WELCOME_PRESENT,
} from './arcade-pet-storage';
import { buildServerPatch } from '../lib/arcade-pet-sync';
import { claimDailyBonus } from './arcade-pet-daily-claim';
import { checkMilestones } from './arcade-pet-milestone-claim';
import { renamePet } from './arcade-pet-rename';
import { upgradeHome } from './arcade-pet-upgrade-home';
import { sendGiftPet } from './arcade-pet-send-gift';
import { sendEconomyAction } from './arcade-pet-server-actions';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

export const useArcadePetStore = create<ArcadePetStoreState>((set, get) => ({
  pet: null,
  pets: [],
  activePetId: null,
  gemBalance: 300,
  coinBalance: 50,
  adoptionCount: 0,
  homeCapacity: 1,
  queuedThemeForNextPet: null,
  presents: [DEFAULT_WELCOME_PRESENT],
  isWidgetOpen: false,
  isAtHome: false,
  activeTreat: null,
  hasConfirmedCare: false,
  syncRevision: null,
  serverBacked: false,
  syncPending: false,
  actionError: null,
  awaySummary: null,
  dailyStreak: 0,
  lastDailyClaimDay: null,
  claimedMilestones: [],
  newMilestones: [],
  checkMilestones: () => checkMilestones(get, set),
  dismissMilestones: () => set({ newMilestones: [] }),
  dismissAwaySummary: () => set({ awaySummary: null }),

  initialize: (_userId = 'local-user', _theme = 'cyberpunk') => {
    const current = get().pet;
    if (current && get().hasConfirmedCare) {
      const refreshed = applyDeterministicDecay(current, undefined, {
        isAtHome: get().isAtHome,
      });
      set({ pet: refreshed });
      return;
    }

    const stored = loadStoredCollection();
    const common = {
      gemBalance: stored?.gemBalance ?? 300,
      coinBalance: stored?.coinBalance ?? 50,
      adoptionCount: stored?.adoptionCount ?? 0,
      queuedThemeForNextPet: stored?.queuedThemeForNextPet ?? null,
      presents: stored?.presents ?? [DEFAULT_WELCOME_PRESENT],
      isAtHome: stored?.isAtHome ?? false,
      homeCapacity: stored?.homeCapacity ?? 1,
      syncRevision: stored?.syncRevision ?? null,
      dailyStreak: stored?.dailyStreak ?? 0,
      claimedMilestones: stored?.claimedMilestones ?? [],
      lastDailyClaimDay: stored?.lastDailyClaimDay ?? null,
      actionError: null,
    };

    if (stored && stored.hasConfirmedCare && stored.pets.length > 0) {
      const active =
        stored.pets.find((p) => p.id === stored.activePetId) ??
        stored.pets[0] ??
        null;
      set({
        ...common,
        hasConfirmedCare: true,
        awaySummary: stored.awaySummary,
        pets: stored.pets,
        activePetId: active?.id ?? null,
        pet: active,
        adoptionCount: stored.adoptionCount ?? stored.pets.length,
      });
      return;
    }

    set({
      ...common,
      hasConfirmedCare: false,
      pets: [],
      activePetId: null,
      pet: null,
    });
  },

  adoptRandomPet: () => {
    const {
      adoptionCount,
      gemBalance,
      pets,
      queuedThemeForNextPet,
      homeCapacity,
    } = get();

    if (get().syncPending) return { success: false, error: 'SYNC_PENDING' };

    if (pets.length >= homeCapacity) {
      set({
        actionError: { code: 'HOME_FULL' },
      });
      return { success: false, error: 'HOME_FULL' };
    }

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
    newPet.stage = 'egg';

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
      actionError: null,
    });

    persistStore({
      ...get(),
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
    });

    void sendEconomyAction(get, set, {
      type: 'adopt_random',
      petId: newId,
      species: spec.species,
      theme: spec.theme,
      name: spec.name,
    });

    return { success: true, pet: newPet };
  },

  adoptSelectedPet: (species, theme, name) => {
    const { gemBalance, pets, adoptionCount, homeCapacity } = get();

    if (get().syncPending) return { success: false, error: 'SYNC_PENDING' };

    if (pets.length >= homeCapacity) {
      set({
        actionError: { code: 'HOME_FULL' },
      });
      return { success: false, error: 'HOME_FULL' };
    }

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
      actionError: null,
    });

    persistStore({
      ...get(),
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
      adoptionCount: nextCount,
      queuedThemeForNextPet: null,
    });

    void sendEconomyAction(get, set, {
      type: 'adopt_selected',
      petId: newId,
      species,
      theme,
      name: newPet.name,
    });

    return { success: true, pet: newPet };
  },

  upgradeHome: (currency) => upgradeHome(get, set, currency),

  selectActivePet: (petId) => {
    const { pets } = get();
    const target = pets.find((p) => p.id === petId);
    if (!target) return;

    set({
      activePetId: petId,
      pet: target,
    });

    persistStore({
      ...get(),
      activePetId: petId,
    });
  },

  claimPresent: (presentId) => {
    const { presents, pets, gemBalance, homeCapacity } = get();
    const target = presents.find((p) => p.id === presentId && !p.isOpened);
    if (!target) return { success: false };

    if (pets.length >= homeCapacity) {
      set({
        actionError: { code: 'HOME_FULL' },
      });
      return { success: false, error: 'HOME_FULL' };
    }

    const newId = `present-pet-${Date.now()}`;
    const giftedPet = createInitialPet({
      id: newId,
      name: target.petName,
      theme: target.theme,
    });
    giftedPet.species = target.species;
    giftedPet.stage = 'egg';

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
      actionError: null,
    });

    persistStore({
      ...get(),
      presents: nextPresents,
      pets: nextPets,
      activePetId: newId,
      gemBalance: nextGems,
    });

    void sendEconomyAction(get, set, {
      type: 'claim_present',
      presentId,
      petId: newId,
    });

    return { success: true, present: target };
  },

  sendGiftPet: (_recipientId, recipientName, gift, isAdmin = false) =>
    sendGiftPet(get, set, recipientName, gift, isAdmin),

  buyGameTheme: (themeId) => {
    set({ queuedThemeForNextPet: themeId });
    void sendEconomyAction(get, set, { type: 'queue_theme', themeId });
    persistStore({
      ...get(),
      queuedThemeForNextPet: themeId,
    });
  },

  applyServerCollection: (server) => {
    set(buildServerPatch(get(), server));
    persistStore(get());
  },
  claimDailyBonus: () => claimDailyBonus(get, set),

  renamePet: (petId, name) => renamePet(get, set, petId, name),

  clearActionError: () => set({ actionError: null }),

  performAction: (action, treatId, targetPetId) => {
    const { pets, pet, coinBalance } = get();
    const target = targetPetId
      ? (pets.find((p) => p.id === targetPetId) ?? pet)
      : pet;
    if (!target) return { success: false, error: 'NO_PET' };

    if (action === 'feed_snack') {
      const petIndex = Math.max(
        0,
        pets.findIndex((p) => p.id === target.id),
      );
      const foodCost = getPetFoodCost(petIndex);
      if (coinBalance < foodCost) {
        set({
          actionError: {
            code: 'NEED_COINS_FEED',
            params: { cost: foodCost, name: target.name },
          },
        });
        return { success: false, error: 'INSUFFICIENT_COINS' };
      }
      const nextCoins = coinBalance - foodCost;
      const result = executePetAction(target, action, { treatId });
      if (result.success) {
        const updatedPets = pets.map((p) =>
          p.id === target.id ? result.state : p,
        );
        const nextActive =
          get().activePetId === target.id ? result.state : get().pet;
        set({
          pet: nextActive,
          pets: updatedPets,
          coinBalance: nextCoins,
          actionError: null,
        });
        persistStore({
          ...get(),
          pets: updatedPets,
          coinBalance: nextCoins,
        });
        void sendEconomyAction(get, set, {
          type: 'feed_snack',
          petId: target.id,
        });
        return { success: true };
      }
      return { success: false };
    }

    set({ actionError: null });
    const result = executePetAction(target, action, { treatId });
    if (result.success) {
      const updatedPets = pets.map((p) =>
        p.id === target.id ? result.state : p,
      );
      const nextActive =
        get().activePetId === target.id ? result.state : get().pet;
      set({ pet: nextActive, pets: updatedPets });
      persistStore({
        ...get(),
        pets: updatedPets,
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
      persistStore({
        ...get(),
        pets: updatedPets,
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
    persistStore({
      ...get(),
      pets: updatedPets,
    });
  },

  toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
  setWidgetOpen: (open) => set({ isWidgetOpen: open }),
  toggleHome: () => get().setAtHome(!get().isAtHome),
  setAtHome: (atHome) => {
    const { pets, isAtHome: prevAtHome } = get();
    const now = Date.now();
    const refreshedPets = pets.map((p) =>
      applyDeterministicDecay(p, now, { isAtHome: prevAtHome }),
    );
    const active =
      refreshedPets.find((p) => p.id === get().activePetId) ??
      refreshedPets[0] ??
      null;
    set({
      isAtHome: atHome,
      pets: refreshedPets,
      pet: active,
    });
    persistStore({
      ...get(),
      isAtHome: atHome,
      pets: refreshedPets,
    });
  },
}));
