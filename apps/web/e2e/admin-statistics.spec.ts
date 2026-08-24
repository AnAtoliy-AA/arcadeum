import { test, expect } from '@playwright/test';

test.describe('/admin/statistics SEO and routing', () => {
  test('robots.txt disallows /admin/ and /admin/statistics', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not expose /admin/statistics', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/\/admin\/statistics/);
  });

  test('unauthenticated request redirects away from admin statistics', async ({
    page,
  }) => {
    await page.goto('/en/admin/statistics');
    await expect(page).not.toHaveURL(/\/admin\/statistics/);
  });
});
