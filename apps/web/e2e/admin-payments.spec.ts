import { test, expect } from '@playwright/test';

test.describe('/admin/payments SEO regression', () => {
  test('robots.txt still disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin/payments', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(await res.text()).not.toMatch(/\/admin\/payments/);
  });
});
