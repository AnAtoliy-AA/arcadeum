import { expect } from '@playwright/test';
import { test, navigateTo, clearState } from './fixtures/test-utils';

test.describe('Settings Page', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await clearState(page);
    await navigateTo(page, '/settings');
  });

  test('should display settings sections', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /appearance|внешний вид|vörp|aspecto/i,
      }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('heading', { name: /language|язык|мова|idioma/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /about|о приложении|версия|acerca de/i,
      }),
    ).toBeVisible();
  });

  test('should toggle haptics', async ({ page }) => {
    const hapticsRow = page.getByTestId('haptics-row');
    const hapticsCheckbox = hapticsRow.locator('input[type="checkbox"]');

    await expect(hapticsRow).toBeVisible();
    const initialState = await hapticsCheckbox.isChecked();
    await hapticsRow.click();

    await expect
      .poll(async () => await hapticsCheckbox.isChecked(), { timeout: 15000 })
      .toBe(!initialState);
  });

  test('should switch themes', async ({ page }) => {
    const lightThemeBtn = page.getByTestId('theme-light');
    const darkThemeBtn = page.getByTestId('theme-dark');

    await expect(lightThemeBtn).toBeVisible();
    await expect(darkThemeBtn).toBeVisible();

    await darkThemeBtn.click({ force: true });
    await expect
      .poll(async () => await darkThemeBtn.getAttribute('aria-pressed'), {
        timeout: 15000,
      })
      .toBe('true');

    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      'dark',
      { timeout: 15000 },
    );

    // Wait for state to settle
    await page.waitForTimeout(500);

    await lightThemeBtn.click({ force: true });
    await expect
      .poll(async () => await lightThemeBtn.getAttribute('aria-pressed'), {
        timeout: 15000,
      })
      .toBe('true');

    await expect(darkThemeBtn).toHaveAttribute('aria-pressed', 'false', {
      timeout: 15000,
    });
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      'light',
      { timeout: 15000 },
    );
  });

  test('should switch languages', async ({ page }) => {
    const spanishBtn = page.getByTestId('lang-btn-es');
    const englishBtn = page.getByTestId('lang-btn-en');

    await expect(spanishBtn).toBeVisible();
    await spanishBtn.click({ force: true });
    await page.waitForTimeout(1000);

    await expect(page.locator('[data-current-locale]')).toHaveAttribute(
      'data-current-locale',
      'es',
      { timeout: 15000 },
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'es', {
      timeout: 10000,
    });
    await expect(
      page.getByRole('heading', { name: /configuraci/i }),
    ).toBeVisible({ timeout: 15000 });
    await expect(spanishBtn).toHaveAttribute('aria-pressed', 'true', {
      timeout: 15000,
    });

    await englishBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', {
      timeout: 10000,
    });
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(englishBtn).toHaveAttribute('aria-pressed', 'true', {
      timeout: 15000,
    });
    await expect(spanishBtn).toHaveAttribute('aria-pressed', 'false', {
      timeout: 15000,
    });
  });
});
