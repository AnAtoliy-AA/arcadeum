import type {
  ArcadePetCollectionPayload,
  PetGiftPresentPayload,
} from './arcade-pet-collection.types';
import type { PetSpecies } from './arcade-pet.types';
import {
  GAME_THEME_IDS,
  THEME_PET_ROSTER,
  getSignaturePet,
  getThemePets,
} from './arcade-pet-theme-roster';

export const SELECT_PET_COST = 750;

export function getPetAdoptionCost(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 50;
  if (count === 2) return 150;
  if (count === 3) return 300;
  if (count === 4) return 500;
  return 500 + (count - 4) * 250;
}

export const PET_FOOD_COSTS = [1, 5, 20, 50, 100] as const;

export function getPetFoodCost(petIndex: number): number {
  if (petIndex <= 0) return 1;
  if (petIndex === 1) return 5;
  if (petIndex === 2) return 20;
  if (petIndex === 3) return 50;
  if (petIndex === 4) return 100;
  return 100 + (petIndex - 4) * 50;
}

export const DEFAULT_HOME_CAPACITY = 1;

export function getHomeUpgradeCost(currentCapacity: number): {
  coinCost: number;
  gemCost: number;
} {
  if (currentCapacity <= 1) return { coinCost: 50, gemCost: 100 };
  if (currentCapacity === 2) return { coinCost: 150, gemCost: 250 };
  if (currentCapacity === 3) return { coinCost: 300, gemCost: 450 };
  if (currentCapacity === 4) return { coinCost: 500, gemCost: 700 };
  return {
    coinCost: currentCapacity * 150,
    gemCost: currentCapacity * 200,
  };
}

export const GIFT_PET_COST_GEMS = 50;
export const PRESENT_CLAIM_BONUS_GEMS = 50;

export function getRandomPetSpec(queuedTheme?: string | null): {
  species: PetSpecies;
  theme: string;
  name: string;
  tagline?: string;
} {
  const themePool = GAME_THEME_IDS.filter((t) => t !== 'retro');
  const chosenTheme =
    queuedTheme && THEME_PET_ROSTER[queuedTheme]
      ? queuedTheme
      : (themePool[Math.floor(Math.random() * themePool.length)] ??
        'cyberpunk');

  const themePets = getThemePets(chosenTheme);
  const chosenPet =
    themePets[Math.floor(Math.random() * themePets.length)] ??
    getSignaturePet(chosenTheme);

  return {
    species: chosenPet.species,
    theme: chosenTheme,
    name: chosenPet.name,
    tagline: chosenPet.tagline,
  };
}

/** Present every new collection starts with (same id on client and server). */
export const WELCOME_PRESENT_ID = 'present-welcome-gift';

/** Starting balances of a brand-new collection (single source of truth). */
export const INITIAL_GEM_BALANCE = 300;
export const INITIAL_COIN_BALANCE = 50;

/**
 * The welcome present has a fixed `createdAt` so it is identical on every
 * read and render (stable id and timestamp, no SSR/client mismatch).
 */
export function createWelcomePresent(now = 0): PetGiftPresentPayload {
  return {
    id: WELCOME_PRESENT_ID,
    senderId: 'arcadeum-team',
    senderName: 'Arcadeum Club',
    species: 'dragon',
    theme: 'galaxy',
    petName: 'Starling Dragon',
    message: 'Welcome to Arcadeum! Here is a special cosmic companion gift.',
    createdAt: now,
    isOpened: false,
  };
}

/** Collection state for a user who has never stored anything. */
export function createEmptyCollection(): ArcadePetCollectionPayload {
  return {
    pets: [],
    activePetId: null,
    gemBalance: INITIAL_GEM_BALANCE,
    coinBalance: INITIAL_COIN_BALANCE,
    adoptionCount: 0,
    homeCapacity: DEFAULT_HOME_CAPACITY,
    queuedThemeForNextPet: null,
    presents: [createWelcomePresent()],
    hasConfirmedCare: false,
    isAtHome: false,
    dailyStreak: 0,
    lastDailyClaimDay: null,
    claimedMilestones: [],
  };
}
