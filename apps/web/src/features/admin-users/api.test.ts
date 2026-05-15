import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from '@/shared/lib/api-client';
import { buildAdminUsersUrl, fetchAdminUsers, updateUserRole } from './api';

const apiMock = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  apiMock.get.mockReset();
  apiMock.patch.mockReset();
});

describe('buildAdminUsersUrl', () => {
  it('returns plain path when args empty', () => {
    expect(buildAdminUsersUrl({})).toBe('/admin/users');
  });

  it('serializes page + pageSize', () => {
    expect(buildAdminUsersUrl({ page: 2, pageSize: 25 })).toBe(
      '/admin/users?page=2&pageSize=25',
    );
  });

  it('serializes q + role', () => {
    expect(buildAdminUsersUrl({ q: 'al', role: 'admin' })).toBe(
      '/admin/users?q=al&role=admin',
    );
  });

  it('omits null/undefined args and empty q', () => {
    expect(buildAdminUsersUrl({ q: '', role: null })).toBe('/admin/users');
  });
});

describe('fetchAdminUsers', () => {
  it('calls apiClient.get with built url and token', async () => {
    apiMock.get.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    await fetchAdminUsers({ page: 2 }, 'tok');

    expect(apiMock.get).toHaveBeenCalledWith('/admin/users?page=2', {
      token: 'tok',
    });
  });
});

describe('updateUserRole', () => {
  it('calls apiClient.patch with id, body, and token', async () => {
    apiMock.patch.mockResolvedValueOnce({ id: 'u1', role: 'admin' });

    await updateUserRole('u1', 'admin', 'tok');

    expect(apiMock.patch).toHaveBeenCalledWith(
      '/admin/users/u1/role',
      { role: 'admin' },
      { token: 'tok' },
    );
  });

  it('encodes id with special characters', async () => {
    apiMock.patch.mockResolvedValueOnce({});
    await updateUserRole('id with space', 'free', 'tok');
    const calls = apiMock.patch.mock.calls as unknown as Array<unknown[]>;
    expect(calls[0]?.[0]).toBe('/admin/users/id%20with%20space/role');
  });
});
