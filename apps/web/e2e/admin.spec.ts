import { test, expect } from '@playwright/test';

test.describe('/admin SEO regression', () => {
  test('robots.txt disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin routes', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/\/admin/);
    expect(body).not.toMatch(/\/admin\/gem-packages/);
    expect(body).not.toMatch(/\/admin\/geo-block/);
  });
});
