import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import type { ArcadePetCollectionResponse } from '@arcadeum/games-core';
import {
  buildEconomyPatch,
  buildRollbackPatch,
  buildServerPatch,
  buildSyncPayload,
  decidePull,
  syncSignature,
  performServerAction,
} from './arcade-pet-sync';
import { ApiError, apiClient } from '@/shared/lib/api-client';

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
  queuedThemeForNextPet: 'steampunk',
  presents: [],
  hasConfirmedCare: true,
  isAtHome: false,
  dailyStreak: 3,
  lastDailyClaimDay: '2026-11-15',
  claimedMilestones: ['first_hatch'],
  ...over,
});

describe('decidePull', () => {
  it('adopts the server unless the local revision matches', () => {
    expect(decidePull({ syncRevision: null }, server())).toBe('apply-server');
    expect(decidePull({ syncRevision: 2 }, server())).toBe('apply-server');
    expect(decidePull({ syncRevision: 4 }, server())).toBe('in-sync');
  });

  it('adopts an empty server record for a never-synced client', () => {
    expect(
      decidePull({ syncRevision: null }, server({ revision: 0, pets: [] })),
    ).toBe('apply-server');
  });
});

describe('buildEconomyPatch', () => {
  it('copies every server-owned field and the revision, but not pets', () => {
    const patch = buildEconomyPatch(server());
    expect(patch).toMatchObject({
      gemBalance: 120,
      coinBalance: 30,
      adoptionCount: 1,
      homeCapacity: 2,
      queuedThemeForNextPet: 'steampunk',
      dailyStreak: 3,
      lastDailyClaimDay: '2026-11-15',
      claimedMilestones: ['first_hatch'],
      syncRevision: 4,
    });
    expect(patch).not.toHaveProperty('pets');
  });
});

describe('buildServerPatch', () => {
  it('adopts the whole server collection including pets and presents', () => {
    const present = {
      id: 's',
      senderId: 'admin',
      senderName: 'Admin',
      species: 'dragon' as const,
      theme: 'retro',
      petName: 'D',
      createdAt: 1,
      isOpened: false,
    };
    const patch = buildServerPatch(
      { activePetId: null },
      server({ presents: [present] }),
    );
    expect(patch.pet?.id).toBe('p1');
    expect(patch.activePetId).toBe('p1');
    expect(patch.presents).toEqual([present]);
    expect(patch.syncRevision).toBe(4);
  });

  it('yields no active pet for an empty server collection', () => {
    const patch = buildServerPatch(
      { activePetId: 'x' },
      server({ pets: [], activePetId: null, hasConfirmedCare: false }),
    );
    expect(patch.pet).toBeNull();
    expect(patch.hasConfirmedCare).toBe(false);
  });
});

describe('buildRollbackPatch', () => {
  it('drops unknown optimistic pets but keeps local edits of known pets', () => {
    const known = { ...createInitialPet({ id: 'p1', name: 'Local Name' }) };
    const optimistic = createInitialPet({ id: 'ghost', name: 'Ghost' });
    const patch = buildRollbackPatch(
      { pets: [known, optimistic], activePetId: 'ghost' },
      server(),
    );
    expect(patch.pets?.map((p) => p.id)).toEqual(['p1']);
    expect(patch.pets?.[0].name).toBe('Local Name');
    expect(patch.activePetId).toBe('p1');
    expect(patch.gemBalance).toBe(120);
  });
});

describe('sync payload', () => {
  const base = { pets: [], activePetId: null, isAtHome: false };

  it('contains only client-writable fields', () => {
    expect(Object.keys(buildSyncPayload(base)).sort()).toEqual([
      'activePetId',
      'isAtHome',
      'pets',
    ]);
  });

  it('changes signature only when synced data changes', () => {
    expect(syncSignature(base)).toBe(syncSignature({ ...base }));
    expect(syncSignature(base)).not.toBe(
      syncSignature({ ...base, isAtHome: true }),
    );
  });
});

describe('performServerAction', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends a uuid action id with the action', async () => {
    const fetchSpy = vi
      .spyOn(apiClient, 'fetch')
      .mockResolvedValue({ ok: true, collection: {} });
    await performServerAction({ type: 'claim_daily' }, 'id-1');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/arcade-pet/collection/action',
      expect.objectContaining({
        method: 'POST',
        data: { type: 'claim_daily', actionId: 'id-1' },
      }),
    );
  });

  it('turns an HTTP rejection into a result carrying the collection', async () => {
    const collection = { revision: 3 };
    vi.spyOn(apiClient, 'fetch').mockRejectedValue(
      new ApiError('INSUFFICIENT_GEMS', 402, {
        error: 'INSUFFICIENT_GEMS',
        details: { collection },
      }),
    );
    await expect(
      performServerAction({ type: 'upgrade_home', currency: 'gems' }),
    ).resolves.toEqual({
      ok: false,
      error: 'INSUFFICIENT_GEMS',
      collection,
    });
  });

  it('rethrows failures that carry no collection (offline, 404 flag off)', async () => {
    vi.spyOn(apiClient, 'fetch').mockRejectedValue(
      new ApiError('Not Found', 404, { statusCode: 404 }),
    );
    await expect(
      performServerAction({ type: 'claim_daily' }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
