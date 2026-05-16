import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const triggerRefreshMock = vi.fn();
vi.mock('@/shared/model/useRefreshStore', () => ({
  useRefreshStore: (
    selector: (state: {
      triggerRefresh: typeof triggerRefreshMock;
      getSignal: () => number;
    }) => unknown,
  ) =>
    selector({
      triggerRefresh: triggerRefreshMock,
      getSignal: () => 0,
    }),
}));

const sessionStateRef: { accessToken: string | null } = {
  accessToken: 'tok',
};
vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: (
    selector: (state: { snapshot: { accessToken: string | null } }) => unknown,
  ) => selector({ snapshot: sessionStateRef }),
}));

import { apiClient } from '@/shared/lib/api-client';
import { useAdminUsers, useUpdateUserRole } from './hooks';

const apiMock = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  apiMock.get.mockReset();
  apiMock.patch.mockReset();
  triggerRefreshMock.mockReset();
  sessionStateRef.accessToken = 'tok';
});

describe('useAdminUsers', () => {
  it('calls fetchAdminUsers when token present', async () => {
    apiMock.get.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    const { result } = renderHook(() =>
      useAdminUsers({ page: 1, pageSize: 50 }),
    );

    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('is disabled when no access token', async () => {
    sessionStateRef.accessToken = null;

    const { result } = renderHook(() =>
      useAdminUsers({ page: 1, pageSize: 50 }),
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(apiMock.get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});

describe('useUpdateUserRole', () => {
  it('calls updateUserRole and triggers refresh on settle', async () => {
    apiMock.patch.mockResolvedValueOnce({ id: 'u1', role: 'admin' });

    const { result } = renderHook(() => useUpdateUserRole());

    await act(async () => {
      await result.current.mutateAsync({ userId: 'u1', role: 'admin' });
    });

    expect(apiMock.patch).toHaveBeenCalled();
    expect(triggerRefreshMock).toHaveBeenCalledWith('admin-users');
  });

  it('triggers refresh even on error (onSettled)', async () => {
    apiMock.patch.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useUpdateUserRole());

    await act(async () => {
      await expect(
        result.current.mutateAsync({ userId: 'u1', role: 'admin' }),
      ).rejects.toThrow('boom');
    });

    expect(triggerRefreshMock).toHaveBeenCalledWith('admin-users');
  });
});
