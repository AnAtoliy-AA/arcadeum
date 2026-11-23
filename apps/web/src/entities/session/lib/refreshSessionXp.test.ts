import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchProfile = vi.fn();
const setTokens = vi.fn();
let snapshot: { accessToken: string | null; xp: number };

vi.mock('@/entities/session/api/authApi', () => ({
  fetchProfile: (...a: unknown[]) => fetchProfile(...a),
}));
vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: { getState: () => ({ snapshot, setTokens }) },
}));

import { refreshSessionXp } from './refreshSessionXp';

describe('refreshSessionXp', () => {
  beforeEach(() => {
    fetchProfile.mockReset();
    setTokens.mockReset();
    snapshot = { accessToken: 'tok', xp: 10 };
  });

  it('writes the new xp into the session', async () => {
    fetchProfile.mockResolvedValue({ xp: 150 });
    await refreshSessionXp();
    expect(setTokens).toHaveBeenCalledWith({ xp: 150 });
  });

  it('does nothing without an access token (guests)', async () => {
    snapshot = { accessToken: null, xp: 0 };
    await refreshSessionXp();
    expect(fetchProfile).not.toHaveBeenCalled();
  });

  it('skips the write when xp is unchanged', async () => {
    fetchProfile.mockResolvedValue({ xp: 10 });
    await refreshSessionXp();
    expect(setTokens).not.toHaveBeenCalled();
  });

  it('swallows network errors', async () => {
    fetchProfile.mockRejectedValue(new Error('offline'));
    await expect(refreshSessionXp()).resolves.toBeUndefined();
    expect(setTokens).not.toHaveBeenCalled();
  });
});
