import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/shared/lib/api-client';
import {
  buildAdminAnnouncementsUrl,
  fetchAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from './api';

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
});

describe('buildAdminAnnouncementsUrl', () => {
  it('returns plain path when args empty', () => {
    expect(buildAdminAnnouncementsUrl({})).toBe('/admin/announcements');
  });

  it('serializes page + pageSize', () => {
    expect(buildAdminAnnouncementsUrl({ page: 2, pageSize: 25 })).toBe(
      '/admin/announcements?page=2&pageSize=25',
    );
  });

  it('serializes status (omits "all") + severity', () => {
    expect(
      buildAdminAnnouncementsUrl({ status: 'active', severity: 'critical' }),
    ).toBe('/admin/announcements?status=active&severity=critical');
  });

  it("omits status when 'all'", () => {
    expect(buildAdminAnnouncementsUrl({ status: 'all' })).toBe(
      '/admin/announcements',
    );
  });

  it('serializes q', () => {
    expect(buildAdminAnnouncementsUrl({ q: 'hello' })).toBe(
      '/admin/announcements?q=hello',
    );
  });

  it('omits empty q', () => {
    expect(buildAdminAnnouncementsUrl({ q: '   ' })).toBe(
      '/admin/announcements',
    );
  });
});

describe('fetchAdminAnnouncements', () => {
  it('calls apiClient.get with built url and token', async () => {
    apiMock.get.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
    });

    await fetchAdminAnnouncements({ page: 2 }, 'tok');

    expect(apiMock.get).toHaveBeenCalledWith('/admin/announcements?page=2', {
      token: 'tok',
    });
  });
});

describe('createAnnouncement', () => {
  it('posts body with token', async () => {
    apiMock.post.mockResolvedValueOnce({ id: 'x' });
    await createAnnouncement(
      { severity: 'info', content: { en: { title: 'X' } } },
      'tok',
    );
    expect(apiMock.post).toHaveBeenCalledWith(
      '/admin/announcements',
      { severity: 'info', content: { en: { title: 'X' } } },
      { token: 'tok' },
    );
  });
});

describe('updateAnnouncement', () => {
  it('patches with id, body, token', async () => {
    apiMock.patch.mockResolvedValueOnce({ id: 'x' });
    await updateAnnouncement('abc 123', { severity: 'warning' }, 'tok');
    expect(apiMock.patch).toHaveBeenCalledWith(
      '/admin/announcements/abc%20123',
      { severity: 'warning' },
      { token: 'tok' },
    );
  });
});

describe('deleteAnnouncement', () => {
  it('deletes with token', async () => {
    apiMock.delete.mockResolvedValueOnce(undefined);
    await deleteAnnouncement('xyz', 'tok');
    expect(apiMock.delete).toHaveBeenCalledWith('/admin/announcements/xyz', {
      token: 'tok',
    });
  });
});
