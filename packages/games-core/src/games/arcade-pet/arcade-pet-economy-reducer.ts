import type {
  ArcadePetCollectionPayload,
  ArcadePetEconomyAction,
  ArcadePetEconomyError,
  PetGiftPresentPayload,
} from './arcade-pet-collection.types';
import {
  getDailyBonusCoins,
  canClaimDailyBonus,
  nextDailyStreak,
  toDayKey,
} from './arcade-pet-daily-bonus';
import {
  GIFT_PET_COST_GEMS,
  PRESENT_CLAIM_BONUS_GEMS,
  SELECT_PET_COST,
  getHomeUpgradeCost,
  getPetAdoptionCost,
  getPetFoodCost,
} from './arcade-pet-economy';
import { getNewMilestones } from './arcade-pet-milestones';
import { sanitizePetName } from './arcade-pet-name';
import { THEME_PET_ROSTER, getThemePets } from './arcade-pet-theme-roster';
import type { PetSpecies } from './arcade-pet.types';
import { createInitialPet } from './arcade-pet.utils';

export const MAX_HOME_CAPACITY = 20;
export const PET_SPECIES_LIST: readonly PetSpecies[] = [
  'slime',
  'dragon',
  'cyber_cat',
  'dino',
  'blob',
];

const PET_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const THEME_ID_PATTERN = /^[a-z0-9_-]{1,40}$/;
const MAX_GIFT_MESSAGE = 300;

export interface EconomyContext {
  now: number;
  userId: string;
  senderName: string;
  isAdmin: boolean;
}

export type EconomyReduceResult =
  | {
      ok: true;
      state: ArcadePetCollectionPayload;
      /** Present to deliver to another user (send_gift only). */
      outgoingGift?: PetGiftPresentPayload;
    }
  | { ok: false; error: ArcadePetEconomyError };

const fail = (error: ArcadePetEconomyError): EconomyReduceResult => ({
  ok: false,
  error,
});

const isSpecies = (v: string): v is PetSpecies =>
  (PET_SPECIES_LIST as readonly string[]).includes(v);

/**
 * Pure economy transition. The server is the authority; clients may run the
 * same function for optimistic updates, so both sides stay in agreement.
 */
export function reduceEconomy(
  state: ArcadePetCollectionPayload,
  action: ArcadePetEconomyAction,
  ctx: EconomyContext,
): EconomyReduceResult {
  switch (action.type) {
    case 'adopt_random':
    case 'adopt_selected':
      return adopt(state, action);
    case 'upgrade_home':
      return upgradeHome(state, action.currency);
    case 'feed_snack': {
      const index = state.pets.findIndex((p) => p.id === action.petId);
      if (index < 0) return fail('PET_NOT_FOUND');
      const cost = getPetFoodCost(index);
      if (state.coinBalance < cost) return fail('INSUFFICIENT_COINS');
      return {
        ok: true,
        state: { ...state, coinBalance: state.coinBalance - cost },
      };
    }
    case 'claim_present':
      return claimPresent(state, action.presentId, action.petId);
    case 'send_gift':
      return sendGift(state, action, ctx);
    case 'claim_daily': {
      const daily = {
        lastClaimDay: state.lastDailyClaimDay,
        streak: state.dailyStreak,
      };
      if (!canClaimDailyBonus(daily, ctx.now)) return fail('ALREADY_CLAIMED');
      const streak = nextDailyStreak(daily, ctx.now);
      return {
        ok: true,
        state: {
          ...state,
          coinBalance: state.coinBalance + getDailyBonusCoins(streak),
          dailyStreak: streak,
          lastDailyClaimDay: toDayKey(ctx.now),
        },
      };
    }
    case 'claim_milestones': {
      const reached = getNewMilestones(
        { pets: state.pets, dailyStreak: state.dailyStreak },
        state.claimedMilestones,
      );
      if (reached.length === 0) return fail('NOTHING_TO_CLAIM');
      return {
        ok: true,
        state: {
          ...state,
          coinBalance:
            state.coinBalance + reached.reduce((s, m) => s + m.rewardCoins, 0),
          claimedMilestones: [
            ...state.claimedMilestones,
            ...reached.map((m) => m.id),
          ],
        },
      };
    }
    case 'queue_theme':
      if (!THEME_PET_ROSTER[action.themeId]) return fail('INVALID_SPEC');
      return {
        ok: true,
        state: { ...state, queuedThemeForNextPet: action.themeId },
      };
  }
}

function adopt(
  state: ArcadePetCollectionPayload,
  action: Extract<
    ArcadePetEconomyAction,
    { type: 'adopt_random' | 'adopt_selected' }
  >,
): EconomyReduceResult {
  if (!PET_ID_PATTERN.test(action.petId)) return fail('INVALID_SPEC');
  if (state.pets.some((p) => p.id === action.petId)) {
    return fail('DUPLICATE_PET');
  }
  if (state.pets.length >= state.homeCapacity) return fail('HOME_FULL');
  if (!THEME_PET_ROSTER[action.theme] || !isSpecies(action.species)) {
    return fail('INVALID_SPEC');
  }

  const isRandom = action.type === 'adopt_random';
  let name: string;
  let cost: number;
  if (isRandom) {
    // A random adoption must be a real roster pet, and honor a queued theme.
    const queued = state.queuedThemeForNextPet;
    const rosterPet = getThemePets(action.theme).find(
      (p) => p.species === action.species && p.name === action.name,
    );
    if (!rosterPet || (queued && queued !== action.theme)) {
      return fail('INVALID_SPEC');
    }
    name = rosterPet.name;
    cost = getPetAdoptionCost(state.adoptionCount);
  } else {
    name = sanitizePetName(action.name) ?? 'Custom Pet';
    cost = SELECT_PET_COST;
  }
  if (state.gemBalance < cost) return fail('INSUFFICIENT_GEMS');

  const pet = createInitialPet({
    id: action.petId,
    name,
    theme: action.theme,
  });
  pet.species = action.species;
  pet.stage = isRandom ? 'egg' : 'adult';

  return {
    ok: true,
    state: {
      ...state,
      pets: [...state.pets, pet],
      activePetId: pet.id,
      gemBalance: state.gemBalance - cost,
      adoptionCount: state.adoptionCount + 1,
      queuedThemeForNextPet: null,
      hasConfirmedCare: true,
    },
  };
}

function upgradeHome(
  state: ArcadePetCollectionPayload,
  currency: 'coins' | 'gems',
): EconomyReduceResult {
  if (state.homeCapacity >= MAX_HOME_CAPACITY) return fail('HOME_MAX');
  const cost = getHomeUpgradeCost(state.homeCapacity);
  if (currency === 'coins') {
    if (state.coinBalance < cost.coinCost) return fail('INSUFFICIENT_COINS');
    return {
      ok: true,
      state: {
        ...state,
        coinBalance: state.coinBalance - cost.coinCost,
        homeCapacity: state.homeCapacity + 1,
      },
    };
  }
  if (state.gemBalance < cost.gemCost) return fail('INSUFFICIENT_GEMS');
  return {
    ok: true,
    state: {
      ...state,
      gemBalance: state.gemBalance - cost.gemCost,
      homeCapacity: state.homeCapacity + 1,
    },
  };
}

function claimPresent(
  state: ArcadePetCollectionPayload,
  presentId: string,
  petId: string,
): EconomyReduceResult {
  const present = state.presents.find((p) => p.id === presentId && !p.isOpened);
  if (!present) return fail('PRESENT_NOT_FOUND');
  if (!PET_ID_PATTERN.test(petId)) return fail('INVALID_SPEC');
  if (state.pets.some((p) => p.id === petId)) return fail('DUPLICATE_PET');
  if (state.pets.length >= state.homeCapacity) return fail('HOME_FULL');

  const pet = createInitialPet({
    id: petId,
    name: present.petName,
    theme: present.theme,
  });
  pet.species = present.species;
  pet.stage = 'egg';

  return {
    ok: true,
    state: {
      ...state,
      pets: [...state.pets, pet],
      activePetId: pet.id,
      presents: state.presents.map((p) =>
        p.id === presentId ? { ...p, isOpened: true } : p,
      ),
      gemBalance: state.gemBalance + PRESENT_CLAIM_BONUS_GEMS,
      hasConfirmedCare: true,
    },
  };
}

function sendGift(
  state: ArcadePetCollectionPayload,
  action: Extract<ArcadePetEconomyAction, { type: 'send_gift' }>,
  ctx: EconomyContext,
): EconomyReduceResult {
  if (!isSpecies(action.species) || !THEME_ID_PATTERN.test(action.theme)) {
    return fail('INVALID_SPEC');
  }
  const cost = ctx.isAdmin ? 0 : GIFT_PET_COST_GEMS;
  if (state.gemBalance < cost) return fail('INSUFFICIENT_GEMS');

  const petName =
    sanitizePetName(action.petName) ??
    action.species.charAt(0).toUpperCase() + action.species.slice(1);
  const outgoingGift: PetGiftPresentPayload = {
    id: `gift-${ctx.now}-${Math.random().toString(36).slice(2, 9)}`,
    senderId: ctx.userId,
    senderName: ctx.isAdmin ? 'Arcadeum Admin' : ctx.senderName,
    species: action.species,
    theme: action.theme,
    petName,
    message: (action.message ?? '').slice(0, MAX_GIFT_MESSAGE) || undefined,
    createdAt: ctx.now,
    isOpened: false,
  };
  return {
    ok: true,
    state: { ...state, gemBalance: state.gemBalance - cost },
    outgoingGift,
  };
}
