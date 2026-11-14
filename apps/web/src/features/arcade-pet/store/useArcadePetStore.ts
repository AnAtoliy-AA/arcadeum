import { create } from 'zustand';
import {
  applyDeterministicDecay,
  createInitialPet,
  executePetAction,
  type PetState,
} from '@arcadeum/games-core';
import {
  getHomeUpgradeCost,
  getPetAdoptionCost,
  getPetFoodCost,
  getRandomPetSpec,
  SELECT_PET_COST,
  type PetGiftPresent,
} from '../lib/arcade-pet-economy';
import {
  loadStoredCollection,
  persistStore,
  DEFAULT_WELCOME_PRESENT,
} from './arcade-pet-storage';
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
  actionError: null,

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

    if (pets.length >= homeCapacity) {
      set({
        actionError:
          'Home is full! Upgrade your Home to have place for more pets.',
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

    return { success: true, pet: newPet };
  },

  adoptSelectedPet: (species, theme, name) => {
    const { gemBalance, pets, adoptionCount, homeCapacity } = get();

    if (pets.length >= homeCapacity) {
      set({
        actionError:
          'Home is full! Upgrade your Home to have place for more pets.',
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

    return { success: true, pet: newPet };
  },

  upgradeHome: (currency) => {
    const { homeCapacity, coinBalance, gemBalance } = get();
    const cost = getHomeUpgradeCost(homeCapacity);
    if (currency === 'coins') {
      if (coinBalance < cost.coinCost) {
        set({
          actionError: `Need 🪙 ${cost.coinCost} Coins to upgrade Home place!`,
        });
        return { success: false, error: 'INSUFFICIENT_COINS' };
      }
      const nextCoins = coinBalance - cost.coinCost;
      const nextCap = homeCapacity + 1;
      set({
        coinBalance: nextCoins,
        homeCapacity: nextCap,
        actionError: null,
      });
      persistStore({ ...get(), coinBalance: nextCoins, homeCapacity: nextCap });
      return { success: true };
    }
    if (gemBalance < cost.gemCost) {
      set({
        actionError: `Need 💎 ${cost.gemCost} Gems to upgrade Home place!`,
      });
      return { success: false, error: 'INSUFFICIENT_GEMS' };
    }
    const nextGems = gemBalance - cost.gemCost;
    const nextCap = homeCapacity + 1;
    set({ gemBalance: nextGems, homeCapacity: nextCap, actionError: null });
    persistStore({ ...get(), gemBalance: nextGems, homeCapacity: nextCap });
    return { success: true };
  },

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
        actionError:
          'Home is full! Upgrade your Home to have place for more pets.',
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

    persistStore({
      ...get(),
      gemBalance: nextGems,
      presents: nextPresents,
    });

    return { success: true };
  },

  buyGameTheme: (themeId) => {
    set({ queuedThemeForNextPet: themeId });
    persistStore({
      ...get(),
      queuedThemeForNextPet: themeId,
    });
  },

  addGems: (amount) => {
    const nextGems = Math.max(0, get().gemBalance + amount);
    set({ gemBalance: nextGems });
    persistStore({
      ...get(),
      gemBalance: nextGems,
    });
  },

  addCoins: (amount) => {
    const nextCoins = Math.max(0, get().coinBalance + amount);
    set({ coinBalance: nextCoins });
    persistStore({
      ...get(),
      coinBalance: nextCoins,
    });
  },

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
          actionError: `Need 🪙 ${foodCost} Coin${foodCost > 1 ? 's' : ''} to feed ${target.name}!`,
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
