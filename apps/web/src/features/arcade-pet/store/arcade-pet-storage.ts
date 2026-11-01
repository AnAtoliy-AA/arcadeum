import { applyDeterministicDecay, type PetState } from '@arcadeum/games-core';
import type { PetGiftPresent } from '../lib/arcade-pet-economy';

export const STORAGE_KEY = 'arcadeum_pet_collection_v2';
export const LEGACY_STORAGE_KEY = 'arcadeum_pet_state';

export interface StoredCollection {
  pets: PetState[];
  activePetId: string | null;
  gemBalance: number;
  coinBalance?: number;
  adoptionCount: number;
  queuedThemeForNextPet: string | null;
  presents: PetGiftPresent[];
  hasConfirmedCare?: boolean;
  isAtHome?: boolean;
}

export const DEFAULT_WELCOME_PRESENT: PetGiftPresent = {
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

export function loadStoredCollection(): StoredCollection | null {
  if (typeof window === 'undefined') return null;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredCollection;
      if (!parsed.hasConfirmedCare) {
        return null;
      }
      const validPets = (parsed.pets || []).filter(
        (p) => p.name !== 'ArcadePet' || parsed.hasConfirmedCare,
      );
      if (validPets.length === 0) {
        return null;
      }
      const refreshedPets = parsed.isAtHome
        ? freezePetsForHome(validPets)
        : validPets.map(applyDeterministicDecay);
      return {
        ...parsed,
        coinBalance: parsed.coinBalance ?? 50,
        hasConfirmedCare: true,
        isAtHome: parsed.isAtHome ?? false,
        pets: refreshedPets,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredCollection(state: StoredCollection): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function freezePetsForHome(pets: PetState[]): PetState[] {
  const now = Date.now();
  return pets.map((p) => ({
    ...p,
    timestamps: {
      ...p.timestamps,
      lastInteractedAt: now,
    },
  }));
}

export function persistStore(state: {
  pets: PetState[];
  activePetId: string | null;
  gemBalance: number;
  coinBalance: number;
  adoptionCount: number;
  queuedThemeForNextPet: string | null;
  presents: PetGiftPresent[];
  hasConfirmedCare: boolean;
  isAtHome: boolean;
}): void {
  saveStoredCollection({
    hasConfirmedCare: state.hasConfirmedCare,
    pets: state.pets,
    activePetId: state.activePetId,
    gemBalance: state.gemBalance,
    coinBalance: state.coinBalance,
    adoptionCount: state.adoptionCount,
    queuedThemeForNextPet: state.queuedThemeForNextPet,
    presents: state.presents,
    isAtHome: state.isAtHome,
  });
}
