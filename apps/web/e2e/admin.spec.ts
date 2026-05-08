import { test, expect, type Page, type Route } from '@playwright/test';
import { mockSession, MOCK_OBJECT_ID } from './fixtures/test-utils';

const profile = (role: string) => ({
  id: MOCK_OBJECT_ID,
  email: 'admin@example.com',
  username: 'adminuser',
  displayName: 'Admin',
  role,
});

const stubAuthMe = async (page: Page, body: unknown, status = 200) => {
  await page.route('**/auth/me', (route: Route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    }),
  );
};

test.describe('/admin gate', () => {
  test('anonymous user gets the local 404 page', async ({ page }) => {
    await stubAuthMe(page, { error: 'unauthorized' }, 401);
    const res = await page.goto('/admin');
    expect(res?.status()).toBe(404);
    await expect(page.getByTestId('admin-not-found')).toBeVisible();
    await expect(page.getByTestId('admin-sidebar')).toHaveCount(0);
  });

  test('logged-in non-admin user gets 404', async ({ page }) => {
    await mockSession(page, { role: 'free' });
    await stubAuthMe(page, profile('free'));
    const res = await page.goto('/admin');
    expect(res?.status()).toBe(404);
    await expect(page.getByTestId('admin-not-found')).toBeVisible();
    await expect(page.getByTestId('admin-sidebar')).toHaveCount(0);
  });

  test('logged-in admin user sees the admin shell', async ({ page }) => {
    await mockSession(page, { role: 'admin' });
    await stubAuthMe(page, profile('admin'));
    await page.goto('/admin');
    await expect(page.getByTestId('admin-sidebar')).toBeVisible();
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('admin-nav-roles')).toBeVisible();
  });

  test('admin page has noindex robots meta', async ({ page }) => {
    await mockSession(page, { role: 'admin' });
    await stubAuthMe(page, profile('admin'));
    await page.goto('/admin');
    const robotsMeta = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robotsMeta).toMatch(/noindex/);
    expect(robotsMeta).toMatch(/nofollow/);
  });

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
