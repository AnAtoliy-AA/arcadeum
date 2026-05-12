import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from '@/shared/lib/api-client';
import { buildAdminPaymentsUrl, fetchAdminPaymentNotes } from './api';

const apiGetMock = apiClient.get as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  apiGetMock.mockReset();
});

describe('buildAdminPaymentsUrl', () => {
  it('returns plain path when args empty', () => {
    expect(buildAdminPaymentsUrl({})).toBe('/admin/payments/notes');
  });

  it('serializes page + pageSize', () => {
    expect(buildAdminPaymentsUrl({ page: 2, pageSize: 25 })).toBe(
      '/admin/payments/notes?page=2&pageSize=25',
    );
  });

  it('serializes q + visibility', () => {
    expect(buildAdminPaymentsUrl({ q: 'al', visibility: 'private' })).toBe(
      '/admin/payments/notes?q=al&visibility=private',
    );
  });

  it("omits visibility when 'all' (default)", () => {
    expect(buildAdminPaymentsUrl({ visibility: 'all' })).toBe(
      '/admin/payments/notes',
    );
  });

  it('omits empty/whitespace q', () => {
    expect(buildAdminPaymentsUrl({ q: '   ' })).toBe('/admin/payments/notes');
  });
});

describe('fetchAdminPaymentNotes', () => {
  it('calls apiClient.get with built URL and token', async () => {
    apiGetMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
    });

    await fetchAdminPaymentNotes({ page: 2 }, 'tok');

    expect(apiGetMock).toHaveBeenCalledWith('/admin/payments/notes?page=2', {
      token: 'tok',
    });
  });
});
