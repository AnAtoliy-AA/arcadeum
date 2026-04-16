import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Rewards Page Hydration', () => {
  test('should not have hydration errors in console', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter specifically for hydration errors
        if (
          text.includes('hydration') ||
          text.includes('Hydration') ||
          text.includes('matching') ||
          text.includes('match')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    // Navigate to rewards page
    await navigateTo(page, '/rewards');

    // Wait a bit for hydration to complete
    await page.waitForTimeout(1000);

    // Assert no hydration errors were found
    expect(
      consoleErrors,
      `Found hydration errors: ${consoleErrors.join('\n')}`,
    ).toHaveLength(0);
  });

  test('should render rewards page content successfully', async ({ page }) => {
    await navigateTo(page, '/rewards');

    // Check for main elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/Rewards/i).first()).toBeVisible();
  });
});
