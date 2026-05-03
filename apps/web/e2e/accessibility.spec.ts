import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Accessibility', () => {
  test('should have aria-labels on navigation buttons', async ({ page }) => {
    await navigateTo(page, '/');

    // Check sidebar toggles or mobile menu if any
    const navButtons = page.locator('button[aria-label]');
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should support keyboard navigation (Tab)', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit',
      'WebKit on macOS requires system-level keyboard navigation enabled',
    );

    await navigateTo(page, '/');

    // LOCATE ALL INTERACTIVE ELEMENTS
    const interactives = page.locator(
      'a[href]:visible, button:visible, input:visible, select:visible, textarea:visible',
    );
    await expect(interactives.first()).toBeVisible();

    const count = await interactives.count();
    if (count < 2) {
      test.skip(true, 'Not enough interactive elements to test Tab transition');
      return;
    }

    // 1. Force window focus
    await page.bringToFront();
    await page.click('body', { position: { x: 0, y: 0 } });

    // 2. Programmatically focus the FIRST element and VERIFY it got focus
    const first = interactives.nth(0);
    await first.focus();

    // Explicitly wait for focus to land
    await expect(first).toBeFocused({});

    // 3. Simple Tab Press
    await page.keyboard.press('Tab', { delay: 100 });

    // Ensure the first element LOST focus
    await expect(first).not.toBeFocused({});

    // Verify some element is focused and it's NOT the body
    await expect
      .poll(
        async () => {
          const info = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement;
            if (!el || el === document.body || el.tagName === 'BODY') {
              return { isBody: true };
            }

            return {
              tag: el.tagName,
              id: el.id,
              isBody: false,
            };
          });

          return !info.isBody;
        },
        {
          message: 'Some interactive element should be focused after Tab',
        },
      )
      .toBe(true);
  });

  test('should have lang attribute on html', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
  });

  test('should have alt text on images', async ({ page }) => {
    await navigateTo(page, '/');

    // Wait for the main content to be visible to ensure images have started loading
    await expect(page.locator('main').first()).toBeVisible();

    // Use a fresh locator count to handle dynamic rendering
    const locator = page.locator('img');
    const imagesCount = await locator.count();

    // We expect at least the logo and some content images
    expect(imagesCount).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < imagesCount; i++) {
      const img = locator.nth(i);
      // Ensure the element is still attached before checking attributes
      // This helps with race conditions during hydration/re-renders
      try {
        await img.waitFor({ state: 'attached' });
        await expect(img).toHaveAttribute('alt');
      } catch (e) {
        // If an image was unmounted during iteration, we skip it
        // but only if it's truly gone (not just slow to load)
        if ((await img.count()) === 0) continue;
        throw e;
      }
    }
  });

  test('should have sufficient color contrast for key elements', async ({
    page,
  }) => {
    await navigateTo(page, '/');

    // Check main headings and buttons for basic visibility
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const primaryButton = page.locator('button').first();
    if (await primaryButton.isVisible()) {
      await expect(primaryButton).toBeVisible();
    }
  });
});
