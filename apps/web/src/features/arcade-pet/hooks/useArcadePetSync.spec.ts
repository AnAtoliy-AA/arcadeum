import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { createInitialPet } from '@arcadeum/games-core';
import type { ArcadePetCollectionResponse } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { useArcadePetSync } from './useArcadePetSync';

const fetchServerCollection = vi.fn();
const pushServerCollection = vi.fn();

vi.mock('../lib/arcade-pet-sync', async (importActual) => {
  const actual = await importActual<typeof import('../lib/arcade-pet-sync')>();
  return {
    ...actual,
    fetchServerCollection: () => fetchServerCollection(),
    pushServerCollection: (r: unknown) => pushServerCollection(r),
  };
});

const serverCollection = (
  over: Partial<ArcadePetCollectionResponse> = {},
): ArcadePetCollectionResponse => ({
  revision: 0,
  pets: [],
  activePetId: null,
  gemBalance: 300,
  coinBalance: 50,
  adoptionCount: 0,
  homeCapacity: 1,
  queuedThemeForNextPet: null,
  presents: [],
  hasConfirmedCare: false,
  isAtHome: false,
  ...over,
});

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('useArcadePetSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchServerCollection.mockReset();
    pushServerCollection.mockReset();
    useArcadePetStore.setState({
      pet: null,
      pets: [],
      activePetId: null,
      hasConfirmedCare: false,
      syncRevision: null,
      presents: [],
      gemBalance: 300,
      coinBalance: 50,
    });
  });

  afterEach(() => vi.useRealTimers());

  it('does nothing when disabled', async () => {
    renderHook(() => useArcadePetSync(false));
    await flush();
    expect(fetchServerCollection).not.toHaveBeenCalled();
  });

  it('adopts the server collection when it holds pets', async () => {
    const pet = createInitialPet({ id: 'srv', name: 'Srv' });
    fetchServerCollection.mockResolvedValue(
      serverCollection({
        revision: 3,
        pets: [pet],
        activePetId: 'srv',
        hasConfirmedCare: true,
        gemBalance: 999,
      }),
    );
    renderHook(() => useArcadePetSync(true));
    await flush();
    const state = useArcadePetStore.getState();
    expect(state.pets).toHaveLength(1);
    expect(state.gemBalance).toBe(999);
    expect(state.syncRevision).toBe(3);
    expect(pushServerCollection).not.toHaveBeenCalled();
  });

  it('seeds an empty server record from local state after the debounce', async () => {
    const pet = createInitialPet({ id: 'loc', name: 'Loc' });
    useArcadePetStore.setState({
      pets: [pet],
      pet,
      activePetId: 'loc',
      hasConfirmedCare: true,
    });
    fetchServerCollection.mockResolvedValue(serverCollection());
    pushServerCollection.mockImplementation(async () => ({
      status: 'ok',
      collection: serverCollection({ revision: 1 }),
    }));
    renderHook(() => useArcadePetSync(true));
    await flush();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(pushServerCollection).toHaveBeenCalledTimes(1);
    expect(pushServerCollection.mock.calls[0][0]).toMatchObject({
      baseRevision: 0,
      hasConfirmedCare: true,
    });
    expect(useArcadePetStore.getState().syncRevision).toBe(1);
  });

  it('pushes local edits and takes the server copy on conflict', async () => {
    const pet = createInitialPet({ id: 'p', name: 'P' });
    useArcadePetStore.setState({
      pets: [pet],
      pet,
      activePetId: 'p',
      hasConfirmedCare: true,
      syncRevision: 2,
    });
    fetchServerCollection.mockResolvedValue(
      serverCollection({
        revision: 2,
        pets: [pet],
        activePetId: 'p',
        hasConfirmedCare: true,
        gemBalance: 300,
      }),
    );
    pushServerCollection.mockResolvedValue({
      status: 'conflict',
      collection: serverCollection({
        revision: 5,
        pets: [pet],
        activePetId: 'p',
        hasConfirmedCare: true,
        gemBalance: 777,
      }),
    });
    renderHook(() => useArcadePetSync(true));
    await flush();
    expect(pushServerCollection).not.toHaveBeenCalled();

    await act(async () => {
      useArcadePetStore.setState({ gemBalance: 1 });
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(pushServerCollection).toHaveBeenCalledTimes(1);
    expect(useArcadePetStore.getState().gemBalance).toBe(777);
    expect(useArcadePetStore.getState().syncRevision).toBe(5);
  });

  it('stays local when the pull fails', async () => {
    fetchServerCollection.mockRejectedValue(new Error('offline'));
    renderHook(() => useArcadePetSync(true));
    await flush();
    expect(pushServerCollection).not.toHaveBeenCalled();
  });
});
