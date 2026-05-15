import { test, expect } from '@playwright/test';

/**
 * The role-based gate behavior of /admin/users isn't e2e'd here for the
 * same reason as ARC-602's admin tests: the Server Component fetch in
 * requireAdmin() runs in the Next.js Node process and Playwright's
 * page.route() only intercepts browser requests. The unit + integration
 * tests for AdminUsersService, AdminUsersController, the api/hooks layer,
 * and UsersTable cover the behavior end-to-end at the function level.
 *
 * What we DO pin here is SEO: robots.txt continues to disallow /admin/
 * (regression after ARC-602), and sitemap.xml does not start advertising
 * /admin/users.
 */

test.describe('/admin/users SEO regression', () => {
  test('robots.txt still disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin/users', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/\/admin\/users/);
  });
});
