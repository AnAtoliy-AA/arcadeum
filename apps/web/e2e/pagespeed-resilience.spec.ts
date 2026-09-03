import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('PageSpeed resilience and hero LCP', () => {
  test('should load home page with zero uncaught console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await navigateTo(page, '/');

    const heroImage = page.locator(
      'img[alt="Arcadeum glowing board game table background"]',
    );
    await expect(heroImage).toBeAttached();
    await expect(heroImage).not.toHaveClass(/hidden/);

    const liveBadge = page.getByTestId('header-live-pulse-badge');
    await expect(liveBadge).toBeVisible();

    const homeLivePulse = page.getByTestId('home-live-pulse-section');
    await expect(homeLivePulse).toBeVisible();

    const socketErrors = consoleErrors.filter(
      (err) =>
        err.includes('WebSocket') ||
        err.includes('ERR_NAME_NOT_RESOLVED') ||
        err.includes('ERR_TIMED_OUT'),
    );
    expect(socketErrors).toHaveLength(0);
  });
});
