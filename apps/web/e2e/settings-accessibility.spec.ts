import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Settings Accessibility and UX', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/settings');
  });

  test('theme buttons should have correct active states', async ({ page }) => {
    const darkBtn = page.getByTestId('theme-dark');
    const lightBtn = page.getByTestId('theme-light');

    // Switch to dark
    await darkBtn.click();
    await expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(lightBtn).toHaveAttribute('aria-pressed', 'false');

    // Switch to light
    await lightBtn.click();
    await expect(lightBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(darkBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('language buttons should toggle active states', async ({ page }) => {
    const enBtn = page.getByTestId('lang-btn-en');
    const esBtn = page.getByTestId('lang-btn-es');

    // Default should be English (usually)
    await enBtn.click();
    await expect(enBtn).toHaveAttribute('aria-pressed', 'true');

    await esBtn.click();
    await expect(esBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(enBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
