import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import type {
  ArcadePetCollectionResponse,
  ArcadePetEconomyResult,
} from '@arcadeum/games-core';
import { useArcadePetStore } from './useArcadePetStore';
import {
  markPetsSynced,
  pushPetState,
  resetServerQueue,
  sendEconomyAction,
} from './arcade-pet-server-actions';

const performServerAction = vi.fn();
const pushServerCollection = vi.fn();

vi.mock('../lib/arcade-pet-sync', async (importActual) => {
  const actual = await importActual<typeof import('../lib/arcade-pet-sync')>();
  return {
    ...actual,
    performServerAction: (a: unknown) => performServerAction(a),
    pushServerCollection: (r: unknown) => pushServerCollection(r),
  };
});

const collection = (
  over: Partial<ArcadePetCollectionResponse> = {},
): ArcadePetCollectionResponse => ({
  revision: 5,
  pets: [],
  activePetId: null,
  gemBalance: 250,
  coinBalance: 40,
  adoptionCount: 1,
  homeCapacity: 2,
  queuedThemeForNextPet: null,
  presents: [],
  hasConfirmedCare: true,
  isAtHome: false,
  dailyStreak: 0,
  lastDailyClaimDay: null,
  claimedMilestones: [],
  ...over,
});

const st = () => useArcadePetStore.getState();
const set = useArcadePetStore.setState;

describe('server actions', () => {
  beforeEach(() => {
    resetServerQueue();
    performServerAction.mockReset();
    pushServerCollection.mockReset();
    pushServerCollection.mockResolvedValue({
      status: 'ok',
      collection: collection(),
    });
    set({
      pets: [],
      pet: null,
      activePetId: null,
      serverBacked: true,
      hasConfirmedCare: true,
      syncRevision: 4,
      gemBalance: 999,
    });
  });

  it('does nothing when not server-backed', async () => {
    set({ serverBacked: false });
    const res = await sendEconomyAction(st, set, { type: 'claim_daily' });
    expect(res).toBeNull();
    expect(performServerAction).not.toHaveBeenCalled();
  });

  it('adopts server-owned fields on success but keeps local pets', async () => {
    const pet = createInitialPet({ id: 'mine', name: 'Mine' });
    set({ pets: [pet], pet, activePetId: 'mine' });
    performServerAction.mockResolvedValue({
      ok: true,
      collection: collection({ pets: [] }),
    } satisfies ArcadePetEconomyResult);
    await sendEconomyAction(st, set, { type: 'claim_daily' });
    expect(st().gemBalance).toBe(250);
    expect(st().syncRevision).toBe(5);
    expect(st().pets.map((p) => p.id)).toEqual(['mine']);
  });

  it('rolls optimistic state back when the server rejects', async () => {
    const ghost = createInitialPet({ id: 'ghost', name: 'Ghost' });
    set({ pets: [ghost], pet: ghost, activePetId: 'ghost' });
    performServerAction.mockResolvedValue({
      ok: false,
      error: 'INSUFFICIENT_GEMS',
      collection: collection({ gemBalance: 5 }),
    } satisfies ArcadePetEconomyResult);
    await sendEconomyAction(st, set, {
      type: 'adopt_random',
      petId: 'ghost',
      species: 'slime',
      theme: 'retro',
      name: 'Ghost',
    });
    expect(st().gemBalance).toBe(5);
    expect(st().pets).toEqual([]);
    expect(st().pet).toBeNull();
  });

  it('keeps optimistic state when the request fails (offline)', async () => {
    performServerAction.mockRejectedValue(new Error('offline'));
    const res = await sendEconomyAction(st, set, { type: 'claim_daily' });
    expect(res).toBeNull();
    expect(st().gemBalance).toBe(999);
  });

  it('pushes changed pet state before each action, in order', async () => {
    const calls: string[] = [];
    pushServerCollection.mockImplementation(async () => {
      calls.push('push');
      return { status: 'ok', collection: collection() };
    });
    performServerAction.mockImplementation(async () => {
      calls.push('action');
      return { ok: true, collection: collection() };
    });
    const pet = createInitialPet({ id: 'p', name: 'P' });
    set({ pets: [pet], pet, activePetId: 'p' });
    await sendEconomyAction(st, set, { type: 'feed_snack', petId: 'p' });
    expect(calls).toEqual(['push', 'action']);
    expect(pushServerCollection.mock.calls[0][0]).toMatchObject({
      baseRevision: 4,
    });
  });

  it('serializes concurrent actions in FIFO order', async () => {
    const order: string[] = [];
    performServerAction.mockImplementation(async (a: { type: string }) => {
      order.push(`start:${a.type}`);
      await Promise.resolve();
      order.push(`end:${a.type}`);
      return { ok: true, collection: collection() };
    });
    await Promise.all([
      sendEconomyAction(st, set, { type: 'claim_daily' }),
      sendEconomyAction(st, set, { type: 'claim_milestones' }),
    ]);
    expect(order).toEqual([
      'start:claim_daily',
      'end:claim_daily',
      'start:claim_milestones',
      'end:claim_milestones',
    ]);
  });
});

describe('pushPetState', () => {
  beforeEach(() => {
    resetServerQueue();
    pushServerCollection.mockReset();
    set({ serverBacked: true, hasConfirmedCare: true, syncRevision: 1 });
  });

  it('skips the request when nothing changed', async () => {
    markPetsSynced(st);
    await pushPetState(st, set);
    expect(pushServerCollection).not.toHaveBeenCalled();
  });

  it('adopts the server copy on conflict', async () => {
    pushServerCollection.mockResolvedValue({
      status: 'conflict',
      collection: collection({ revision: 9, gemBalance: 77 }),
    });
    await pushPetState(st, set);
    expect(st().syncRevision).toBe(9);
    expect(st().gemBalance).toBe(77);
  });

  it('stays quiet on network errors', async () => {
    pushServerCollection.mockRejectedValue(new Error('offline'));
    await expect(pushPetState(st, set)).resolves.toBeUndefined();
  });
});
