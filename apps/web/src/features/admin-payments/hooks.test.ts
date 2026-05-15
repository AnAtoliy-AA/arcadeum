import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

vi.mock('@/shared/model/useRefreshStore', () => ({
  useRefreshStore: (
    selector: (state: {
      triggerRefresh: () => void;
      getSignal: () => number;
    }) => unknown,
  ) =>
    selector({
      triggerRefresh: () => undefined,
      getSignal: () => 0,
    }),
}));

const sessionStateRef: { accessToken: string | null } = { accessToken: 'tok' };
vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: (
    selector: (state: { snapshot: { accessToken: string | null } }) => unknown,
  ) => selector({ snapshot: sessionStateRef }),
}));

import { apiClient } from '@/shared/lib/api-client';
import { useAdminPaymentNotes } from './hooks';

const apiGetMock = apiClient.get as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  apiGetMock.mockReset();
  sessionStateRef.accessToken = 'tok';
});

describe('useAdminPaymentNotes', () => {
  it('fetches when token present', async () => {
    apiGetMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    renderHook(() => useAdminPaymentNotes({ page: 1, pageSize: 50 }));
    await waitFor(() => expect(apiGetMock).toHaveBeenCalled());
  });

  it('is disabled when no access token', async () => {
    sessionStateRef.accessToken = null;
    const { result } = renderHook(() =>
      useAdminPaymentNotes({ page: 1, pageSize: 50 }),
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(apiGetMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
