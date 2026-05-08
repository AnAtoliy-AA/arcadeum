import { test, expect } from '@playwright/test';

/**
 * Note on the gate-behavior tests below:
 * The /admin route is gated by a Server Component (requireAdmin()) which
 * fetches /auth/me from the Next.js Node process — Playwright's page.route()
 * only intercepts browser requests, so it cannot mock that fetch. The
 * role-based gate behavior is fully covered by:
 *   - apps/be/src/auth/guards/roles.guard.spec.ts (5 unit tests)
 *   - apps/be/src/admin/admin.controller.spec.ts (3 integration tests)
 *   - apps/web/src/entities/session/api/requireAdmin.test.ts (12 unit tests)
 *
 * To make the gate behavior testable end-to-end, future work needs either:
 *   (a) a Node-level fetch interceptor running inside the Next.js test
 *       process, or
 *   (b) a real BE in the e2e environment with admin/non-admin seed users.
 *
 * Until then, the e2e tests below cover the parts that are testable
 * without those: robots.txt and sitemap regression pins.
 */

test.describe('/admin SEO regression', () => {
  test('robots.txt disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/\/admin/);
  });
});
