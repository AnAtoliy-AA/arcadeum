import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

vi.mock('@/shared/model/useRefreshStore', () => ({
  useRefreshStore: (
    selector: (state: { getSignal: () => number }) => unknown,
  ) => selector({ getSignal: () => 0 }),
}));

vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: (
    selector: (state: { snapshot: { accessToken: string | null } }) => unknown,
  ) => selector({ snapshot: { accessToken: null } }),
}));

vi.mock('@/shared/i18n/context', () => ({
  useLanguage: () => ({ locale: 'en', messages: {}, isReady: true }),
}));

const isDismissedMock = vi.fn();
vi.mock('../lib/dismissedStorage', () => ({
  isDismissed: (...args: unknown[]) => isDismissedMock(...args),
}));

import { apiClient } from '@/shared/lib/api-client';
import { useActiveAnnouncement } from './useActiveAnnouncement';

const apiMock = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  apiMock.get.mockReset();
  isDismissedMock.mockReset();
  isDismissedMock.mockReturnValue(false);
});

describe('useActiveAnnouncement', () => {
  it('returns null when API returns null', async () => {
    apiMock.get.mockResolvedValueOnce({ announcement: null });

    const { result } = renderHook(() => useActiveAnnouncement());

    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(result.current.data).toBeNull();
  });

  it('returns the announcement when not dismissed', async () => {
    apiMock.get.mockResolvedValueOnce({
      announcement: {
        id: 'a',
        severity: 'info',
        updatedAt: 't1',
        title: 'Hello',
      },
    });

    const { result } = renderHook(() => useActiveAnnouncement());

    await waitFor(() => expect(result.current.data?.title).toBe('Hello'));
  });

  it('filters out dismissed non-critical announcement', async () => {
    apiMock.get.mockResolvedValueOnce({
      announcement: {
        id: 'a',
        severity: 'info',
        updatedAt: 't1',
        title: 'Hello',
      },
    });
    isDismissedMock.mockReturnValue(true);

    const { result } = renderHook(() => useActiveAnnouncement());

    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(result.current.data).toBeNull();
  });

  it('keeps critical announcement even when dismissed', async () => {
    apiMock.get.mockResolvedValueOnce({
      announcement: {
        id: 'a',
        severity: 'critical',
        updatedAt: 't1',
        title: 'CRITICAL',
      },
    });
    isDismissedMock.mockReturnValue(true);

    const { result } = renderHook(() => useActiveAnnouncement());

    await waitFor(() => expect(result.current.data?.title).toBe('CRITICAL'));
  });

  it('checks dismissal on { id, updatedAt }', async () => {
    apiMock.get.mockResolvedValueOnce({
      announcement: {
        id: 'a',
        severity: 'warning',
        updatedAt: 't-new',
        title: 'X',
      },
    });

    renderHook(() => useActiveAnnouncement());

    await waitFor(() => expect(isDismissedMock).toHaveBeenCalled());
    expect(isDismissedMock).toHaveBeenCalledWith({
      id: 'a',
      updatedAt: 't-new',
    });
  });
});
