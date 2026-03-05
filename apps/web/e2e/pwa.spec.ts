import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('PWA Features', () => {
  test('manifest file is accessible', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.ok()).toBe(true);

    const manifest = await response.json();
    expect(manifest.name).toBe('Arcadeum');
    expect(manifest.short_name).toBe('Arcadeum');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#151718');
    expect(manifest.background_color).toBe('#151718');
    expect(manifest.icons).toHaveLength(2);
  });

  test('PWA icons are accessible', async ({ request }) => {
    const icon192 = await request.get('/icon-192x192.png');
    expect(icon192.ok()).toBe(true);
    expect(icon192.headers()['content-type']).toContain('image/png');

    const icon512 = await request.get('/icon-512x512.png');
    expect(icon512.ok()).toBe(true);
    expect(icon512.headers()['content-type']).toContain('image/png');
  });

  test('page has PWA meta tags', async ({ page }) => {
    await page.goto('/');

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#151718');
  });

  test('offline page is accessible', async ({ page }) => {
    await page.goto('/offline');

    await expect(
      page.getByRole('heading', { name: "You're Offline" }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
  });
});
