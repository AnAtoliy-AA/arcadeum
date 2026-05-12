import { test, expect } from '@playwright/test';

test.describe('/wallet SEO regression', () => {
  test('sitemap.xml includes /wallet', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/\/wallet/);
  });

  test('/wallet route is reachable (unauthenticated returns non-5xx)', async ({
    request,
  }) => {
    // Unauthenticated users will trigger a wallet fetch error (401) inside the
    // Server Component, but the page itself should not 5xx — it either renders
    // an error boundary or redirects to auth. A 200 or 3xx confirms the route
    // is wired up correctly.
    const res = await request.get('/wallet');
    expect(res.status()).toBeLessThan(500);
  });
});
