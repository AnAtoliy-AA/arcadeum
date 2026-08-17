import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Modernized Content Pages and Footer', () => {
  test('rewards page renders rich UI, tiers, and JSON-LD', async ({ page }) => {
    await navigateTo(page, routes.rewards);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/Daily Login Streak/i)).toBeVisible();
    await expect(page.getByText(/Active Quests/i)).toBeVisible();
    await expect(page.getByText(/Seasonal Reward Tiers/i)).toBeVisible();
    await expect(page.getByText(/Bronze/i).first()).toBeVisible();
    await expect(page.getByText(/Mythic/i).first()).toBeVisible();

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
  });

  test('help center renders search, categories, and interactive FAQ', async ({
    page,
  }) => {
    await navigateTo(page, routes.help);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/All Systems Operational/i)).toBeVisible();
    await expect(page.getByText(/Getting Started/i).first()).toBeVisible();
    await expect(page.getByText(/Games & Rules/i).first()).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search help/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('download');

    await expect(
      page.getByText(/Do I need to download anything to play/i),
    ).toBeVisible();

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
  });

  test('gaming blog renders hero, categories, and articles', async ({
    page,
  }) => {
    await navigateTo(page, routes.blog);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/Featured Article/i).first()).toBeVisible();
    await expect(page.getByText(/Latest Articles/i)).toBeVisible();
    await expect(page.getByText(/Subscribe to Patch Notes/i)).toBeVisible();

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
  });

  test('developers page renders stats, tabbed code viewer, and specs', async ({
    page,
  }) => {
    await navigateTo(page, routes.developers);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/< 50ms/i)).toBeVisible();
    await expect(page.getByText(/120 req\/min/i)).toBeVisible();
    await expect(page.getByText(/ArcadeumClient/i)).toBeVisible();

    const pythonTab = page.getByRole('button', { name: /Python/i });
    await pythonTab.click();
    await expect(page.getByText(/ArcadeumBot/i)).toBeVisible();

    await expect(page.getByText(/REST API Gateway/i)).toBeVisible();
    await expect(page.getByText(/WebSocket Gateway/i).first()).toBeVisible();
  });

  test('footer does not contain Sea Battle link', async ({ page }) => {
    await navigateTo(page, routes.home);
    await page.waitForLoadState('domcontentloaded');

    const footer = page.locator('footer').first();
    await footer.waitFor({ state: 'attached' });

    const seaBattleLink = footer.locator(
      `a[href="${routes.seaBattleLanding}"]`,
    );
    await expect(seaBattleLink).not.toBeAttached();
  });

  test('footer sections are collapsible on mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(
      !isMobile,
      'Mobile accordion test only applies to mobile viewports',
    );

    await navigateTo(page, routes.home);
    await page.waitForLoadState('domcontentloaded');

    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();

    const platformToggle = footer.getByRole('button', { name: /platform/i });
    await expect(platformToggle).toBeVisible();
    await expect(platformToggle).toHaveAttribute('aria-expanded', 'false');

    await platformToggle.click();
    await expect(platformToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(footer.locator(`a[href="${routes.games}"]`)).toBeVisible();

    await platformToggle.click();
    await expect(platformToggle).toHaveAttribute('aria-expanded', 'false');
  });
});
