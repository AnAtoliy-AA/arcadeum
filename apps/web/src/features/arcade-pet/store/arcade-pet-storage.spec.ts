import { describe, expect, it } from 'vitest';
import {
  ARCADE_PET_SCHEMA_VERSION,
  createInitialPet,
} from '@arcadeum/games-core';
import {
  STORAGE_KEY,
  parseStoredCollection,
  saveStoredCollection,
} from './arcade-pet-storage';

const pet = createInitialPet({
  id: 'p1',
  name: 'Bit',
  species: 'dragon',
  theme: 'galaxy',
} as Parameters<typeof createInitialPet>[0]);

describe('parseStoredCollection', () => {
  it('rejects non-objects and unconfirmed care', () => {
    expect(parseStoredCollection(null)).toBeNull();
    expect(parseStoredCollection('x')).toBeNull();
    expect(parseStoredCollection({ pets: [pet] })).toBeNull();
  });

  it('rejects collections without valid pets', () => {
    expect(
      parseStoredCollection({ hasConfirmedCare: true, pets: [{ id: 1 }] }),
    ).toBeNull();
  });

  it('sanitizes tampered balances', () => {
    const parsed = parseStoredCollection({
      hasConfirmedCare: true,
      pets: [pet],
      gemBalance: 1e15,
      coinBalance: -5,
      homeCapacity: 'lots',
    });
    expect(parsed?.gemBalance).toBe(1_000_000);
    expect(parsed?.coinBalance).toBe(0);
    expect(parsed?.homeCapacity).toBe(1);
  });
});

describe('schema versioning', () => {
  it('migrates an unversioned save and normalizes treat stock', () => {
    const legacy = {
      hasConfirmedCare: true,
      pets: [{ ...pet, inventory: { chess_cookie: 500 } }],
      activePetId: 'p1',
    };
    const parsed = parseStoredCollection(legacy);
    expect(parsed?.pets[0].inventory.chess_cookie).toBe(99);
    expect(parsed?.pets[0].inventory.pachisi_spice).toBe(0);
  });

  it('stamps the current schema version when saving', () => {
    saveStoredCollection({
      pets: [pet],
      activePetId: 'p1',
      gemBalance: 1,
      adoptionCount: 1,
      queuedThemeForNextPet: null,
      presents: [],
      hasConfirmedCare: true,
    });
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as {
      schemaVersion?: number;
    };
    expect(saved.schemaVersion).toBe(ARCADE_PET_SCHEMA_VERSION);
  });
});
