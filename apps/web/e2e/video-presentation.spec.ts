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
    await page.waitForSelector('[data-testid="presentation-section"]', {});
    const thumbnail = page
      .locator('main')
      .first()
      .getByTestId('video-thumbnail')
      .first();
    await expect(thumbnail).toBeVisible({});
    await expect(thumbnail).toHaveAttribute(
      'alt',
      'Arcadeum Trailer Illustration',
    );
    await expect(thumbnail).toHaveAttribute('src', /video-cover\.webp/);
  });

  test('should play video on click', async ({ page }) => {
    const playButton = page
      .locator('main')
      .first()
      .getByTestId('play-btn')
      .first();
    await playButton.waitFor({ state: 'visible' });
    // Note: scrollIntoViewIfNeeded can fail if element is being re-rendered or detached during scroll.
    // Playwright's click action automatically scrolls to the element.
    await expect(playButton).toBeVisible({});
    await playButton.click({ force: true });
    await expect(playButton).toBeHidden();
    await expect(page.getByTestId('video-placeholder')).toBeHidden();

    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({});
    await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com/);
  });
});
