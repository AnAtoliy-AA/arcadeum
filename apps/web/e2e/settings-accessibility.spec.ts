import { expect } from '@playwright/test';
import { test, navigateTo, clearState } from './fixtures/test-utils';

test.describe('Settings Accessibility and UX', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await clearState(page);
    await navigateTo(page, '/settings');
  });

  test('theme buttons should have correct active states', async ({ page }) => {
    const darkBtn = page.getByTestId('theme-dark');
    const lightBtn = page.getByTestId('theme-light');

    // Switch to dark
    await darkBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await expect
      .poll(async () => await darkBtn.getAttribute('aria-pressed'), {
        timeout: 20000,
      })
      .toBe('true');
    await expect(lightBtn).toHaveAttribute('aria-pressed', 'false', {
      timeout: 20000,
    });

    // Switch to light
    await lightBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await expect
      .poll(async () => await lightBtn.getAttribute('aria-pressed'), {
        timeout: 20000,
      })
      .toBe('true');
    await expect(darkBtn).toHaveAttribute('aria-pressed', 'false', {
      timeout: 20000,
    });
  });

  test('language buttons should toggle active states', async ({ page }) => {
    const enBtn = page.getByTestId('lang-btn-en');
    const esBtn = page.getByTestId('lang-btn-es');

    // Default should be English (usually)
    await enBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await expect
      .poll(async () => await enBtn.getAttribute('aria-pressed'), {
        timeout: 20000,
      })
      .toBe('true');

    await esBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await expect
      .poll(async () => await esBtn.getAttribute('aria-pressed'), {
        timeout: 20000,
      })
      .toBe('true');
    await expect(enBtn).toHaveAttribute('aria-pressed', 'false', {
      timeout: 20000,
    });
  });
});
