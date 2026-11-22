import { describe, it, expect, vi, beforeEach } from 'vitest';

const { MockApiError } = vi.hoisted(() => ({
  MockApiError: class extends Error {
    constructor(
      message: string,
      public readonly status: number,
    ) {
      super(message);
    }
  },
}));

vi.mock('@/shared/lib/api-client', () => ({ ApiError: MockApiError }));

const refreshSessionFromCookie = vi.fn();
vi.mock('../api/authApi', () => ({
  refreshSessionFromCookie: (...args: unknown[]) =>
    refreshSessionFromCookie(...args),
}));

const acquireRefreshLock = vi.fn();
vi.mock('../lib/refreshLock', () => ({
  acquireRefreshLock: () => acquireRefreshLock(),
}));

import { useSessionStore, LOGOUT_MARKER_KEY } from './sessionStore';

const response = {
  accessToken: 'new-access',
  accessTokenExpiresAt: '2030-01-01T00:00:00.000Z',
  refreshToken: 'rotated',
  user: {
    id: 'u1',
    email: 'a@b.c',
    username: 'a',
    displayName: 'A',
    role: 'free',
  },
};

async function signIn(): Promise<void> {
  await useSessionStore.getState().setTokens({
    provider: 'oauth',
    accessToken: 'old-access',
    userId: 'u1',
  });
}

describe('sessionStore.refreshTokens', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    acquireRefreshLock.mockReturnValue(true);
    await useSessionStore.getState().clearTokens();
    useSessionStore.setState({ refreshInFlight: false });
    localStorage.clear();
  });

  it('refreshes from the cookie and never sends a body token', async () => {
    await signIn();
    refreshSessionFromCookie.mockResolvedValue(response);
    const next = await useSessionStore.getState().refreshTokens();
    expect(refreshSessionFromCookie).toHaveBeenCalledWith();
    expect(next.accessToken).toBe('new-access');
    expect(next.provider).toBe('oauth');
  });

  it('restores via cookie when only a persisted userId exists', async () => {
    useSessionStore.setState({
      snapshot: { ...useSessionStore.getState().snapshot, userId: 'u1' },
    });
    refreshSessionFromCookie.mockResolvedValue(response);
    const next = await useSessionStore.getState().refreshTokens();
    expect(next.accessToken).toBe('new-access');
    expect(next.provider).toBe('local');
  });

  it('does nothing and keeps the lock for anonymous visitors', async () => {
    await useSessionStore.getState().refreshTokens();
    expect(acquireRefreshLock).not.toHaveBeenCalled();
    expect(refreshSessionFromCookie).not.toHaveBeenCalled();
  });

  it('clears the session on a definite 401', async () => {
    await signIn();
    refreshSessionFromCookie.mockRejectedValue(new MockApiError('no', 401));
    await expect(useSessionStore.getState().refreshTokens()).rejects.toThrow();
    expect(useSessionStore.getState().snapshot.userId).toBeNull();
    expect(localStorage.getItem(LOGOUT_MARKER_KEY)).not.toBeNull();
  });

  it.each([429, 500, 503])(
    'keeps the session on transient %i',
    async (code) => {
      await signIn();
      refreshSessionFromCookie.mockRejectedValue(new MockApiError('x', code));
      await expect(
        useSessionStore.getState().refreshTokens(),
      ).rejects.toThrow();
      expect(useSessionStore.getState().snapshot.accessToken).toBe(
        'old-access',
      );
      expect(useSessionStore.getState().refreshInFlight).toBe(false);
    },
  );

  it('keeps the session on network errors', async () => {
    await signIn();
    refreshSessionFromCookie.mockRejectedValue(new TypeError('fetch failed'));
    await expect(useSessionStore.getState().refreshTokens()).rejects.toThrow();
    expect(useSessionStore.getState().snapshot.userId).toBe('u1');
  });

  it('skips when another tab holds the refresh lock', async () => {
    await signIn();
    acquireRefreshLock.mockReturnValue(false);
    await useSessionStore.getState().refreshTokens();
    expect(refreshSessionFromCookie).not.toHaveBeenCalled();
  });
});

describe('cross-tab logout', () => {
  beforeEach(async () => {
    await useSessionStore.getState().clearTokens();
    localStorage.clear();
  });

  it('does not write a logout marker when nobody was signed in', async () => {
    await useSessionStore.getState().clearTokens();
    expect(localStorage.getItem(LOGOUT_MARKER_KEY)).toBeNull();
  });

  it('ignores removal of the persisted snapshot from another tab', async () => {
    await signIn();
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'web_session_tokens_v1',
        newValue: null,
      }),
    );
    expect(useSessionStore.getState().snapshot.userId).toBe('u1');
  });

  it('signs out when another tab writes the logout marker', async () => {
    await signIn();
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LOGOUT_MARKER_KEY,
        newValue: '123',
      }),
    );
    expect(useSessionStore.getState().snapshot.userId).toBeNull();
    expect(useSessionStore.getState().snapshot.accessToken).toBeNull();
  });
});
