import { applyDeterministicDecay, type PetState } from '@arcadeum/games-core';
import type { PetGiftPresent } from '../lib/arcade-pet-economy';
import {
  buildAwaySummary,
  type AwaySummary,
} from '../lib/arcade-pet-away-summary';

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
  homeCapacity?: number;
  dailyStreak?: number;
  lastDailyClaimDay?: string | null;
  claimedMilestones?: string[];
}

export interface LoadedCollection extends StoredCollection {
  awaySummary: AwaySummary | null;
}

export const DEFAULT_WELCOME_PRESENT: PetGiftPresent = {
  id: 'present-welcome-gift',
  senderId: 'arcadeum-team',
  senderName: 'Arcadeum Club',
  species: 'dragon',
  theme: 'galaxy',
  petName: 'Starling Dragon',
  message: 'Welcome to Arcadeum! Here is a special cosmic companion gift.',
  // Fixed value so SSR and client render the same present.
  createdAt: 0,
  isOpened: false,
};

export const STORAGE_SCHEMA_VERSION = 2;
const MAX_STORED_BALANCE = 1_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidPet(value: unknown): value is PetState {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.stage === 'string' &&
    isRecord(value.stats) &&
    isRecord(value.timestamps) &&
    typeof value.timestamps.lastInteractedAt === 'number' &&
    typeof value.timestamps.bornAt === 'number'
  );
}

function sanitizeBalance(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(MAX_STORED_BALANCE, Math.max(0, Math.floor(value)));
}

function sanitizePresents(value: unknown): PetGiftPresent[] {
  if (!Array.isArray(value)) return [DEFAULT_WELCOME_PRESENT];
  return value.filter(
    (p): p is PetGiftPresent =>
      isRecord(p) &&
      typeof p.id === 'string' &&
      typeof p.isOpened === 'boolean',
  );
}

/** Validates untrusted persisted data; returns null when it is unusable. */
export function parseStoredCollection(raw: unknown): StoredCollection | null {
  if (!isRecord(raw) || !raw.hasConfirmedCare) return null;
  const pets = Array.isArray(raw.pets) ? raw.pets.filter(isValidPet) : [];
  if (pets.length === 0) return null;
  const activePetId =
    typeof raw.activePetId === 'string' ? raw.activePetId : null;
  return {
    pets,
    activePetId,
    gemBalance: sanitizeBalance(raw.gemBalance, 300),
    coinBalance: sanitizeBalance(raw.coinBalance, 50),
    adoptionCount: sanitizeBalance(raw.adoptionCount, pets.length),
    queuedThemeForNextPet:
      typeof raw.queuedThemeForNextPet === 'string'
        ? raw.queuedThemeForNextPet
        : null,
    presents: sanitizePresents(raw.presents),
    hasConfirmedCare: true,
    dailyStreak: Math.min(7, sanitizeBalance(raw.dailyStreak, 0)),
    lastDailyClaimDay:
      typeof raw.lastDailyClaimDay === 'string' ? raw.lastDailyClaimDay : null,
    claimedMilestones: Array.isArray(raw.claimedMilestones)
      ? raw.claimedMilestones.filter((m): m is string => typeof m === 'string')
      : [],
    isAtHome: raw.isAtHome === true,
    homeCapacity: Math.max(1, sanitizeBalance(raw.homeCapacity, pets.length)),
  };
}

export function loadStoredCollection(): LoadedCollection | null {
  if (typeof window === 'undefined') return null;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseStoredCollection(JSON.parse(raw) as unknown);
    if (!parsed) return null;
    const isHome = parsed.isAtHome ?? false;
    const now = Date.now();
    const pets = parsed.pets.map((p) =>
      applyDeterministicDecay(p, now, { isAtHome: isHome }),
    );
    const activeIndex = Math.max(
      0,
      parsed.pets.findIndex((p) => p.id === parsed.activePetId),
    );
    return {
      ...parsed,
      pets,
      awaySummary: buildAwaySummary(
        parsed.pets[activeIndex],
        pets[activeIndex],
        now,
      ),
    };
  } catch {
    return null;
  }
}

export function saveStoredCollection(state: StoredCollection): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, version: STORAGE_SCHEMA_VERSION }),
    );
  } catch {}
}

export function freezePetsForHome(pets: PetState[]): PetState[] {
  const now = Date.now();
  return pets.map((p) => applyDeterministicDecay(p, now, { isAtHome: true }));
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
  homeCapacity: number;
  dailyStreak?: number;
  lastDailyClaimDay?: string | null;
  claimedMilestones?: string[];
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
    homeCapacity: state.homeCapacity,
    dailyStreak: state.dailyStreak,
    lastDailyClaimDay: state.lastDailyClaimDay,
    claimedMilestones: state.claimedMilestones,
  });
}
