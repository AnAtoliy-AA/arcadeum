import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { createInitialPet } from '@arcadeum/games-core';
import type { ArcadePetCollectionResponse } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { resetServerQueue } from '../store/arcade-pet-server-actions';
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
  dailyStreak: 0,
  lastDailyClaimDay: null,
  claimedMilestones: [],
  ...over,
});

const flush = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
};

describe('useArcadePetSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetServerQueue();
    fetchServerCollection.mockReset();
    pushServerCollection.mockReset();
    useArcadePetStore.setState({
      pet: null,
      pets: [],
      activePetId: null,
      hasConfirmedCare: false,
      syncRevision: null,
      serverBacked: false,
      presents: [],
      gemBalance: 300,
      coinBalance: 50,
      isAtHome: false,
    });
  });

  afterEach(() => vi.useRealTimers());

  it('does nothing when disabled', async () => {
    renderHook(() => useArcadePetSync(false));
    await flush();
    expect(fetchServerCollection).not.toHaveBeenCalled();
    expect(useArcadePetStore.getState().serverBacked).toBe(false);
  });

  it('adopts the server collection and becomes server-backed', async () => {
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
    expect(state.serverBacked).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(pushServerCollection).not.toHaveBeenCalled();
  });

  it('discards stale local pets when the server has none', async () => {
    const stale = createInitialPet({ id: 'old', name: 'Old' });
    useArcadePetStore.setState({
      pets: [stale],
      pet: stale,
      activePetId: 'old',
      hasConfirmedCare: true,
    });
    fetchServerCollection.mockResolvedValue(serverCollection({ revision: 0 }));
    renderHook(() => useArcadePetSync(true));
    await flush();
    const state = useArcadePetStore.getState();
    expect(state.pets).toEqual([]);
    expect(state.hasConfirmedCare).toBe(false);
  });

  it('pushes only pet state, debounced, after a local change', async () => {
    const pet = createInitialPet({ id: 'p', name: 'P' });
    fetchServerCollection.mockResolvedValue(
      serverCollection({
        revision: 2,
        pets: [pet],
        activePetId: 'p',
        hasConfirmedCare: true,
      }),
    );
    pushServerCollection.mockResolvedValue({
      status: 'ok',
      collection: serverCollection({ revision: 3 }),
    });
    renderHook(() => useArcadePetSync(true));
    await flush();

    await act(async () => {
      useArcadePetStore.setState({ isAtHome: true });
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(pushServerCollection).toHaveBeenCalledTimes(1);
    const payload = pushServerCollection.mock.calls[0][0] as object;
    expect(Object.keys(payload).sort()).toEqual([
      'activePetId',
      'baseRevision',
      'isAtHome',
      'pets',
    ]);
    expect(useArcadePetStore.getState().syncRevision).toBe(3);
  });

  it('does not push for balance-only changes', async () => {
    const pet = createInitialPet({ id: 'p', name: 'P' });
    fetchServerCollection.mockResolvedValue(
      serverCollection({
        revision: 2,
        pets: [pet],
        activePetId: 'p',
        hasConfirmedCare: true,
      }),
    );
    renderHook(() => useArcadePetSync(true));
    await flush();
    await act(async () => {
      useArcadePetStore.setState({ gemBalance: 1 });
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(pushServerCollection).not.toHaveBeenCalled();
  });

  it('stays local when the pull fails and resets on unmount', async () => {
    fetchServerCollection.mockRejectedValue(new Error('offline'));
    const { unmount } = renderHook(() => useArcadePetSync(true));
    await flush();
    expect(useArcadePetStore.getState().serverBacked).toBe(false);
    useArcadePetStore.setState({ serverBacked: true });
    unmount();
    expect(useArcadePetStore.getState().serverBacked).toBe(false);
  });

  describe('status', () => {
    it('is idle while disabled', async () => {
      const { result } = renderHook(() => useArcadePetSync(false));
      await flush();
      expect(result.current.status).toBe('idle');
    });

    it('reports syncing then synced', async () => {
      fetchServerCollection.mockResolvedValue(serverCollection());
      const { result } = renderHook(() => useArcadePetSync(true));
      expect(result.current.status).toBe('syncing');
      await flush();
      expect(result.current.status).toBe('synced');
    });

    it('reports error on a failed pull and recovers on retry', async () => {
      fetchServerCollection.mockRejectedValueOnce(new Error('offline'));
      const { result } = renderHook(() => useArcadePetSync(true));
      await flush();
      expect(result.current.status).toBe('error');

      fetchServerCollection.mockResolvedValue(serverCollection());
      act(() => result.current.retry());
      expect(result.current.status).toBe('syncing');
      await flush();
      expect(result.current.status).toBe('synced');
      expect(fetchServerCollection).toHaveBeenCalledTimes(2);
    });
  });
});
