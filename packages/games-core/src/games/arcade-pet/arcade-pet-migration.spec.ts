import { describe, expect, it } from 'vitest';
import { ARCADE_PET_SCHEMA_VERSION } from './arcade-pet-collection.types';
import {
  MAX_RECENT_ACTION_IDS,
  migrateCollection,
  needsMigration,
} from './arcade-pet-migration';
import { createInitialPet } from './arcade-pet.utils';

describe('migrateCollection', () => {
  it('upgrades an unversioned legacy document with defaults', () => {
    const legacy = { gemBalance: 12, pets: [] };
    expect(needsMigration(legacy)).toBe(true);
    const migrated = migrateCollection(legacy);
    expect(migrated.schemaVersion).toBe(ARCADE_PET_SCHEMA_VERSION);
    expect(migrated.gemBalance).toBe(12);
    expect(migrated.dailyStreak).toBe(0);
    expect(migrated.claimedMilestones).toEqual([]);
    expect(migrated.recentActionIds).toEqual([]);
  });

  it('normalizes treat stock and bounds the action id list from v1', () => {
    const pet = createInitialPet({ id: 'p1', name: 'Goo' });
    const broken = {
      ...pet,
      inventory: { chess_cookie: 500, hearts_candy: Number.NaN },
    } as unknown as typeof pet;
    const ids = Array.from({ length: 250 }, (_, i) => `a${i}`);
    const migrated = migrateCollection({
      schemaVersion: 1,
      pets: [broken],
      recentActionIds: ids,
    });
    expect(migrated.pets[0].inventory.chess_cookie).toBe(99);
    expect(migrated.pets[0].inventory.hearts_candy).toBe(0);
    expect(migrated.pets[0].inventory.pachisi_spice).toBe(0);
    expect(migrated.recentActionIds).toHaveLength(MAX_RECENT_ACTION_IDS);
    expect(migrated.recentActionIds.at(-1)).toBe('a249');
  });

  it('leaves current documents alone and keeps newer versions', () => {
    const current = { schemaVersion: ARCADE_PET_SCHEMA_VERSION, gemBalance: 5 };
    expect(needsMigration(current)).toBe(false);
    expect(migrateCollection(current).gemBalance).toBe(5);
    expect(
      migrateCollection({ schemaVersion: ARCADE_PET_SCHEMA_VERSION + 3 })
        .schemaVersion,
    ).toBe(ARCADE_PET_SCHEMA_VERSION + 3);
  });
});
