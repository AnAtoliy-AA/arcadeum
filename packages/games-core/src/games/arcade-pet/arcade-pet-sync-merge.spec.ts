import { describe, expect, it } from 'vitest';
import {
  MAX_TREAT_STOCK,
  MAX_XP_BURST_PER_SYNC,
  mergeClientPet,
} from './arcade-pet-sync-merge';
import type { PetState } from './arcade-pet.types';
import { createInitialPet } from './arcade-pet.utils';

const NOW = Date.UTC(2026, 10, 15, 12);
const HOUR = 3_600_000;

const serverPet = (): PetState => ({
  ...createInitialPet({
    id: 'p1',
    name: 'Goo',
    theme: 'retro',
    now: NOW - HOUR,
  }),
  stage: 'baby',
  stats: { ...createInitialPet({ id: 'x', name: 'x' }).stats, growthHours: 1 },
});

const withClient = (over: Partial<PetState>): PetState => ({
  ...serverPet(),
  ...over,
});

describe('mergeClientPet', () => {
  it('keeps identity fields from the server', () => {
    const merged = mergeClientPet(
      serverPet(),
      withClient({ species: 'dragon', theme: 'galaxy', id: 'forged' }),
      NOW,
    );
    expect(merged).toMatchObject({
      id: 'p1',
      species: 'slime',
      theme: 'retro',
    });
    expect(merged.timestamps.bornAt).toBe(serverPet().timestamps.bornAt);
  });

  it('cannot forge growth, level, xp or stage', () => {
    const forged = withClient({
      stage: 'senior',
      stats: { ...serverPet().stats, level: 10, xp: 99999, growthHours: 500 },
    });
    const merged = mergeClientPet(serverPet(), forged, NOW);
    expect(merged.stage).not.toBe('senior');
    expect(merged.stats.growthHours).toBeLessThan(3);
    expect(merged.stats.xp).toBeLessThanOrEqual(
      serverPet().stats.xp + 20 + MAX_XP_BURST_PER_SYNC,
    );
    expect(merged.stats.level).toBeLessThanOrEqual(4);
  });

  it('never lowers growth below the server value', () => {
    const merged = mergeClientPet(
      serverPet(),
      withClient({ stats: { ...serverPet().stats, growthHours: 0 } }),
      NOW,
    );
    expect(merged.stats.growthHours).toBe(1);
  });

  it('lets an egg hatch into a baby', () => {
    const egg = { ...serverPet(), stage: 'egg' as const };
    const merged = mergeClientPet(egg, { ...egg, stage: 'baby' }, NOW);
    expect(merged.stage).toBe('baby');
  });

  it('clamps timestamps to now and needs to 0-100', () => {
    const merged = mergeClientPet(
      serverPet(),
      withClient({
        timestamps: { ...serverPet().timestamps, lastFedAt: NOW + 99 * HOUR },
        stats: { ...serverPet().stats, hunger: 5000, hygiene: -20 },
      }),
      NOW,
    );
    expect(merged.timestamps.lastFedAt).toBe(NOW);
    expect(merged.stats.hunger).toBe(100);
    expect(merged.stats.hygiene).toBe(0);
  });

  it('never lets a client raise treat stock or invent keys', () => {
    const merged = mergeClientPet(
      serverPet(),
      withClient({
        inventory: {
          chess_cookie: 1e9,
          hearts_candy: -4,
          bogus: 5,
        } as unknown as PetState['inventory'],
      }),
      NOW,
    );
    const server = serverPet().inventory;
    expect(merged.inventory.chess_cookie).toBe(server.chess_cookie);
    expect(merged.inventory.chess_cookie).toBeLessThanOrEqual(MAX_TREAT_STOCK);
    expect(merged.inventory.hearts_candy).toBe(0);
    expect(merged.inventory).not.toHaveProperty('bogus');
  });

  it('lets a client report consuming a treat', () => {
    const server = serverPet();
    const merged = mergeClientPet(
      server,
      withClient({
        inventory: { ...server.inventory, chess_cookie: 1 },
      }),
      NOW,
    );
    expect(merged.inventory.chess_cookie).toBe(1);
  });

  it('sanitizes the name and falls back to the server name when invalid', () => {
    expect(
      mergeClientPet(serverPet(), withClient({ name: 'x' }), NOW).name,
    ).toBe('Goo');
    expect(
      mergeClientPet(serverPet(), withClient({ name: '  Rex\u0000  ' }), NOW)
        .name,
    ).toBe('Rex');
  });
});
