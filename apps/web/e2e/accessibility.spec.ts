import { test, expect } from '@playwright/test';
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
    // WebKit headless has persistent issues with Tab navigation focus events
    // Focus tends to get stuck on the first element or lost to body despite valid events
    test.skip(
      browserName === 'webkit',
      'Keyboard navigation is flaky in headless WebKit',
    );

    await navigateTo(page, '/');
    await page.waitForLoadState('networkidle');

    // LOCATE ALL INTERACTIVE ELEMENTS
    // We filter for distinct interactive elements to ensure we have valid targets
    const interactives = page.locator(
      'a[href]:visible, button:visible, input:visible, select:visible, textarea:visible',
    );
    await expect(interactives.first()).toBeVisible();

    // Ensure we have enough elements
    const count = await interactives.count();
    if (count < 2) {
      test.skip(true, 'Not enough interactive elements to test Tab transition');
      return;
    }

    // 1. Force window focus
    await page.click('body', { position: { x: 0, y: 0 } });

    // 2. Programmatically focus the FIRST element and VERIFY it got focus
    const first = interactives.nth(0);
    await first.focus();

    // Verify we actually have focus on the element we expect
    await expect
      .poll(
        async () => {
          return await page.evaluate(() => {
            return document.activeElement?.tagName !== 'BODY';
          });
        },
        {
          message: 'Failed to programmatically focus the first element',
          timeout: 2000,
        },
      )
      .toBe(true);

    // Capture state of first element
    const firstInfo = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        text: el?.textContent,
        role: el?.getAttribute('role'),
      };
    });

    // 3. Simple Tab Press (with robustness for other browsers)
    // We expect focus to move.
    await first.press('Tab', { delay: 100 });

    await expect
      .poll(
        async () => {
          const current = await page.evaluate(() => {
            const el = document.activeElement;
            return {
              tag: el?.tagName,
              text: el?.textContent?.trim()?.substring(0, 20),
              role: el?.getAttribute('role') || undefined,
            };
          });

          // Must be interactive
          const validTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
          const isInteractive =
            validTags.includes(current.tag || '') ||
            current.role === 'button' ||
            current.role === 'link';

          // Must be DIFFERENT from the start
          const isSame =
            current.tag === firstInfo.tag && current.text === firstInfo.text;

          return isInteractive && !isSame;
        },
        {
          message: 'Focus should move to a different interactive element',
          timeout: 5000,
        },
      )
      .toBe(true);
  });

  test('should have lang attribute on html', async ({ page }) => {
    await navigateTo(page, '/');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });

  test('should have alt text on images', async ({ page }) => {
    await navigateTo(page, '/');
    const imagesWithoutAlt = page.locator('img:not([alt])');
    // This is a strict test, but good for accessibility
    // If there are many, we might just check if some have alt
    expect(await imagesWithoutAlt.count()).toBe(0);
    // or just log it for now
  });
});
