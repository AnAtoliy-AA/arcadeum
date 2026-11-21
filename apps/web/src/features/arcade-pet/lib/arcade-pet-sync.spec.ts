import { describe, expect, it } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import type {
  ArcadePetCollectionResponse,
  PetGiftPresentPayload,
} from '@arcadeum/games-core';
import {
  buildCollectionPayload,
  buildServerPatch,
  collectionSignature,
  decidePull,
  mergePresentLists,
} from './arcade-pet-sync';

const present = (id: string, isOpened = false): PetGiftPresentPayload => ({
  id,
  senderId: 'admin',
  senderName: 'Admin',
  species: 'dragon',
  theme: 'retro',
  petName: 'Dragon',
  createdAt: 1,
  isOpened,
});

const server = (
  over: Partial<ArcadePetCollectionResponse> = {},
): ArcadePetCollectionResponse => ({
  revision: 4,
  pets: [createInitialPet({ id: 'p1', name: 'Rex' })],
  activePetId: 'p1',
  gemBalance: 120,
  coinBalance: 30,
  adoptionCount: 1,
  homeCapacity: 2,
  queuedThemeForNextPet: null,
  presents: [],
  hasConfirmedCare: true,
  isAtHome: false,
  ...over,
});

describe('mergePresentLists', () => {
  it('unions by id and keeps opened state from either side', () => {
    const merged = mergePresentLists(
      [present('a', true), present('local-only')],
      [present('a', false), present('server-only')],
    );
    expect(merged.map((p) => p.id).sort()).toEqual([
      'a',
      'local-only',
      'server-only',
    ]);
    expect(merged.find((p) => p.id === 'a')?.isOpened).toBe(true);
  });
});

describe('decidePull', () => {
  it('seeds an empty server record from confirmed local state', () => {
    expect(
      decidePull(
        { hasConfirmedCare: true, syncRevision: null },
        server({ revision: 0, pets: [], hasConfirmedCare: false }),
      ),
    ).toBe('push-local');
  });

  it('does nothing when both sides are empty', () => {
    expect(
      decidePull(
        { hasConfirmedCare: false, syncRevision: null },
        server({ revision: 0, pets: [], hasConfirmedCare: false }),
      ),
    ).toBe('in-sync');
  });

  it('applies the server copy when local was never synced or is stale', () => {
    expect(
      decidePull({ hasConfirmedCare: true, syncRevision: null }, server()),
    ).toBe('apply-server');
    expect(
      decidePull({ hasConfirmedCare: true, syncRevision: 2 }, server()),
    ).toBe('apply-server');
  });

  it('keeps local when it matches the server revision', () => {
    expect(
      decidePull({ hasConfirmedCare: true, syncRevision: 4 }, server()),
    ).toBe('in-sync');
  });
});

describe('buildServerPatch', () => {
  it('adopts server state, picks the active pet and records the revision', () => {
    const patch = buildServerPatch(
      { presents: [present('local')], activePetId: null },
      server({ presents: [present('s')] }),
    );
    expect(patch.pet?.id).toBe('p1');
    expect(patch.gemBalance).toBe(120);
    expect(patch.syncRevision).toBe(4);
    expect(patch.presents?.map((p) => p.id).sort()).toEqual(['local', 's']);
  });
});

describe('collection payload', () => {
  const base = {
    pets: [],
    activePetId: null,
    gemBalance: 10.7,
    coinBalance: -3,
    adoptionCount: 0,
    homeCapacity: 1,
    queuedThemeForNextPet: null,
    presents: [],
    hasConfirmedCare: true,
    isAtHome: false,
  };

  it('floors and clamps balances to integers >= 0', () => {
    const payload = buildCollectionPayload(base);
    expect(payload.gemBalance).toBe(10);
    expect(payload.coinBalance).toBe(0);
  });

  it('changes signature only when synced data changes', () => {
    expect(collectionSignature(base)).toBe(collectionSignature({ ...base }));
    expect(collectionSignature(base)).not.toBe(
      collectionSignature({ ...base, homeCapacity: 2 }),
    );
  });
});
