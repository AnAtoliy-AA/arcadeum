import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Video Presentation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should render video placeholder with custom cover image', async ({
    page,
  }) => {
    await page.waitForSelector('[data-testid="presentation-section"]', {
      timeout: 15000,
    });
    const thumbnail = page.getByTestId('video-thumbnail');
    await expect(thumbnail).toBeVisible({ timeout: 10000 });
    await expect(thumbnail).toHaveAttribute(
      'alt',
      'Arcadeum Trailer Illustration',
    );
    await expect(thumbnail).toHaveAttribute(
      'src',
      '/images/home/video-cover.png',
    );
  });

  test('should play video on click', async ({ page }) => {
    const playButton = page.getByTestId('play-btn');
    await playButton.waitFor({ state: 'visible', timeout: 10000 });
    // Note: scrollIntoViewIfNeeded can fail if element is being re-rendered or detached during scroll.
    // Playwright's click action automatically scrolls to the element.
    await expect(playButton).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000); // Give WebKit a moment to stabilize
    await playButton.click({ force: true });
    await expect(playButton).toBeHidden();
    await expect(page.getByTestId('video-placeholder')).toBeHidden();

    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({ timeout: 15000 });
    await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com/);
  });
});
