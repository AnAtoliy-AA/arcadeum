import { test, expect } from '@playwright/test';

/**
 * The role-based gate behavior of /admin/shop isn't fully functional in E2E
 * for the same reason as other admin routes: the Server Component fetch in
 * requireAdmin() runs in the Next.js Node process and Playwright's page.route()
 * only intercepts browser requests.
 *
 * What we do pin here is SEO regression: robots.txt disallows /admin/ and
 * sitemap.xml does not advertise /admin/shop.
 */

test.describe('/admin/shop SEO regression', () => {
  test('robots.txt disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin/shop', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/\/admin\/shop/);
  });
});
