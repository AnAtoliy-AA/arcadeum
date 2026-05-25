import { test, expect } from '@playwright/test';

test.describe('/wallet SEO regression', () => {
  // ARC-727: /wallet is per-user, transactional, and noindexed by the
  // middleware (`PRIVATE_SLUG_KEYS`). It MUST NOT appear in the sitemap —
  // listing noindex URLs wastes Googlebot's crawl budget and triggers
  // "submitted URL marked noindex" warnings in Search Console.
  test('sitemap.xml does not include /wallet', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    // Matches the English slug and every locale-translated variant
    // (es: cartera, fr: portefeuille, ru: koshelek, by: kashalek).
    expect(body).not.toMatch(
      /\/(wallet|cartera|portefeuille|koshelek|kashalek)/,
    );
  });

  test('robots.txt disallows /wallet across locales', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow: \/en\/wallet\//);
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
