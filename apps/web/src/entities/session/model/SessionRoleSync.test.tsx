import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

const INITIAL_SYNC_DEFER_MS = 2000;
const RESTORE_401_RETRY_DELAY_MS = 800;

// ---- Mock apiClient ----
// Inline ApiError rather than vi.importActual to avoid an extra module-
// resolution roundtrip and any side effects from the real api-client
// module on first load.
vi.mock('@/shared/lib/api-client', () => {
  class ApiError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly data: unknown = null,
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  return {
    apiClient: { get: vi.fn() },
    ApiError,
  };
});

// ---- Mock the store ----
type Listener = (state: StoreState, prev: StoreState) => void;
interface Snapshot {
  accessToken: string | null;
  refreshToken?: string | null;
  userId?: string | null;
  accessTokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
}
interface StoreState {
  hydrated: boolean;
  snapshot: Snapshot;
  setTokens: ReturnType<typeof vi.fn>;
  refreshTokens: ReturnType<typeof vi.fn>;
}

const storeRef: { state: StoreState; listeners: Listener[] } = {
  state: {
    hydrated: false,
    snapshot: { accessToken: null },
    setTokens: vi.fn(),
    refreshTokens: vi.fn(),
  },
  listeners: [],
};

const setStoreState = (next: Partial<StoreState>) => {
  const prev = storeRef.state;
  storeRef.state = { ...prev, ...next };
  storeRef.listeners.forEach((l) => l(storeRef.state, prev));
};

// Mock harness stubs only the methods SessionRoleSync touches
// (`getState` and `subscribe`). Extend if the SUT changes.
vi.mock('../store/sessionStore', () => ({
  useSessionStore: Object.assign(
    (selector: (s: StoreState) => unknown) => selector(storeRef.state),
    {
      getState: () => storeRef.state,
      subscribe: (listener: Listener) => {
        storeRef.listeners.push(listener);
        return () => {
          const idx = storeRef.listeners.indexOf(listener);
          if (idx >= 0) storeRef.listeners.splice(idx, 1);
        };
      },
    },
  ),
}));

const mockRefreshFromCookie = vi.hoisted(() => vi.fn());
vi.mock('../api/authApi', () => ({
  refreshSessionFromCookie: mockRefreshFromCookie,
}));

const mockAcquireLock = vi.hoisted(() => vi.fn());
vi.mock('../lib/refreshLock', () => ({
  acquireRefreshLock: mockAcquireLock,
}));

import { apiClient, ApiError } from '@/shared/lib/api-client';
import { SessionRoleSync } from './SessionRoleSync';

// vi.mock above replaces apiClient.get with a vi.fn() at module load,
// so accessing it as a Mock at runtime is safe. Double-cast is the
// idiomatic bridge from the typed `apiClient.get` to vi's mock surface.
const apiGetMock = apiClient.get as unknown as ReturnType<typeof vi.fn>;

const PROFILE = {
  id: 'u1',
  email: 'a@x',
  username: 'alice',
  displayName: 'Alice',
  role: 'admin' as const,
};

const REFRESH_RESPONSE = {
  accessToken: 'new-access',
  accessTokenExpiresAt: '2026-05-09T00:15:00Z',
  refreshToken: 'new-refresh',
  refreshTokenExpiresAt: '2026-05-16T00:00:00Z',
  user: PROFILE,
};

const makeSetTokens = () =>
  vi.fn().mockImplementation(async (input: Record<string, unknown>) => {
    storeRef.state = {
      ...storeRef.state,
      snapshot: { ...storeRef.state.snapshot, ...input },
    };
    return storeRef.state.snapshot;
  });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'Date'] });
  vi.setSystemTime(new Date('2026-05-09T00:00:00Z'));
  apiGetMock.mockReset();
  mockRefreshFromCookie.mockReset();
  mockAcquireLock.mockReset().mockReturnValue(true);
  storeRef.state = {
    hydrated: true,
    snapshot: { accessToken: 'tok' },
    setTokens: makeSetTokens(),
    refreshTokens: vi.fn().mockResolvedValue(undefined),
  };
  storeRef.listeners = [];
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Drains microtasks more aggressively than a single `act` cycle so
// multi-await chains inside the SUT (apiClient.get -> setTokens ->
// ref update) all complete before assertions.
const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('SessionRoleSync', () => {
  it('fetches /auth/me on mount when hydrated and accessToken present', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();

    expect(apiGetMock).toHaveBeenCalledTimes(1);
    expect(apiGetMock).toHaveBeenCalledWith('/auth/me', { token: 'tok' });
  });

  it('does not fetch when not hydrated', async () => {
    storeRef.state.hydrated = false;
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it('does nothing when accessToken is null and no prior session', async () => {
    storeRef.state.snapshot = { accessToken: null };
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();
    expect(apiGetMock).not.toHaveBeenCalled();
    expect(mockRefreshFromCookie).not.toHaveBeenCalled();
  });

  it('fires sync after hydration flips from false to true', async () => {
    storeRef.state.hydrated = false;
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    await flushPromises();
    expect(apiGetMock).not.toHaveBeenCalled();
    expect(storeRef.listeners.length).toBe(1);

    setStoreState({ hydrated: true });
    await flushPromises();

    expect(apiGetMock).toHaveBeenCalledTimes(1);
  });

  it('passes profile + equipped cosmetic fields to setTokens (no token fields)', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();

    expect(storeRef.state.setTokens).toHaveBeenCalledTimes(1);
    const arg = storeRef.state.setTokens.mock.calls[0][0];
    expect(arg).toEqual({
      userId: 'u1',
      email: 'a@x',
      username: 'alice',
      displayName: 'Alice',
      role: 'admin',
      equippedAvatarId: null,
      equippedBadgeId: null,
      equippedNameColorId: null,
      equippedFrameId: null,
      equippedAuraId: null,
      equippedBannerId: null,
      equippedGameSkinId: null,
    });
    expect(arg).not.toHaveProperty('accessToken');
    expect(arg).not.toHaveProperty('refreshToken');
    expect(arg).not.toHaveProperty('accessTokenExpiresAt');
  });

  it('propagates equipped cosmetics from /auth/me so the header avatar stays fresh', async () => {
    apiGetMock.mockResolvedValueOnce({
      ...PROFILE,
      equippedAvatarId: 'avatar-saturn',
      equippedFrameId: 'frame-gold',
    });
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();

    const arg = storeRef.state.setTokens.mock.calls[0][0];
    expect(arg.equippedAvatarId).toBe('avatar-saturn');
    expect(arg.equippedFrameId).toBe('frame-gold');
  });

  it('logout-during-sync: drops the result if accessToken cleared mid-fetch', async () => {
    let resolveFetch: (v: typeof PROFILE) => void = () => {};
    apiGetMock.mockReturnValueOnce(
      new Promise<typeof PROFILE>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();

    setStoreState({ snapshot: { accessToken: null } });

    resolveFetch(PROFILE);
    await flushPromises();

    expect(storeRef.state.setTokens).toHaveBeenCalledTimes(0);
  });

  it('throttle: focus event right after mount does not refetch', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(1);
  });

  it('throttle: focus event after 30s elapses fires another fetch', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 31_000);
    apiGetMock.mockResolvedValueOnce(PROFILE);
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();

    expect(apiGetMock).toHaveBeenCalledTimes(2);
  });

  it('inFlight: focus event during pending sync does not start a second fetch', async () => {
    let resolveFetch: (v: typeof PROFILE) => void = () => {};
    apiGetMock.mockReturnValueOnce(
      new Promise<typeof PROFILE>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<SessionRoleSync />);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(apiGetMock).toHaveBeenCalledTimes(1);

    resolveFetch(PROFILE);
    await flushPromises();
  });

  it('on 401, calls refreshTokens and does not call setTokens; throttle slot not consumed', async () => {
    apiGetMock.mockRejectedValueOnce(new ApiError('Unauthorized', 401, null));
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();

    expect(storeRef.state.refreshTokens).toHaveBeenCalledTimes(1);
    expect(storeRef.state.setTokens).not.toHaveBeenCalled();

    apiGetMock.mockResolvedValueOnce(PROFILE);
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(2);
  });

  it('on 5xx, swallows error silently; throttle slot not consumed', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    apiGetMock.mockRejectedValueOnce(new ApiError('Server error', 500, null));
    render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();

    expect(storeRef.state.setTokens).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);

    apiGetMock.mockResolvedValueOnce(PROFILE);
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });

  describe('cookie restore path (no in-memory access token after refresh)', () => {
    beforeEach(() => {
      storeRef.state.snapshot = {
        accessToken: null,
        userId: 'u1',
        refreshToken: null,
      };
    });

    it('restores from the refresh cookie and then syncs /auth/me', async () => {
      mockRefreshFromCookie.mockResolvedValueOnce(REFRESH_RESPONSE);
      apiGetMock.mockResolvedValueOnce(PROFILE);

      render(<SessionRoleSync />);
      act(() => {
        vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
      });
      await flushPromises();

      expect(mockRefreshFromCookie).toHaveBeenCalledTimes(1);
      const restoreCall = storeRef.state.setTokens.mock.calls.find(
        (call) =>
          (call[0] as { accessToken?: string } | undefined)?.accessToken ===
          'new-access',
      );
      expect(restoreCall).toBeDefined();
      expect(apiGetMock).toHaveBeenCalledWith('/auth/me', {
        token: 'new-access',
      });
    });

    it('backs off after a transient failure and does not spam on every focus', async () => {
      mockRefreshFromCookie.mockRejectedValueOnce(
        new ApiError('Too Many Requests', 429, null),
      );

      render(<SessionRoleSync />);
      act(() => {
        vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
      });
      await flushPromises();
      expect(mockRefreshFromCookie).toHaveBeenCalledTimes(1);

      // Focus immediately after — must NOT fire (backoff active).
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      await flushPromises();
      expect(mockRefreshFromCookie).toHaveBeenCalledTimes(1);

      // After the first backoff window (15s on second failure) the next
      // focus may retry.
      vi.setSystemTime(Date.now() + 16_000);
      mockRefreshFromCookie.mockResolvedValueOnce(REFRESH_RESPONSE);
      apiGetMock.mockResolvedValueOnce(PROFILE);
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      await flushPromises();

      expect(mockRefreshFromCookie).toHaveBeenCalledTimes(2);
    });

    it('retries once on 401 (cross-tab rotation race) and gives up after the second 401', async () => {
      mockRefreshFromCookie.mockRejectedValueOnce(
        new ApiError('Unauthorized', 401, null),
      );
      mockRefreshFromCookie.mockRejectedValueOnce(
        new ApiError('Unauthorized', 401, null),
      );

      render(<SessionRoleSync />);
      act(() => {
        vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
      });
      await flushPromises();

      // First 401 → retry after 800ms.
      expect(mockRefreshFromCookie).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(RESTORE_401_RETRY_DELAY_MS);
      });
      await flushPromises();

      // Second 401 → give up for 5 minutes.
      expect(mockRefreshFromCookie).toHaveBeenCalledTimes(2);
      expect(storeRef.state.setTokens).not.toHaveBeenCalled();

      // Focus events during the give-up window must not fire refresh.
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      await flushPromises();
      expect(mockRefreshFromCookie).toHaveBeenCalledTimes(2);
    });

    it('skips restore when another tab holds the refresh lock', async () => {
      mockAcquireLock.mockReturnValueOnce(false);

      render(<SessionRoleSync />);
      act(() => {
        vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
      });
      await flushPromises();

      expect(mockRefreshFromCookie).not.toHaveBeenCalled();
    });
  });

  it('cleans up focus listener and store subscription on unmount', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    apiGetMock.mockResolvedValueOnce(PROFILE);

    const { unmount } = render(<SessionRoleSync />);
    act(() => {
      vi.advanceTimersByTime(INITIAL_SYNC_DEFER_MS);
    });
    await flushPromises();

    expect(storeRef.listeners.length).toBe(1);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(storeRef.listeners.length).toBe(0);

    removeSpy.mockRestore();
  });
});
