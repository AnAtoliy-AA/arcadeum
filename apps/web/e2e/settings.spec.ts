import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Settings Page', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
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
    const hapticsToggle = page.locator('input[type="checkbox"]').first();
    await expect(hapticsToggle).toBeVisible();

    const initialState = await hapticsToggle.isChecked();
    await hapticsToggle.click({ force: true });

    await expect
      .poll(async () => await hapticsToggle.isChecked(), { timeout: 10000 })
      .toBe(!initialState);
  });

  test('should switch themes', async ({ page }) => {
    const lightThemeBtn = page.getByTestId('theme-light');
    const darkThemeBtn = page.getByTestId('theme-dark');

    await expect(lightThemeBtn).toBeVisible();
    await expect(darkThemeBtn).toBeVisible();

    await darkThemeBtn.click();
    await expect(darkThemeBtn).toHaveAttribute('aria-pressed', 'true', {
      timeout: 15000,
    });
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      'dark',
      { timeout: 10000 },
    );

    await lightThemeBtn.click();
    await expect(lightThemeBtn).toHaveAttribute('aria-pressed', 'true', {
      timeout: 15000,
    });
    await expect(darkThemeBtn).toHaveAttribute('aria-pressed', 'false', {
      timeout: 15000,
    });
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      'light',
      { timeout: 10000 },
    );
  });

  test('should switch languages', async ({ page }) => {
    const spanishBtn = page.getByTestId('lang-btn-es');
    const englishBtn = page.getByTestId('lang-btn-en');

    await expect(spanishBtn).toBeVisible();
    await spanishBtn.click();

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

    await englishBtn.click();
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
