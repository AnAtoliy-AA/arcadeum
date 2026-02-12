import { test, expect } from '@playwright/test';
import { navigateTo } from './fixtures/test-utils';

test.describe('Video Presentation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should render video placeholder with custom cover image', async ({
    page,
  }) => {
    const thumbnail = page.getByTestId('video-thumbnail');
    await expect(thumbnail).toBeVisible();
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
    await expect(playButton).toBeVisible();
    await page.waitForTimeout(1000); // Give WebKit a moment to stabilize
    await playButton.click({ force: true });
    await expect(playButton).toBeHidden();
    await expect(page.getByTestId('video-placeholder')).toBeHidden();

    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({ timeout: 15000 });
    await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com/);
  });
});
