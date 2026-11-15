import { test, expect } from '@playwright/test';

test.describe('/admin/monitoring cluster operations', () => {
  test('robots.txt disallows /admin/monitoring', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('unauthenticated request rejects cluster status API', async ({
    request,
  }) => {
    const res = await request.get('/api/admin/monitoring/cluster-status');
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('unauthenticated request rejects cluster reload API', async ({
    request,
  }) => {
    const res = await request.post('/api/admin/monitoring/cluster-reload');
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('unauthenticated page access returns 404', async ({ request }) => {
    const res = await request.get('/en/admin/monitoring');
    expect(res.status()).toBe(404);
  });
});
