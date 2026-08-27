import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getAdminDashboardData } from './admin-dashboard.server';

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn((key: string) =>
      key === 'access_token' ? { value: 'test-token' } : undefined,
    ),
  })),
}));

vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `http://localhost:3500${path}`,
}));

describe('getAdminDashboardData', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches ping and db health metrics correctly', async () => {
    global.fetch = vi.fn(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/admin/ping')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      if (urlStr.includes('/admin/db-health')) {
        return new Response(
          JSON.stringify({
            database: 'arcadeum_test',
            totalDocs: 500,
            dataSizeMB: 1.2,
            storageSizeMB: 4.5,
            indexSizeMB: 0.8,
            collections: 5,
            details: {},
          }),
          { status: 200 },
        );
      }
      return new Response('Not found', { status: 404 });
    });

    const result = await getAdminDashboardData();

    expect(result.healthy).toBe(true);
    expect(result.pingOk).toBe(true);
    expect(result.dbHealth?.database).toBe('arcadeum_test');
    expect(result.dbHealth?.totalDocs).toBe(500);
  });

  it('returns fallback data when server responds with error', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('Network error');
    });

    const result = await getAdminDashboardData();

    expect(result.healthy).toBe(false);
    expect(result.pingOk).toBe(false);
    expect(result.dbHealth).toBeNull();
  });
});
