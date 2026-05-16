import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from '@/shared/lib/api-client';
import { buildActiveAnnouncementUrl, fetchActiveAnnouncement } from './api';

const apiMock = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  apiMock.get.mockReset();
});

describe('buildActiveAnnouncementUrl', () => {
  it('plain path with no args', () => {
    expect(buildActiveAnnouncementUrl({})).toBe('/announcements/active');
  });

  it('appends locale', () => {
    expect(buildActiveAnnouncementUrl({ locale: 'ru' })).toBe(
      '/announcements/active?locale=ru',
    );
  });
});

describe('fetchActiveAnnouncement', () => {
  it('returns announcement field from response', async () => {
    apiMock.get.mockResolvedValueOnce({
      announcement: { id: 'a', severity: 'info', updatedAt: 't', title: 'X' },
    });

    const result = await fetchActiveAnnouncement({ locale: 'en' });

    expect(result).toEqual({
      id: 'a',
      severity: 'info',
      updatedAt: 't',
      title: 'X',
    });
  });

  it('returns null when announcement is null', async () => {
    apiMock.get.mockResolvedValueOnce({ announcement: null });
    expect(await fetchActiveAnnouncement({})).toBeNull();
  });

  it('passes token when provided', async () => {
    apiMock.get.mockResolvedValueOnce({ announcement: null });
    await fetchActiveAnnouncement({ locale: 'en', accessToken: 'tok' });
    expect(apiMock.get).toHaveBeenCalledWith(
      '/announcements/active?locale=en',
      { token: 'tok' },
    );
  });

  it('omits options when no token', async () => {
    apiMock.get.mockResolvedValueOnce({ announcement: null });
    await fetchActiveAnnouncement({ locale: 'en' });
    expect(apiMock.get).toHaveBeenCalledWith(
      '/announcements/active?locale=en',
      undefined,
    );
  });
});
