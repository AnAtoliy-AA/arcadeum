import { describe, expect, it } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import { parseStoredCollection } from './arcade-pet-storage';

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
