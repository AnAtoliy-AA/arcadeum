import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const triggerRefreshMock = vi.fn();
vi.mock('@/shared/model/useRefreshStore', () => ({
  useRefreshStore: (
    selector: (state: {
      triggerRefresh: typeof triggerRefreshMock;
      getSignal: () => number;
    }) => unknown,
  ) => selector({ triggerRefresh: triggerRefreshMock, getSignal: () => 0 }),
}));

const sessionStateRef: { accessToken: string | null } = { accessToken: 'tok' };
vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: (
    selector: (state: { snapshot: { accessToken: string | null } }) => unknown,
  ) => selector({ snapshot: sessionStateRef }),
}));

import { apiClient } from '@/shared/lib/api-client';
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from './hooks';

const apiMock = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  apiMock.get.mockReset();
  apiMock.post.mockReset();
  apiMock.patch.mockReset();
  apiMock.delete.mockReset();
  triggerRefreshMock.mockReset();
  sessionStateRef.accessToken = 'tok';
});

describe('useAdminAnnouncements', () => {
  it('calls fetchAdminAnnouncements when token present', async () => {
    apiMock.get.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
    });
    renderHook(() => useAdminAnnouncements({ page: 1 }));
    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
  });

  it('is disabled when no token', async () => {
    sessionStateRef.accessToken = null;
    renderHook(() => useAdminAnnouncements({ page: 1 }));
    await new Promise((r) => setTimeout(r, 50));
    expect(apiMock.get).not.toHaveBeenCalled();
  });
});

describe('useCreateAnnouncement', () => {
  it('posts body and triggers BOTH refresh keys', async () => {
    apiMock.post.mockResolvedValueOnce({ id: 'x' });
    const { result } = renderHook(() => useCreateAnnouncement());
    await act(async () => {
      await result.current.mutateAsync({
        severity: 'info',
        content: { en: { title: 'X' } },
      });
    });
    expect(triggerRefreshMock).toHaveBeenCalledWith('admin-announcements');
    expect(triggerRefreshMock).toHaveBeenCalledWith('announcement-active');
  });
});

describe('useUpdateAnnouncement', () => {
  it('patches and triggers both refresh keys', async () => {
    apiMock.patch.mockResolvedValueOnce({ id: 'x' });
    const { result } = renderHook(() => useUpdateAnnouncement());
    await act(async () => {
      await result.current.mutateAsync({
        id: 'x',
        body: { severity: 'warning' },
      });
    });
    expect(triggerRefreshMock).toHaveBeenCalledWith('admin-announcements');
    expect(triggerRefreshMock).toHaveBeenCalledWith('announcement-active');
  });
});

describe('useDeleteAnnouncement', () => {
  it('deletes and triggers both refresh keys', async () => {
    apiMock.delete.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDeleteAnnouncement());
    await act(async () => {
      await result.current.mutateAsync({ id: 'x' });
    });
    expect(triggerRefreshMock).toHaveBeenCalledWith('admin-announcements');
    expect(triggerRefreshMock).toHaveBeenCalledWith('announcement-active');
  });
});
