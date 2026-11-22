import {
  ARCADE_PET_SCHEMA_VERSION,
  type ArcadePetCollectionPayload,
} from './arcade-pet-collection.types';
import { createEmptyCollection } from './arcade-pet-economy';
import { MAX_TREAT_STOCK } from './arcade-pet-sync-merge';
import { clamp } from './arcade-pet.core';
import { GAME_TREAT_IDS, type PetState } from './arcade-pet.types';

/** Longest list of recent economy action ids kept for idempotent replays. */
export const MAX_RECENT_ACTION_IDS = 50;

/** A stored or persisted collection of any past schema version. */
export type StoredCollectionShape = Partial<ArcadePetCollectionPayload> & {
  schemaVersion?: number;
  recentActionIds?: string[];
};

export type MigratedCollection = ArcadePetCollectionPayload & {
  schemaVersion: number;
  recentActionIds: string[];
};

function normalizeInventory(pet: PetState): PetState {
  const source: Partial<Record<string, number>> = pet.inventory ?? {};
  const inventory = { ...pet.inventory };
  for (const id of GAME_TREAT_IDS) {
    const value = source[id];
    inventory[id] =
      typeof value === 'number' && Number.isFinite(value)
        ? clamp(Math.floor(value), 0, MAX_TREAT_STOCK)
        : 0;
  }
  return { ...pet, inventory };
}

/**
 * One step per version: `MIGRATIONS[n]` upgrades a shape at version n to n + 1.
 * - v0 (unversioned) -> v1: fills fields added after the first release.
 * - v1 -> v2: bounded action-id list for idempotency, normalized treat stock.
 */
const MIGRATIONS: ReadonlyArray<
  (c: StoredCollectionShape) => StoredCollectionShape
> = [
  (c) => {
    const defaults = createEmptyCollection();
    return {
      ...defaults,
      ...c,
      presents: c.presents ?? defaults.presents,
      dailyStreak: c.dailyStreak ?? 0,
      lastDailyClaimDay: c.lastDailyClaimDay ?? null,
      claimedMilestones: c.claimedMilestones ?? [],
    };
  },
  (c) => ({
    ...c,
    pets: (c.pets ?? []).map(normalizeInventory),
    recentActionIds: (c.recentActionIds ?? []).slice(-MAX_RECENT_ACTION_IDS),
  }),
];

/** True when the shape was written by an older schema version. */
export function needsMigration(stored: StoredCollectionShape): boolean {
  return (stored.schemaVersion ?? 0) < ARCADE_PET_SCHEMA_VERSION;
}

/**
 * Brings a stored collection up to the current schema version. Data written
 * by a newer version (rolled-back deploy) is passed through untouched.
 */
export function migrateCollection(
  stored: StoredCollectionShape,
): MigratedCollection {
  let current = stored;
  for (
    let version = Math.max(0, stored.schemaVersion ?? 0);
    version < ARCADE_PET_SCHEMA_VERSION;
    version++
  ) {
    current = MIGRATIONS[version](current);
  }
  const defaults = createEmptyCollection();
  return {
    ...defaults,
    ...current,
    schemaVersion: Math.max(
      ARCADE_PET_SCHEMA_VERSION,
      stored.schemaVersion ?? 0,
    ),
    recentActionIds: current.recentActionIds ?? [],
  };
}
