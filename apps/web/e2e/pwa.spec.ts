import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('PWA Features', () => {
  test('manifest file is accessible and includes maskable icon', async ({
    request,
  }) => {
    const response = await request.get('/manifest.json');
    expect(response.ok()).toBe(true);

    const manifest = await response.json();
    expect(manifest.name).toBe('Arcadeum Games');
    expect(manifest.short_name).toBe('Arcadeum Games');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#151718');
    expect(manifest.background_color).toBe('#151718');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const maskable = manifest.icons.find(
      (icon: { purpose?: string }) => icon.purpose === 'maskable',
    );
    expect(maskable).toBeDefined();
    expect(maskable.src).toBe('/icon-maskable-512x512.png');
  });

  test('PWA icons are accessible', async ({ request }) => {
    const icon192 = await request.get('/icon-192x192.png');
    expect(icon192.ok()).toBe(true);
    expect(icon192.headers()['content-type']).toContain('image/png');

    const icon512 = await request.get('/icon-512x512.png');
    expect(icon512.ok()).toBe(true);
    expect(icon512.headers()['content-type']).toContain('image/png');

    const maskableIcon = await request.get('/icon-maskable-512x512.png');
    expect(maskableIcon.ok()).toBe(true);
    expect(maskableIcon.headers()['content-type']).toContain('image/png');

    const appleIcon = await request.get('/apple-touch-icon.png');
    expect(appleIcon.ok()).toBe(true);
    expect(appleIcon.headers()['content-type']).toContain('image/png');
  });

  test('page has PWA meta tags and apple touch icon', async ({ page }) => {
    // Use the shared navigation helper so the test retries on
    // dev-server compile flakes (ChunkLoadError / hydration mismatch)
    // that show up when the full suite is run in parallel.
    await navigateTo(page, '/');

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#151718');

    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveAttribute(
      'href',
      '/apple-touch-icon.png',
    );
  });

  test('offline page is accessible', async ({ page }) => {
    await page.goto('/offline', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: "You're Offline" }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
  });
});
